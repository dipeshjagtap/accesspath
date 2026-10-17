import { BellDot, LayoutDashboard, PackageCheck, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { heroPrimaryAction, PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { homePathForUser } from "@/modules/auth/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { caseStatusLabel } from "@/modules/cases/labels";
import {
  hasUnreadUpdate,
  isAwaitingUserConfirmation,
} from "@/modules/cases/receipt";
import { listCasesForUser } from "@/modules/cases/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My support requests",
};

export default async function UserDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const homePath = await homePathForUser(user);
  if (homePath !== "/dashboard") {
    redirect(homePath);
  }

  const cases = await listCasesForUser(user.id);

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="My workspace"
        icon={LayoutDashboard}
        title={`Hello${user.displayName ? `, ${user.displayName}` : ""}`}
        description="Track requests from submitted to accepted to assistance delivered. A referral sent is not the same as help received."
        actions={
          <Link href="/intake" className={heroPrimaryAction}>
            <Plus className="size-4" aria-hidden="true" />
            Describe a new need
          </Link>
        }
      />
      <div className="section-x w-full flex-1 space-y-8 py-10">
        <section className="space-y-4" aria-labelledby="requests-heading">
          <h2 id="requests-heading" className="text-xl font-semibold">
            Your requests
          </h2>
          {cases.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No requests yet</CardTitle>
                <CardDescription>
                  Start an intake, review matched programmes, and consent before
                  a request is created.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <ul className="space-y-3">
              {cases.map(({ caseRow, organizationName, programmeName }) => {
                const awaiting = isAwaitingUserConfirmation(caseRow);
                const unread = hasUnreadUpdate(caseRow);
                return (
                  <li key={caseRow.id}>
                    <Card
                      className={
                        awaiting
                          ? "border-primary border-2"
                          : unread
                            ? "border-primary/60"
                            : undefined
                      }
                    >
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <CardTitle className="text-base">
                            {caseRow.caseReference}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2">
                            {unread && !awaiting ? (
                              <Badge className="gap-1">
                                <BellDot className="size-3.5" aria-hidden />
                                New update
                              </Badge>
                            ) : null}
                            <Badge variant="outline">
                              {caseStatusLabel(caseRow.status)}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>
                          {programmeName} · {organizationName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {awaiting ? (
                          <p className="text-sm">
                            <strong>{organizationName}</strong> says this
                            support has been delivered. Please confirm whether
                            you received it.
                          </p>
                        ) : null}
                        {awaiting ? (
                          <Button asChild size="sm">
                            <Link
                              href={`/dashboard/cases/${caseRow.id}#confirm-receipt`}
                            >
                              <PackageCheck className="size-4" aria-hidden />
                              Confirm what you received
                            </Link>
                          </Button>
                        ) : (
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/cases/${caseRow.id}`}>
                              View timeline
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
