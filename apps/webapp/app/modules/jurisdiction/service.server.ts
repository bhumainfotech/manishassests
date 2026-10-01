import type {
  JurisdictionUnit,
  JurisdictionUnitType,
  Organization,
} from "@prisma/client";
import { db } from "~/database/db.server";
import {
  recordEvent,
  recordEvents,
} from "~/modules/activity-event/service.server";
import { ShelfError, maybeUniqueConstraintViolation } from "~/utils/error";
import { isAllowedJurisdictionParent } from "./hierarchy";
import {
  canReviewJurisdiction,
  getJurisdictionTransition,
  type JurisdictionTransition,
} from "./workflow";

const label = "Jurisdiction" as const;

export async function createJurisdictionUnit({
  organizationId,
  source,
  sourceCode,
  type,
  name,
  nameHi,
  parentId,
  validFrom,
  validTo,
  actorUserId,
}: Pick<
  JurisdictionUnit,
  | "source"
  | "sourceCode"
  | "type"
  | "name"
  | "nameHi"
  | "parentId"
  | "validFrom"
  | "validTo"
> & { organizationId: Organization["id"]; actorUserId: string }) {
  try {
    if (parentId) {
      const parent = await db.jurisdictionUnit.findFirst({
        where: { id: parentId, organizationId },
        select: { id: true, type: true },
      });

      if (!parent) {
        throw new ShelfError({
          cause: null,
          message: "The selected parent jurisdiction is not available",
          additionalData: { organizationId, parentId },
          label,
          status: 400,
          shouldBeCaptured: false,
        });
      }

      if (!isAllowedJurisdictionParent(type, parent.type)) {
        throw new ShelfError({
          cause: null,
          message: `${parent.type} cannot be the parent of ${type}`,
          additionalData: {
            organizationId,
            parentId,
            parentType: parent.type,
            type,
          },
          label,
          status: 400,
          shouldBeCaptured: false,
        });
      }
    }

    return await db.$transaction(async (tx) => {
      const unit = await tx.jurisdictionUnit.create({
        data: {
          organizationId,
          source,
          sourceCode,
          type,
          name,
          nameHi,
          parentId,
          validFrom,
          validTo,
        },
      });
      await recordEvent(
        {
          organizationId,
          actorUserId,
          action: "JURISDICTION_CREATED",
          entityType: "JURISDICTION",
          entityId: unit.id,
          meta: { source, sourceCode, type, parentId },
        },
        tx
      );
      return unit;
    });
  } catch (cause) {
    if (cause instanceof ShelfError) throw cause;
    throw maybeUniqueConstraintViolation(cause, label, {
      additionalData: { organizationId, source, sourceCode, type },
    });
  }
}

