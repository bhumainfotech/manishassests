import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  updateMany: vi.fn(),
  recordEvent: vi.fn(),
  recordEvents: vi.fn(),
}));

// why: the command's transaction and authorization behavior must be tested without a PostgreSQL service.
vi.mock("~/database/db.server", () => ({
  db: {
    $transaction: vi.fn(
      async (callback) =>
        await callback({
          jurisdictionUnit: {
            findFirst: mocks.findFirst,
            updateMany: mocks.updateMany,
          },
        })
    ),
  },
}));

// why: event persistence is an external write; assertions verify the command emits it atomically.
vi.mock("~/modules/activity-event/service.server", () => ({
  recordEvent: mocks.recordEvent,
  recordEvents: mocks.recordEvents,
}));

import { transitionJurisdictionUnit } from "./service.server";

describe("transitionJurisdictionUnit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateMany.mockResolvedValue({ count: 1 });
    mocks.recordEvent.mockResolvedValue(undefined);
  });

  it("prevents the submitter from approving their own jurisdiction", async () => {
    mocks.findFirst.mockResolvedValue({
      id: "unit-1",
      status: "IN_REVIEW",
      version: 2,
      submittedById: "maker-1",
    });

    await expect(
      transitionJurisdictionUnit({
        organizationId: "org-1",
        actorUserId: "maker-1",
        id: "unit-1",
        version: 2,
        action: "activate",
      })
    ).rejects.toMatchObject({ status: 403 });
    expect(mocks.updateMany).not.toHaveBeenCalled();
    expect(mocks.recordEvent).not.toHaveBeenCalled();
  });

  it("attributes an approval to a different reviewer and records the event", async () => {
    mocks.findFirst.mockResolvedValue({
      id: "unit-1",
      status: "IN_REVIEW",
      version: 2,
      submittedById: "maker-1",
    });

    await expect(
      transitionJurisdictionUnit({
        organizationId: "org-1",
        actorUserId: "reviewer-1",
        id: "unit-1",
        version: 2,
        action: "activate",
      })
    ).resolves.toEqual({ id: "unit-1", status: "ACTIVE", version: 3 });
    expect(mocks.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ organizationId: "org-1", version: 2 }),
        data: expect.objectContaining({ reviewedById: "reviewer-1" }),
      })
    );
    expect(mocks.recordEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "JURISDICTION_STATUS_CHANGED",
        actorUserId: "reviewer-1",
        fromValue: "IN_REVIEW",
        toValue: "ACTIVE",
      }),
      expect.anything()
    );
  });
});
