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
import { getCurrentUser } from "@/modules/auth/session";
import { listCasesForUser } from "@/modules/cases/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My dashboard",
};

export default async function UserDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const cases = await listCasesForUser(user.id);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <Badge variant="secondary">User workspace</Badge>
        <h1 className="text-3xl font-semibold">
          Hello{user.displayName ? `, ${user.displayName}` : ""}
        </h1>
        <p className="text-muted-foreground">
          Track requests from submitted → accepted → assistance delivered. A
          referral sent is not the same as help received.
        </p>
        <Button asChild>
          <Link href="/intake">Describe a new need</Link>
        </Button>
      </header>

      <section className="space-y-4" aria-labelledby="requests-heading">
        <h2 id="requests-heading" className="text-xl font-semibold">
          Your requests
        </h2>
        {cases.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No requests yet</CardTitle>
              <CardDescription>
                Start an intake, review matched programmes, and consent before a
                request is created.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <ul className="space-y-3">
            {cases.map(({ caseRow, organizationName, programmeName }) => (
              <li key={caseRow.id}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-base">
                        {caseRow.caseReference}
                      </CardTitle>
                      <Badge variant="outline">
                        {caseRow.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <CardDescription>
                      {programmeName} · {organizationName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/cases/${caseRow.id}`}>
                        View timeline
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
