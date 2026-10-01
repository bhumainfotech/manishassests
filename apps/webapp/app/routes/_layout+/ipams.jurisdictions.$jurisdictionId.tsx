import type { InputHTMLAttributes } from "react";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "react-router";
import { data, Form, Link, redirect, useLoaderData } from "react-router";
import { ErrorContent } from "~/components/errors";
import Header from "~/components/layout/header";
import { Button } from "~/components/shared/button";
import { UpdateJurisdictionSchema } from "~/modules/jurisdiction/schemas";
import {
  getJurisdictionParentOptions,
  getJurisdictionUnit,
  updateJurisdictionDraft,
} from "~/modules/jurisdiction/service.server";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { makeShelfError } from "~/utils/error";
import { error, parseData, payload } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";

export async function loader({ context, request, params }: LoaderFunctionArgs) {
  const { userId } = context.getSession();
  try {
    const { organizationId } = await requirePermission({
      userId,
      request,
      entity: PermissionEntity.jurisdiction,
      action: PermissionAction.read,
    });
    const id = params.jurisdictionId ?? "";
    const [unit, parents] = await Promise.all([
      getJurisdictionUnit({ organizationId, id }),
      getJurisdictionParentOptions({ organizationId, excludeId: id }),
    ]);
    return payload({
      header: {
        title: unit.name,
        subHeading: `${unit.type} · ${unit.source}:${unit.sourceCode}`,
      },
      unit,
      parents,
    });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export async function action({ context, request }: ActionFunctionArgs) {
  const { userId } = context.getSession();
  try {
    const { organizationId } = await requirePermission({
      userId,
      request,
      entity: PermissionEntity.jurisdiction,
      action: PermissionAction.update,
    });
    const values = parseData(
      await request.formData(),
      UpdateJurisdictionSchema,
      {
        additionalData: { organizationId, userId },
      }
    );
    await updateJurisdictionDraft({
      organizationId,
      actorUserId: userId,
      ...values,
    });
    return redirect("/ipams/jurisdictions");
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    return data(error(reason), { status: reason.status });
  }
}

export const ErrorBoundary = () => <ErrorContent />;

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.header.title) : "" },
];

export default function JurisdictionDetailPage() {
  const { unit, parents } = useLoaderData<typeof loader>();
  const editable = unit.status === "DRAFT";
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <Link
          className="text-sm text-primary-700 hover:underline"
          to="/ipams/jurisdictions"
        >
          ← Back to jurisdiction master
        </Link>
        {!editable ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            This record is {unit.status.toLowerCase().replaceAll("_", " ")} and
            is read-only. Return it to draft before editing.
          </div>
        ) : null}
        <Form
          method="post"
          className="grid gap-4 rounded-lg border bg-white p-5 sm:grid-cols-2"
        >
          <input type="hidden" name="id" value={unit.id} />
          <input type="hidden" name="version" value={unit.version} />
          <Field
            label="English name"
            name="name"
            defaultValue={unit.name}
            disabled={!editable}
          />
          <Field
            label="Hindi name (optional)"
            name="nameHi"
            defaultValue={unit.nameHi ?? ""}
            disabled={!editable}
          />
          <Field
            label="Valid from (optional)"
            name="validFrom"
            type="date"
            defaultValue={toDateInput(unit.validFrom)}
            disabled={!editable}
          />
          <Field
            label="Valid to (optional)"
            name="validTo"
            type="date"
            defaultValue={toDateInput(unit.validTo)}
            disabled={!editable}
          />
          <div className="sm:col-span-2">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="parentId"
            >
              Parent unit
            </label>
            <select
              id="parentId"
              name="parentId"
              defaultValue={unit.parentId ?? ""}
              disabled={!editable}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">No parent</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.name} ({parent.type})
                </option>
              ))}
            </select>
          </div>
          {editable ? (
            <Button type="submit" className="sm:col-span-2">
              Save draft changes
            </Button>
          ) : null}
        </Form>
      </main>
    </>
  );
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700" htmlFor={name}>
        {label}
      </label>
      <input
        {...props}
        id={name}
        name={name}
        required={!label.includes("optional")}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100"
      />
    </div>
  );
}

function toDateInput(value: string | Date | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}
