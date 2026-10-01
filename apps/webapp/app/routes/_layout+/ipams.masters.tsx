import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { data, Form, Link, useLoaderData } from "react-router";
import { ErrorContent } from "~/components/errors";
import Header from "~/components/layout/header";
import type { HeaderData } from "~/components/layout/header/types";
import { Badge } from "~/components/shared/badge";
import { Button } from "~/components/shared/button";
import {
  assetMasterClasses,
  filterAssetMasterClasses,
  workflowMasters,
} from "~/modules/ipams/master-data";
import { appendToMetaTitle } from "~/utils/append-to-meta-title";
import { makeShelfError } from "~/utils/error";
import { error, payload } from "~/utils/http.server";
import {
  PermissionAction,
  PermissionEntity,
} from "~/utils/permissions/permission.data";
import { requirePermission } from "~/utils/roles.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const { userId } = context.getSession();

  try {
    await requirePermission({
      userId,
      request,
      entity: PermissionEntity.category,
      action: PermissionAction.read,
    });

    const search = new URL(request.url).searchParams.get("search") ?? "";
    const classes = filterAssetMasterClasses(search);
    const header: HeaderData = {
      title: "IPAMS master catalogue",
      subHeading:
        "Proposed State asset classes and controlled workflow templates for inception review.",
    };

    return payload({
      header,
      search,
      classes,
      workflows: workflowMasters,
      totals: {
        classes: assetMasterClasses.length,
        subclasses: assetMasterClasses.reduce(
          (total, item) => total + item.subclasses.length,
          0
        ),
        workflows: workflowMasters.length,
      },
    });
  } catch (cause) {
    const reason = makeShelfError(cause, { userId });
    throw data(error(reason), { status: reason.status });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? appendToMetaTitle(data.header.title) : "" },
];

export const handle = {
  breadcrumb: () => <Link to="/ipams/masters">IPAMS master catalogue</Link>,
};

export const ErrorBoundary = () => <ErrorContent />;

export default function IpamsMastersPage() {
  const { classes, search, totals, workflows } = useLoaderData<typeof loader>();

  return (
    <>
      <Header />
      <main className="space-y-6 p-4">
        <section
          aria-label="Catalogue approval status"
          className="rounded-lg border border-warning-300 bg-warning-25 p-4"
        >
          <p className="font-semibold text-warning-800">
            Proposed master data, not an approved State register
          </p>
          <p className="mt-1 text-sm text-warning-700">
            Validate codes, bilingual labels, ownership, finance mappings, and
            approval rules with the Department before production seeding.
          </p>
        </section>

        <section
          aria-label="Catalogue summary"
          className="grid gap-3 sm:grid-cols-3"
        >
          <SummaryCard label="Asset classes" value={totals.classes} />
          <SummaryCard label="Asset subclasses" value={totals.subclasses} />
          <SummaryCard label="Workflow templates" value={totals.workflows} />
        </section>

        <section aria-labelledby="asset-master-heading" className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2
                id="asset-master-heading"
                className="text-lg font-semibold text-gray-900"
              >
                Asset-class master
              </h2>
              <p className="text-sm text-gray-600">
                Search by code, class, or proposed subclass.
              </p>
            </div>
            <Form
              method="get"
              className="flex w-full gap-2 sm:max-w-md"
              role="search"
            >
              <label className="sr-only" htmlFor="master-search">
                Search asset master
              </label>
              <input
                id="master-search"
                type="search"
                name="search"
                defaultValue={search}
                placeholder="For example: water, A05, Anganwadi"
                className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <Button type="submit">Search</Button>
            </Form>
          </div>

          {classes.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {classes.map((assetClass) => (
                <article
                  key={assetClass.code}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {assetClass.code}
                      </p>
                      <h3 className="font-semibold text-gray-900">
                        {assetClass.name}
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {assetClass.natures.map((nature) => (
                        <Badge
                          key={nature}
                          color="#E0EAFF"
                          textColor="#3538CD"
                          withDot={false}
                        >
                          {nature.toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <ul className="mt-3 grid list-inside list-disc gap-1 text-sm text-gray-700 sm:grid-cols-2">
                    {assetClass.subclasses.map((subclass) => (
                      <li key={subclass}>{subclass}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <h3 className="font-semibold text-gray-900">
                No matching asset classes
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Try a broader class, subclass, or code.
              </p>
              <Button to="/ipams/masters" variant="secondary" className="mt-4">
                Clear search
              </Button>
            </div>
          )}
        </section>

        <section
          aria-labelledby="workflow-master-heading"
          className="space-y-3"
        >
          <div>
            <h2
              id="workflow-master-heading"
              className="text-lg font-semibold text-gray-900"
            >
              Workflow master
            </h2>
            <p className="text-sm text-gray-600">
              Templates are read-only until authority, evidence, and escalation
              rules are approved.
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Code and workflow
                  </th>
                  <th scope="col" className="px-4 py-3">
                    State path
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Primary control
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workflows.map((workflow) => (
                  <tr key={workflow.code} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="font-semibold text-gray-900">
                        {workflow.code}
                      </span>
                      <span className="ml-2 text-gray-700">
                        {workflow.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {workflow.states.join(" → ")}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {workflow.control}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">
        {new Intl.NumberFormat("en-IN").format(value)}
      </p>
    </div>
  );
}
