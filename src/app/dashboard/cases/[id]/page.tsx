import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  CircleCheck,
  ClipboardCheck,
  History,
  ListTodo,
  MessageSquare,
  PackageCheck,
  Route,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CaseStatusPill, CaseStatusTracker } from "@/components/case-status";
import { heroSecondaryAction, PageHero } from "@/components/page-hero";
import { ReceiptConfirmationForm } from "@/components/receipt-confirmation-form";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/modules/auth/session";
import { caseStatusLabel, formatCaseDate } from "@/modules/cases/labels";
import {
  isAwaitingUserConfirmation,
  RECEIPT_ANSWER_META,
  type ReceiptAnswer,
} from "@/modules/cases/receipt";
import {
  getCaseForUser,
  isCaseOverdue,
  listAuditForCase,
  listUserVisibleNotes,
  markCaseSeenByUser,
  suggestAlternativeProgrammes,
} from "@/modules/cases/service";
import { RECOVERY_TRIGGER_STATUSES } from "@/modules/cases/transitions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support request timeline",
};

type TimelineEntry = {
  id: string;
  at: Date;
  icon: LucideIcon;
  title: string;
  detail?: string | null;
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

  const { caseRow } = view;
  const [notes, audit, alternatives] = await Promise.all([
    listUserVisibleNotes(caseRow.id),
    listAuditForCase(caseRow.id),
    suggestAlternativeProgrammes(caseRow.id),
    markCaseSeenByUser(caseRow.id, user.id),
  ]);

  const awaitingConfirmation = isAwaitingUserConfirmation(caseRow);
  const confirmation = caseRow.userConfirmation;
  const overdue = isCaseOverdue(caseRow);
  const needsRecovery =
    RECOVERY_TRIGGER_STATUSES.includes(
      caseRow.status as (typeof RECOVERY_TRIGGER_STATUSES)[number],
    ) || overdue;

  const timeline: TimelineEntry[] = [
    ...audit.map((event): TimelineEntry => {
      const meta = (event.metadata ?? {}) as Record<string, unknown>;
      switch (event.action) {
        case "user_confirmed_receipt": {
          const answer = meta.answer as ReceiptAnswer | undefined;
          return {
            id: event.id,
            at: event.createdAt,
            icon: PackageCheck,
            title: answer
              ? `You answered: ${RECEIPT_ANSWER_META[answer].label}`
              : "You replied",
            detail:
              typeof meta.note === "string" && meta.note ? meta.note : null,
          };
        }
        case "status_changed": {
          const from = String(meta.from ?? "");
          const to = String(meta.to ?? "");
          return {
            id: event.id,
            at: event.createdAt,
            icon: History,
            title:
              from === to
                ? "Details updated by the organisation"
                : `Status changed to ${caseStatusLabel(to).toLowerCase()}`,
            detail:
              typeof meta.statusReason === "string" ? meta.statusReason : null,
          };
        }
        case "case_created":
          return {
            id: event.id,
            at: event.createdAt,
            icon: ClipboardCheck,
            title: "Request sent with your consent",
          };
        case "alternative_case_created":
          return {
            id: event.id,
            at: event.createdAt,
            icon: ClipboardCheck,
            title: "Request sent to an alternative programme",
          };
        default:
          return {
            id: event.id,
            at: event.createdAt,
            icon: History,
            title: event.action.replaceAll("_", " "),
          };
      }
    }),
    ...notes.map((note): TimelineEntry => ({
      id: note.id,
      at: note.createdAt,
      icon: MessageSquare,
      title: "Update from the organisation",
      detail: note.note,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={`Request ${caseRow.caseReference}`}
        icon={Route}
        title={view.programmeName}
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="text-coral size-4" aria-hidden />
              {view.organizationName}
            </span>
            <span>Sent {formatCaseDate(caseRow.createdAt)}</span>
          </span>
        }
        actions={
          <Link href="/dashboard" className={heroSecondaryAction}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to my requests
          </Link>
        }
      >
        <CaseStatusPill status={caseRow.status} className="bg-white" />
      </PageHero>

      <div className="section-x py-10">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <CaseStatusTracker status={caseRow.status} />

          {awaitingConfirmation ? (
            <ReceiptConfirmationForm
              caseId={caseRow.id}
              organizationName={view.organizationName}
              outcome={caseRow.outcome}
            />
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-8">
              {confirmation ? (
                <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm">
                  <header className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <CircleCheck className="size-5" aria-hidden />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-semibold">
                        Your confirmation
                      </h2>
                      <p className="text-sm text-emerald-900/80">
                        {RECEIPT_ANSWER_META[confirmation].label}
                        {caseRow.userConfirmedAt
                          ? ` · ${formatCaseDate(caseRow.userConfirmedAt)}`
                          : null}
                      </p>
                    </div>
                  </header>
                  {caseRow.userConfirmationNote ? (
                    <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm leading-relaxed">
                      &ldquo;{caseRow.userConfirmationNote}&rdquo;
                    </p>
                  ) : null}
                  <p className="text-muted-foreground mt-3 text-sm">
                    {confirmation === "received"
                      ? "Thank you. This request is complete, confirmed by you and the organisation."
                      : "The organisation has been told and can pick this up again. You can also choose another programme below."}
                  </p>
                </section>
              ) : null}

              {needsRecovery && alternatives.length > 0 ? (
                <section
                  aria-labelledby="alternatives-heading"
                  className="space-y-4"
                >
                  <div>
                    <h2
                      id="alternatives-heading"
                      className="font-display text-xl font-semibold"
                    >
                      Other programmes that may help
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Fresh consent is required before any new organisation
                      receives your details.
                    </p>
                  </div>
                  <ul className="grid gap-3">
                    {alternatives.map((programme) => (
                      <li
                        key={programme.id}
                        className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-brand-dark font-semibold">
                            {programme.name}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {programme.organizationName} ·{" "}
                            {programme.categoryName}
                          </p>
                        </div>
                        <Button asChild>
                          <Link
                            href={`/referral/${caseRow.intakeId}?programmeId=${programme.id}&parentCaseId=${caseRow.id}`}
                          >
                            Review & consent
                            <ArrowRight className="size-4" aria-hidden />
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section aria-labelledby="updates-heading" className="space-y-4">
                <h2
                  id="updates-heading"
                  className="font-display text-xl font-semibold"
                >
                  Messages for you
                </h2>
                {notes.length === 0 ? (
                  <p className="border-border text-muted-foreground bg-card rounded-2xl border border-dashed p-5 text-sm">
                    No messages from the organisation yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {notes.map((note) => (
                      <li
                        key={note.id}
                        className="border-border bg-card rounded-2xl border p-5 shadow-sm"
                      >
                        <p className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
                          <MessageSquare className="size-3.5" aria-hidden />
                          From {view.organizationName}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed">
                          {note.note}
                        </p>
                        <p className="text-muted-foreground mt-2 text-xs">
                          {formatCaseDate(note.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="timeline-heading" className="space-y-4">
                <h2
                  id="timeline-heading"
                  className="font-display text-xl font-semibold"
                >
                  Timeline
                </h2>
                <ol className="border-border relative space-y-5 border-l pl-6">
                  {timeline.map(
                    ({ id: entryId, at, icon: Icon, title, detail }) => (
                      <li key={entryId} className="relative">
                        <span className="border-border bg-card absolute top-0 -left-[37px] flex size-6 items-center justify-center rounded-full border">
                          <Icon className="text-primary size-3.5" aria-hidden />
                        </span>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="text-muted-foreground text-xs">
                          {formatCaseDate(at)}
                        </p>
                        {detail ? (
                          <p className="bg-muted/60 mt-2 rounded-lg px-3 py-2 text-sm leading-relaxed">
                            {detail}
                          </p>
                        ) : null}
                      </li>
                    ),
                  )}
                </ol>
              </section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <section className="border-border bg-card space-y-4 rounded-2xl border p-6 text-sm shadow-sm">
                <h2 className="font-display text-lg font-semibold">
                  At a glance
                </h2>
                <InfoRow icon={ListTodo} label="Next step">
                  {caseRow.nextAction ?? "None recorded yet"}
                </InfoRow>
                {caseRow.outcome ? (
                  <InfoRow icon={ClipboardCheck} label="Outcome">
                    {caseRow.outcome}
                    {caseRow.outcomeConfirmedBy
                      ? ` (confirmed by ${caseRow.outcomeConfirmedBy})`
                      : ""}
                  </InfoRow>
                ) : null}
                {caseRow.statusReason ? (
                  <InfoRow icon={History} label="Reason">
                    {caseRow.statusReason}
                  </InfoRow>
                ) : null}
                <InfoRow icon={CalendarClock} label="Follow-up">
                  {caseRow.followUpDueAt ? (
                    <span
                      className={
                        overdue ? "text-destructive font-semibold" : undefined
                      }
                    >
                      {formatCaseDate(caseRow.followUpDueAt)}
                      {overdue ? " · overdue" : ""}
                    </span>
                  ) : (
                    "Not set"
                  )}
                </InfoRow>
              </section>

              <p className="text-muted-foreground text-xs leading-relaxed">
                Submitted is not the same as accepted. Accepted is not the same
                as support delivered. You always decide what is shared next.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
      <div>
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <p>{children}</p>
      </div>
    </div>
  );
}
