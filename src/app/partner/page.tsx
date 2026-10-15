import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listCasesForOrganization } from "@/modules/cases/service";
import { getDemoCaseworker } from "@/modules/organizations/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Partner dashboard",
};

export default async function PartnerDashboardPage() {
  const demo = await getDemoCaseworker();
  if (!demo) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p>Demo partner staff are not seeded. Run `npm run db:seed`.</p>
      </main>
    );
  }

  const cases = await listCasesForOrganization(demo.organization.id);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <Badge variant="outline">Demo partner workspace</Badge>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          {demo.organization.name}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Signed in for demo as {demo.user.displayName}. Cases are
          organization-scoped. Internal notes stay internal in later phases.
        </p>
      </header>

      {cases.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No referrals yet</CardTitle>
            <CardDescription>
              Complete a user journey and consent to share a referral to see a
              case here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/intake">Start a demo intake</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4">
          {cases.map(({ caseRow, intakeRegion, intakeSummary }) => (
            <li key={caseRow.id}>
              <Card>
                <CardHeader className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {caseRow.status.replaceAll("_", " ")}
                    </Badge>
                    <Badge variant="outline">{intakeRegion}</Badge>
                  </div>
                  <CardTitle className="text-xl">
                    <Link
                      href={`/partner/cases/${caseRow.id}`}
                      className="underline-offset-2 hover:underline"
                    >
                      Case {caseRow.id.slice(0, 8)}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {intakeSummary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Next action: {caseRow.nextAction ?? "Not set"}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
