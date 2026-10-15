import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { updatePartnerCaseStatusAction } from "@/app/actions/partner";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { caseStatusValues } from "@/modules/cases/types";
import { getCaseForOrganization } from "@/modules/cases/service";
import { getDemoCaseworker } from "@/modules/organizations/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Partner case",
};

export default async function PartnerCasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;
  const demo = await getDemoCaseworker();
  if (!demo) notFound();

  const view = await getCaseForOrganization(id, demo.organization.id);
  if (!view) notFound();

  const { caseRow, intakeRegion, intakeSummary, organizationName } = view;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" className="px-0">
        <Link href="/partner">← Partner dashboard</Link>
      </Button>

      {from === "consent" ? (
        <p
          role="status"
          className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm"
        >
          Consent recorded. This case is now visible to {organizationName}.
        </p>
      ) : null}

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {caseRow.status.replaceAll("_", " ")}
            </Badge>
            <Badge variant="outline">{intakeRegion}</Badge>
          </div>
          <CardTitle className="text-3xl">Case detail</CardTitle>
          <CardDescription>
            Organization-scoped demo view for {organizationName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed">
          <section>
            <h2 className="mb-1 font-semibold">Consented summary</h2>
            <p className="text-muted-foreground">{intakeSummary}</p>
          </section>
          <section>
            <h2 className="mb-1 font-semibold">Next action</h2>
            <p>{caseRow.nextAction ?? "Not set"}</p>
          </section>
          {caseRow.outcome ? (
            <section>
              <h2 className="mb-1 font-semibold">Outcome</h2>
              <p>{caseRow.outcome}</p>
            </section>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update status</CardTitle>
          <CardDescription>
            Every change is written to the audit log.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePartnerCaseStatusAction} className="space-y-4">
            <input type="hidden" name="caseId" value={caseRow.id} />
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={caseRow.status}
                className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {caseStatusValues.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextAction">Next action</Label>
              <input
                id="nextAction"
                name="nextAction"
                defaultValue={caseRow.nextAction ?? ""}
                className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outcome">Outcome note (optional)</Label>
              <input
                id="outcome"
                name="outcome"
                defaultValue={caseRow.outcome ?? ""}
                className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <SubmitButton
              idleLabel="Save status"
              pendingLabel="Saving…"
              size="lg"
            />
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
