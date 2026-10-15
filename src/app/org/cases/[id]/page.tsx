import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { OrgCaseUpdateForm } from "@/components/org-case-update-form";
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
import {
  getCaseForOrganization,
  listAuditForCase,
} from "@/modules/cases/service";
import { CASE_TRANSITIONS, type CaseStatus } from "@/modules/cases/transitions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Case detail",
};

export default async function OrgCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let membership;
  try {
    membership = await requireAnyOrgMember(["org_admin", "caseworker"]);
  } catch {
    redirect("/login");
  }

  const { id } = await params;
  const view = await getCaseForOrganization(id, membership.organization.id);
  if (!view) notFound();

  const audit = await listAuditForCase(view.caseRow.id);
  const allowed = CASE_TRANSITIONS[view.caseRow.status as CaseStatus] ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <Badge variant="outline">{view.caseRow.caseReference}</Badge>
        <h1 className="text-3xl font-semibold">{view.programmeName}</h1>
        <p className="text-muted-foreground">
          Current status:{" "}
          <strong>{view.caseRow.status.replaceAll("_", " ")}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Region: {view.intakeRegion}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Intake summary shared with consent</CardTitle>
          <CardDescription>
            Only fields the user consented to should be relied on for contact.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          {view.intakeSummary ?? "No summary recorded."}
        </CardContent>
      </Card>

      <OrgCaseUpdateForm
        caseId={view.caseRow.id}
        organizationId={membership.organization.id}
        currentStatus={view.caseRow.status}
        allowedStatuses={allowed}
        currentNextAction={view.caseRow.nextAction ?? ""}
      />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Audit trail</h2>
        <ul className="space-y-2">
          {audit.map((event) => (
            <li
              key={event.id}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              <p className="font-medium">{event.action}</p>
              <p className="text-xs text-muted-foreground">
                {event.createdAt.toISOString()}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Button asChild variant="outline">
        <Link href="/org">Back to organisation dashboard</Link>
      </Button>
    </main>
  );
}
