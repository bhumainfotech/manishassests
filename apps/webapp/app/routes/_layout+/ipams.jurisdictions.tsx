import type { InputHTMLAttributes, ReactNode } from "react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, Form, Link, useLoaderData } from "react-router";
import { ErrorContent } from "~/components/errors";
import Header from "~/components/layout/header";
import type { HeaderData } from "~/components/layout/header/types";
import { Badge } from "~/components/shared/badge";
import { Button } from "~/components/shared/button";
import {
  CreateJurisdictionSchema,
  JurisdictionSearchSchema,
  JurisdictionTransitionSchema,
  jurisdictionUnitTypes,
} from "~/modules/jurisdiction/schemas";
import {
  createJurisdictionUnit,
  getJurisdictionUnits,
  transitionJurisdictionUnit,
} from "~/modules/jurisdiction/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { sendNotification } from "~/utils/emitter/send-notification.server";
import { makeShelfError } from "~/utils/error";
import { error, parseData, payload } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { userId } = context.getSession();
  try {
    const { organizationId } = await requirePermission({
      userId,
      request,
      entity: PermissionEntity.jurisdiction,
      action: PermissionAction.read,
    });
    const url = new URL(request.url);
    const filters = JurisdictionSearchSchema.parse({
      search: url.searchParams.get("search") ?? "",
      type: url.searchParams.get("type") ?? undefined,
      page: url.searchParams.get("page") ?? 1,
    });
    const units = await getJurisdictionUnits({ organizationId, ...filters });
    const header: HeaderData = {
      title: "Jurisdiction master",
      subHeading:
        "Effective administrative units scoped to the current organization.",
    };
    return payload({ header, units, filters });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export async function action({ context, request }: ActionFunctionArgs) {
  const { userId } = context.getSession();
  try {
    const formData = await request.formData();
    const intent = formData.get("intent");
    if (intent && intent !== "create") {
      const { organizationId } = await requirePermission({
        userId,
        request,
        entity: PermissionEntity.jurisdiction,
        action: PermissionAction.update,
      });
      const values = parseData(formData, JurisdictionTransitionSchema, {
        additionalData: { userId, organizationId },
      });
      await transitionJurisdictionUnit({
        organizationId,
        actorUserId: userId,
        id: values.id,
        version: values.version,
        action: values.intent,
        reason: values.reason,
      });
      sendNotification({
        title: "Jurisdiction status updated",
        message: `The jurisdiction was ${
          pastTense[values.intent]
        } successfully.`,
        icon: { name: "success", variant: "success" },
        senderId: userId,
      });
      return payload({ success: true });
    }
    const { organizationId } = await requirePermission({
      userId,
      request,
      entity: PermissionEntity.jurisdiction,
      action: PermissionAction.create,
    });
    const values = parseData(formData, CreateJurisdictionSchema, {
      additionalData: { userId, organizationId },
    });
    await createJurisdictionUnit({
      organizationId,
      actorUserId: userId,
      ...values,
    });
    sendNotification({
      title: "Jurisdiction draft created",
      message: `${values.name} was added as draft master data.`,
      icon: { name: "success", variant: "success" },
      senderId: userId,
    });
    return payload({ success: true });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    return data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.header.title) : "" },
];

export const handle = {
  breadcrumb: () => <Link to="/ipams/jurisdictions">Jurisdictions</Link>,
};

export const ErrorBoundary = () => <ErrorContent />;