export async function getJurisdictionUnits({
  organizationId,
  search,
  type,
  page = 1,
  pageSize = 25,
}: {
  organizationId: Organization["id"];
  search?: string;
  type?: JurisdictionUnitType;
  page?: number;
  pageSize?: number;
}) {
  try {
    const where = {
      organizationId,
      type,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { nameHi: { contains: search, mode: "insensitive" as const } },
              {
                sourceCode: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };
    const [items, total] = await db.$transaction([
      db.jurisdictionUnit.findMany({
        where,
        include: {
          parent: { select: { id: true, name: true, type: true } },
          _count: { select: { children: true } },
        },
        orderBy: [{ type: "asc" }, { name: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.jurisdictionUnit.count({ where }),
    ]);
    return {
      items,
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (cause) {
    throw new ShelfError({
      cause,
      message: "Failed to load jurisdiction units",
      additionalData: { organizationId, search, type },
      label,
    });
  }
}

export async function transitionJurisdictionUnit({
  organizationId,
  actorUserId,
  id,
  version,
  action,
  reason,
}: {
  organizationId: Organization["id"];
  actorUserId: string;
  id: string;
  version: number;
  action: JurisdictionTransition;
  reason?: string;
}) {
  try {
    return await db.$transaction(async (tx) => {
      const current = await tx.jurisdictionUnit.findFirst({
        where: { id, organizationId },
        select: {
          id: true,
          status: true,
          version: true,
          submittedById: true,
        },
      });
      if (!current) {
        throw new ShelfError({
          cause: null,
          label,
          message: "Jurisdiction unit not found",
          status: 404,
          shouldBeCaptured: false,
        });
      }
      const nextStatus = getJurisdictionTransition(action, current.status);
      if (!nextStatus) {
        throw new ShelfError({
          cause: null,
          label,
          message: `Cannot ${action} a ${current.status} jurisdiction`,
          status: 400,
          shouldBeCaptured: false,
        });
      }
      if (!canReviewJurisdiction(action, actorUserId, current.submittedById)) {
        throw new ShelfError({
          cause: null,
          label,
          message:
            "The person who submitted this jurisdiction cannot review the same record.",
          status: 403,
          shouldBeCaptured: false,
        });
      }
      const now = new Date();
      const updated = await tx.jurisdictionUnit.updateMany({
        where: { id, organizationId, version, status: current.status },
        data: {
          status: nextStatus,
          version: { increment: 1 },
          ...(action === "submit"
            ? {
                submittedById: actorUserId,
                submittedAt: now,
                reviewedById: null,
                reviewedAt: null,
              }
            : {}),
          ...(["return", "activate"].includes(action)
            ? { reviewedById: actorUserId, reviewedAt: now }
            : {}),
        },
      });
      if (updated.count !== 1) {
        throw new ShelfError({
          cause: null,
          label,
          message:
            "This jurisdiction changed while you were reviewing it. Refresh and try again.",
          status: 409,
          shouldBeCaptured: false,
        });
      }
      await recordEvent(
        {
          organizationId,
          actorUserId,
          action: "JURISDICTION_STATUS_CHANGED",
          entityType: "JURISDICTION",
          entityId: id,
          field: "status",
          fromValue: current.status,
          toValue: nextStatus,
          meta: { command: action, reason: reason || null },
        },
        tx
      );
      return { id, status: nextStatus, version: version + 1 };
    });
  } catch (cause) {
    if (cause instanceof ShelfError) throw cause;
    throw new ShelfError({
      cause,
      label,
      message: "Failed to change jurisdiction status",
      additionalData: { organizationId, id, action },
    });
  }
}

export async function getJurisdictionUnit({
  organizationId,
  id,
}: {
  organizationId: Organization["id"];
  id: string;
}) {
  const unit = await db.jurisdictionUnit.findFirst({
    where: { id, organizationId },
    include: { parent: { select: { id: true, name: true, type: true } } },
  });
  if (!unit) {
    throw new ShelfError({
      cause: null,
      label,
      message: "Jurisdiction unit not found",
      status: 404,
      shouldBeCaptured: false,
    });
  }
  return unit;
}

export async function getJurisdictionParentOptions({
  organizationId,
  excludeId,
}: {
  organizationId: Organization["id"];
  excludeId?: string;
}) {
  return db.jurisdictionUnit.findMany({
    where: { organizationId, id: excludeId ? { not: excludeId } : undefined },
    select: { id: true, name: true, type: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    take: 500,
  });
}

export async function updateJurisdictionDraft({
  organizationId,
  actorUserId,
  id,
  version,
  name,
  nameHi,
  parentId,
  validFrom,
  validTo,
}: Pick<
  JurisdictionUnit,
  "id" | "version" | "name" | "nameHi" | "parentId" | "validFrom" | "validTo"
> & { organizationId: Organization["id"]; actorUserId: string }) {
  return db.$transaction(async (tx) => {
    const current = await tx.jurisdictionUnit.findFirst({
      where: { id, organizationId },
    });
    if (!current) {
      throw new ShelfError({
        cause: null,
        label,
        message: "Jurisdiction unit not found",
        status: 404,
        shouldBeCaptured: false,
      });
    }
    if (current.status !== "DRAFT") {
      throw new ShelfError({
        cause: null,
        label,
        message: "Only draft jurisdictions can be edited",
        status: 400,
        shouldBeCaptured: false,
      });
    }
    if (parentId) {
      const parent = await tx.jurisdictionUnit.findFirst({
        where: { id: parentId, organizationId },
        select: { type: true },
      });
      if (!parent || !isAllowedJurisdictionParent(current.type, parent.type)) {
        throw new ShelfError({
          cause: null,
          label,
          message: "The selected parent is not valid for this jurisdiction",
          status: 400,
          shouldBeCaptured: false,
        });
      }
    }
    const updated = await tx.jurisdictionUnit.updateMany({
      where: { id, organizationId, version, status: "DRAFT" },
      data: {
        name,
        nameHi,
        parentId,
        validFrom,
        validTo,
        version: { increment: 1 },
      },
    });
    if (updated.count !== 1) {
      throw new ShelfError({
        cause: null,
        label,
        message:
          "This jurisdiction changed while you were editing it. Refresh and try again.",
        status: 409,
        shouldBeCaptured: false,
      });
    }
    const changes = [
      ["name", current.name, name],
      ["nameHi", current.nameHi, nameHi],
      ["parentId", current.parentId, parentId],
      [
        "validFrom",
        current.validFrom?.toISOString() ?? null,
        validFrom?.toISOString() ?? null,
      ],
      [
        "validTo",
        current.validTo?.toISOString() ?? null,
        validTo?.toISOString() ?? null,
      ],
    ].filter(([, from, to]) => from !== to);
    await recordEvents(
      changes.map(([field, fromValue, toValue]) => ({
        organizationId,
        actorUserId,
        action: "JURISDICTION_FIELD_CHANGED" as const,
        entityType: "JURISDICTION" as const,
        entityId: id,
        field: field as string,
        fromValue: fromValue ?? null,
        toValue: toValue ?? null,
      })),
      tx
    );
    return { id, version: version + 1 };
  });
}
