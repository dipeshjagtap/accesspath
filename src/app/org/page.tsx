import { Building2, ClipboardList, Plus, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import {
  heroPrimaryAction,
  heroSecondaryAction,
  PageHero,
} from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAnyOrgMember } from "@/modules/auth/permissions";
import { ORG_ROLE_LABELS } from "@/modules/auth/roles";
import { listCasesForOrganization } from "@/modules/cases/service";
import { listProgrammesForOrganization } from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organisation workspace – incoming requests",
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
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="Organisation workspace"
        icon={Building2}
        title={membership.organization.name}
        description={
          <p>
            Verification:{" "}
            <strong className="text-white">
              {membership.organization.verificationStatus.replaceAll("_", " ")}
            </strong>
            {membership.organization.isFictionalDemo === "true"
              ? " · Fictional demo organisation"
              : ""}
            {" · Your role: "}
            <strong className="text-white">
              {ORG_ROLE_LABELS[membership.memberRole]}
            </strong>
          </p>
        }
        actions={
          <>
            {membership.memberRole === "org_admin" ? (
              <Link href="/org/programmes/new" className={heroPrimaryAction}>
                <Plus className="size-4" aria-hidden="true" />
                Publish programme
              </Link>
            ) : null}
            <Link href="/org/programmes" className={heroSecondaryAction}>
              <ClipboardList className="size-4" aria-hidden="true" />
              Manage programmes
            </Link>
            <Link href="/org/members" className={heroSecondaryAction}>
              <Users className="size-4" aria-hidden="true" />
              Members
            </Link>
          </>
        }
      >
        {membership.organization.verificationStatus !== "verified" ? (
          <p className="max-w-2xl rounded-xl bg-white/10 px-4 py-3 text-sm ring-1 ring-white/20">
            This organisation is not verified yet. A platform admin reviews new
            organisations before their programmes are matched to users.
          </p>
        ) : null}
      </PageHero>
      <div className="section-x w-full flex-1 space-y-8 py-10">
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

        <section className="text-muted-foreground space-y-2 text-sm">
          <p>
            Programmes in catalogue for this organisation: {programmes.length}
            (published: {programmes.filter((p) => p.publishedAt).length})
          </p>
        </section>
      </div>
    </main>
  );
}