export default function JurisdictionsPage() {
  const { filters, units } = useLoaderData<typeof loader>();
  return (
    <>
      <Header />
      <main className="grid gap-6 p-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <section
          className="space-y-4"
          aria-labelledby="jurisdiction-list-heading"
        >
          <div>
            <h2
              id="jurisdiction-list-heading"
              className="text-lg font-semibold text-gray-900"
            >
              Administrative units
            </h2>
            <p className="text-sm text-gray-600">
              Showing {units.items.length} of {units.total} units. Use source
              codes for stable external references.
            </p>
          </div>
          <Form
            method="get"
            className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-3 sm:flex-row"
            role="search"
          >
            <label className="sr-only" htmlFor="jurisdiction-search">
              Search jurisdictions
            </label>
            <input
              id="jurisdiction-search"
              name="search"
              type="search"
              defaultValue={filters.search}
              placeholder="Name or source code"
              className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <label className="sr-only" htmlFor="jurisdiction-type-filter">
              Filter by type
            </label>
            <select
              id="jurisdiction-type-filter"
              name="type"
              defaultValue={filters.type ?? ""}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              {jurisdictionUnitTypes.map((type) => (
                <option key={type} value={type}>
                  {formatLabel(type)}
                </option>
              ))}
            </select>
            <Button type="submit">Apply</Button>
          </Form>
          {units.items.length ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3" scope="col">
                      Unit
                    </th>
                    <th className="px-4 py-3" scope="col">
                      Source
                    </th>
                    <th className="px-4 py-3" scope="col">
                      Parent
                    </th>
                    <th className="px-4 py-3" scope="col">
                      Status
                    </th>
                    <th className="px-4 py-3" scope="col">
                      Workflow action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {units.items.map((unit) => (
                    <tr key={unit.id}>
                      <td className="px-4 py-3">
                        <Link
                          className="font-medium text-primary-700 hover:underline"
                          to={`/ipams/jurisdictions/${unit.id}`}
                        >
                          {unit.name}
                        </Link>
                        {unit.nameHi ? (
                          <div lang="hi" className="text-gray-600">
                            {unit.nameHi}
                          </div>
                        ) : null}
                        <div className="text-xs text-gray-500">
                          {formatLabel(unit.type)} · {unit._count.children}{" "}
                          child units
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {unit.source}
                        <div className="font-mono text-xs">
                          {unit.sourceCode}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {unit.parent?.name ?? "Top level"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          color={
                            unit.status === "ACTIVE" ? "#D1FADF" : "#FEF0C7"
                          }
                          textColor={
                            unit.status === "ACTIVE" ? "#05603A" : "#7A2E0E"
                          }
                          withDot={false}
                        >
                          {formatLabel(unit.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <JurisdictionAction unit={unit} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600">
              No jurisdiction units match the current filters.
            </div>
          )}
          {units.pageCount > 1 ? (
            <nav
              className="flex items-center justify-between"
              aria-label="Jurisdiction pages"
            >
              <PageLink
                page={units.page - 1}
                disabled={units.page <= 1}
                filters={filters}
              >
                Previous
              </PageLink>
              <span className="text-sm text-gray-600">
                Page {units.page} of {units.pageCount}
              </span>
              <PageLink
                page={units.page + 1}
                disabled={units.page >= units.pageCount}
                filters={filters}
              >
                Next
              </PageLink>
            </nav>
          ) : null}
        </section>
        <section
          className="h-fit rounded-lg border border-gray-200 bg-white p-4"
          aria-labelledby="create-jurisdiction-heading"
        >
          <h2
            id="create-jurisdiction-heading"
            className="text-lg font-semibold text-gray-900"
          >
            Add draft unit
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Manual entries remain drafts. Official bulk imports require the
            separate reviewed import workflow.
          </p>
          <p className="mt-2 rounded-md bg-blue-50 p-2 text-xs text-blue-800">
            Maker-checker control: the user who submits a draft cannot activate
            or return that same record.
          </p>
          <Form method="post" className="mt-4 space-y-3">
            <input type="hidden" name="intent" value="create" />
            <Field
              label="Source"
              name="source"
              placeholder="For example: LGD"
            />
            <Field label="Source code" name="sourceCode" />
            <div>
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="create-jurisdiction-type"
              >
                Type
              </label>
              <select
                required
                id="create-jurisdiction-type"
                name="type"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {jurisdictionUnitTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            <Field label="English name" name="name" />
            <Field label="Hindi name (optional)" name="nameHi" lang="hi" />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Valid from (optional)"
                name="validFrom"
                type="date"
              />
              <Field label="Valid to (optional)" name="validTo" type="date" />
            </div>
            <div>
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="parentId"
              >
                Parent unit (optional)
              </label>
              <select
                id="parentId"
                name="parentId"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">No parent</option>
                {units.items.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} ({formatLabel(unit.type)})
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">
              Create draft unit
            </Button>
          </Form>
        </section>
      </main>
    </>
  );
}

function JurisdictionAction({
  unit,
}: {
  unit: { id: string; status: string; version: number };
}) {
  const actions =
    unit.status === "DRAFT"
      ? [{ intent: "submit", label: "Submit for review" }]
      : unit.status === "IN_REVIEW"
      ? [
          { intent: "activate", label: "Activate" },
          { intent: "return", label: "Return" },
        ]
      : unit.status === "ACTIVE"
      ? [{ intent: "retire", label: "Retire" }]
      : [];
  if (!actions.length)
    return <span className="text-xs text-gray-500">No action</span>;
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Form method="post" key={action.intent} className="flex gap-2">
          <input type="hidden" name="intent" value={action.intent} />
          <input type="hidden" name="id" value={unit.id} />
          <input type="hidden" name="version" value={unit.version} />
          {["return", "retire"].includes(action.intent) ? (
            <input
              required
              aria-label={`${action.label} reason`}
              name="reason"
              placeholder="Reason"
              maxLength={500}
              className="w-28 rounded-md border border-gray-300 px-2 py-1 text-xs"
            />
          ) : null}
          <Button
            type="submit"
            variant="secondary"
            className="whitespace-nowrap text-xs"
          >
            {action.label}
          </Button>
        </Form>
      ))}
    </div>
  );
}

const pastTense = {
  submit: "submitted for review",
  return: "returned",
  activate: "activated",
  retire: "retired",
} as const;

function PageLink({
  page,
  disabled,
  filters,
  children,
}: {
  page: number;
  disabled: boolean;
  filters: { search: string; type?: string };
  children: ReactNode;
}) {
  if (disabled)
    return <span className="text-sm text-gray-400">{children}</span>;
  const params = new URLSearchParams({ page: String(page) });
  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);
  return (
    <Link
      className="text-sm font-medium text-primary-700 hover:underline"
      to={`?${params}`}
    >
      {children}
    </Link>
  );
}

function Field({
  label,
  name,
  ...inputProps
}: { label: string; name: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <input
        {...inputProps}
        required={!label.includes("optional")}
        id={name}
        name={name}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
