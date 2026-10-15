import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAnyOrgMember } from "@/modules/auth/permissions";
import { listCasesForOrganization } from "@/modules/cases/service";
import { listProgrammesForOrganization } from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organisation dashboard",
};

export default async function OrgDashboardPage() {
  let membership;
  try {
    membership = await requireAnyOrgMember([
      "org_admin",
      "caseworker",
      "viewer",
    ]);
  } catch {
    redirect("/login");
  }

  const [cases, programmes] = await Promise.all([
    listCasesForOrganization(membership.organization.id),
    listProgrammesForOrganization(membership.organization.id),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <Badge variant="secondary">Organisation workspace</Badge>
        <h1 className="text-3xl font-semibold">{membership.organization.name}</h1>
        <p className="text-muted-foreground">
          Verification:{" "}
          <strong>
            {membership.organization.verificationStatus.replaceAll("_", " ")}
          </strong>
          {membership.organization.isFictionalDemo === "true"
            ? " · Fictional demo organisation"
            : ""}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/org/programmes">Manage programmes</Link>
          </Button>
          {membership.memberRole === "org_admin" ? (
            <Button asChild>
              <Link href="/org/programmes/new">Publish programme</Link>
            </Button>
          ) : null}
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Incoming requests</h2>
        {cases.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No requests yet</CardTitle>
              <CardDescription>
                Requests appear after a user consents to a published programme
                from a verified organisation.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="space-y-3">
            {cases.map(({ caseRow, programmeName, intakeSummary }) => (
              <li key={caseRow.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-base">
                        {caseRow.caseReference}
                      </CardTitle>
                      <Badge>{caseRow.status.replaceAll("_", " ")}</Badge>
                    </div>
                    <CardDescription>
                      {programmeName}
                      {intakeSummary
                        ? ` · ${intakeSummary.slice(0, 120)}…`
                        : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/org/cases/${caseRow.id}`}>Open case</Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <p>
          Programmes in catalogue for this organisation: {programmes.length}
          (published: {programmes.filter((p) => p.publishedAt).length})
        </p>
      </section>
    </main>
  );
}
