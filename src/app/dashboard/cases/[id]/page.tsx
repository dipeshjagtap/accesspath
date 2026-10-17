import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ReceiptConfirmationForm } from "@/components/receipt-confirmation-form";
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
  markCaseSeenByUser,
  suggestAlternativeProgrammes,
} from "@/modules/cases/service";
import { caseStatusLabel, formatCaseDate } from "@/modules/cases/labels";
import {
  isAwaitingUserConfirmation,
  RECEIPT_ANSWER_META,
  type ReceiptAnswer,
} from "@/modules/cases/receipt";
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
    markCaseSeenByUser(view.caseRow.id, user.id),
  ]);

  const awaitingConfirmation = isAwaitingUserConfirmation(view.caseRow);
  const confirmation = view.caseRow.userConfirmation;

  const needsRecovery =
    RECOVERY_TRIGGER_STATUSES.includes(
      view.caseRow.status as (typeof RECOVERY_TRIGGER_STATUSES)[number],
    ) || isCaseOverdue(view.caseRow);

  return (
    <main className="section-x mx-auto w-full max-w-3xl flex-1 space-y-8 py-10">
      <header className="space-y-3">
        <Badge variant="outline">{view.caseRow.caseReference}</Badge>
        <h1 className="text-3xl font-semibold">{view.programmeName}</h1>
        <p className="text-muted-foreground">
          {view.organizationName} · Status:{" "}
          <strong>{caseStatusLabel(view.caseRow.status)}</strong>
        </p>
        <p className="text-muted-foreground text-sm">
          Submitted is not accepted. Accepted is not the same as assistance
          delivered.
        </p>
      </header>

      {awaitingConfirmation ? (
        <ReceiptConfirmationForm
          caseId={view.caseRow.id}
          organizationName={view.organizationName}
          outcome={view.caseRow.outcome}
        />
      ) : null}

      {confirmation ? (
        <Card>
          <CardHeader>
            <CardTitle>Your confirmation</CardTitle>
            <CardDescription>
              {RECEIPT_ANSWER_META[confirmation].label}
              {view.caseRow.userConfirmedAt
                ? ` · ${formatCaseDate(view.caseRow.userConfirmedAt)}`
                : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm">
            {view.caseRow.userConfirmationNote ? (
              <p>&ldquo;{view.caseRow.userConfirmationNote}&rdquo;</p>
            ) : null}
            <p>
              {confirmation === "received"
                ? "Thank you. This request is complete, confirmed by you and the organisation."
                : "The organisation has been told and can pick this up again. You can also choose another programme below."}
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Current status</CardTitle>
          <CardDescription>
            Next action: {view.caseRow.nextAction ?? "None recorded"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
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
              Fresh consent is required before any new organisation receives
              your data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alternatives.map((programme) => (
              <div
                key={programme.id}
                className="border-border flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{programme.name}</p>
                  <p className="text-muted-foreground text-sm">
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
          <p className="text-muted-foreground text-sm">
            No user-visible notes yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="border-border rounded-lg border px-3 py-2 text-sm"
              >
                <p>{note.note}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatCaseDate(note.createdAt)}
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
              className="border-border rounded-lg border px-3 py-2 text-sm"
            >
              <p className="font-medium">{timelineLabel(event)}</p>
              <p className="text-muted-foreground text-xs">
                {formatCaseDate(event.createdAt)}
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

function timelineLabel(event: { action: string; metadata: unknown }): string {
  const meta = (event.metadata ?? {}) as Record<string, unknown>;
  switch (event.action) {
    case "case_created":
      return "Request sent with your consent";
    case "alternative_case_created":
      return "Request sent to an alternative programme";
    case "status_changed":
      return meta.from === meta.to
        ? "Details updated by the organisation"
        : `Status changed to ${caseStatusLabel(String(meta.to ?? "")).toLowerCase()}`;
    case "user_confirmed_receipt": {
      const answer = meta.answer as ReceiptAnswer | undefined;
      return answer
        ? `You answered: ${RECEIPT_ANSWER_META[answer].label}`
        : "You replied";
    }
    default:
      return event.action.replaceAll("_", " ");
  }
}
