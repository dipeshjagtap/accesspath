import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
import {
  getCaseForUser,
  isCaseOverdue,
  listAuditForCase,
  listUserVisibleNotes,
  suggestAlternativeProgrammes,
} from "@/modules/cases/service";
import { RECOVERY_TRIGGER_STATUSES } from "@/modules/cases/transitions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support request timeline",
};

export default async function UserCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const view = await getCaseForUser(id, user.id);
  if (!view) notFound();

  const [notes, audit, alternatives] = await Promise.all([
    listUserVisibleNotes(view.caseRow.id),
    listAuditForCase(view.caseRow.id),
    suggestAlternativeProgrammes(view.caseRow.id),
  ]);

  const needsRecovery =
    RECOVERY_TRIGGER_STATUSES.includes(
      view.caseRow.status as (typeof RECOVERY_TRIGGER_STATUSES)[number],
    ) || isCaseOverdue(view.caseRow);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 py-10 section-x">
      <header className="space-y-3">
        <Badge variant="outline">{view.caseRow.caseReference}</Badge>
        <h1 className="text-3xl font-semibold">{view.programmeName}</h1>
        <p className="text-muted-foreground">
          {view.organizationName} · Status:{" "}
          <strong>{view.caseRow.status.replaceAll("_", " ")}</strong>
        </p>
        <p className="text-sm text-muted-foreground">
          Submitted is not accepted. Accepted is not the same as assistance
          delivered.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Current status</CardTitle>
          <CardDescription>
            Next action: {view.caseRow.nextAction ?? "None recorded"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {view.caseRow.statusReason ? (
            <p>Reason: {view.caseRow.statusReason}</p>
          ) : null}
          {view.caseRow.outcome ? <p>Outcome: {view.caseRow.outcome}</p> : null}
          {view.caseRow.outcomeConfirmedBy ? (
            <p>Outcome confirmed by: {view.caseRow.outcomeConfirmedBy}</p>
          ) : null}
          {isCaseOverdue(view.caseRow) ? (
            <p role="status" className="text-destructive">
              This request appears overdue for follow-up (in-app flag only; no
              SMS/email was sent unless configured).
            </p>
          ) : null}
        </CardContent>
      </Card>

      {needsRecovery && alternatives.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Alternative programmes</CardTitle>
            <CardDescription>
              Fresh consent is required before any new organisation receives your
              data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alternatives.map((programme) => (
              <div
                key={programme.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{programme.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {programme.organizationName} · {programme.categoryName}
                  </p>
                </div>
                <Button asChild size="sm">
                  <Link
                    href={`/referral/${view.caseRow.intakeId}?programmeId=${programme.id}&parentCaseId=${view.caseRow.id}`}
                  >
                    Review & consent
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Updates for you</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No user-visible notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <p>{note.note}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {note.createdAt.toISOString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Timeline</h2>
        <ul className="space-y-2">
          {audit.map((event) => (
            <li
              key={event.id}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              <p className="font-medium">{event.action.replaceAll("_", " ")}</p>
              <p className="text-xs text-muted-foreground">
                {event.createdAt.toISOString()}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Button asChild variant="outline">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </main>
  );
}
