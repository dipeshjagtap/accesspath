import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminVerificationForm } from "@/components/admin-verification-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDb } from "@/lib/db";
import { auditEvents } from "@/lib/db/schema";
import { requireAdmin } from "@/modules/auth/permissions";
import { listAllOrganizations } from "@/modules/organizations/repository";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }

  const orgs = await listAllOrganizations();
  const db = getDb();
  const recentAudit = await db
    .select()
    .from(auditEvents)
    .where(eq(auditEvents.entityType, "organization"))
    .orderBy(desc(auditEvents.createdAt))
    .limit(20);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <Badge variant="secondary">Admin workspace</Badge>
        <h1 className="text-3xl font-semibold">Provider verification</h1>
        <p className="max-w-2xl text-muted-foreground">
          An official registration ID is evidence for review, not a guarantee of
          trustworthiness, service quality, or availability. Never imply
          government endorsement without authorisation.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Organisation review queue</h2>
        {orgs.map((org) => (
          <Card key={org.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base">{org.name}</CardTitle>
                <Badge>{org.verificationStatus.replaceAll("_", " ")}</Badge>
                {org.isFictionalDemo === "true" ? (
                  <Badge variant="outline">Fictional demo</Badge>
                ) : null}
              </div>
              <CardDescription>
                {org.organizationType.replaceAll("_", " ")} ·{" "}
                {org.registrationType ?? "no registration type"} ·{" "}
                {org.registrationNumber ?? "no number"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-medium">Legal name</dt>
                  <dd className="text-muted-foreground">
                    {org.legalName ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Contact</dt>
                  <dd className="text-muted-foreground">{org.contactEmail}</dd>
                </div>
                <div>
                  <dt className="font-medium">Source URL</dt>
                  <dd className="text-muted-foreground break-all">
                    {org.registrationSourceUrl ? (
                      <a
                        className="underline"
                        href={org.registrationSourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {org.registrationSourceUrl}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Last checked</dt>
                  <dd className="text-muted-foreground">
                    {org.verificationCheckedAt?.toISOString() ?? "Never"}
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground">
                Checked: registration evidence and contact channel (demo). Not
                checked: ongoing service quality, government endorsement, or
                clinical outcomes.
              </p>
              <AdminVerificationForm
                organizationId={org.id}
                currentStatus={org.verificationStatus}
                currentNotes={org.verificationNotes ?? ""}
              />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Verification decision history</h2>
        <ul className="space-y-2">
          {recentAudit.map((event) => (
            <li
              key={event.id}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              <p className="font-medium">{event.action}</p>
              <p className="text-xs text-muted-foreground">
                {event.createdAt.toISOString()} · org {event.organizationId}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Button asChild variant="outline">
        <Link href="/">Home</Link>
      </Button>
    </main>
  );
}
