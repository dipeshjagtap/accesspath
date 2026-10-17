import {
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  FileLock2,
  History,
  ListTodo,
  MapPin,
  MessageSquare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CaseStatusPill, CaseStatusTracker } from "@/components/case-status";
import { OrgCaseUpdateForm } from "@/components/org-case-update-form";
import { PageHero, heroSecondaryAction } from "@/components/page-hero";
import { requireAnyOrgMember } from "@/modules/auth/permissions";
import { caseStatusLabel, formatCaseDate } from "@/modules/cases/labels";
import {
  isAwaitingUserConfirmation,
  RECEIPT_ANSWER_META,
  type ReceiptAnswer,
} from "@/modules/cases/receipt";
import {
  getCaseForOrganization,
  isCaseOverdue,
  listAuditForCase,
  listUserVisibleNotes,
} from "@/modules/cases/service";
import { CASE_TRANSITIONS, type CaseStatus } from "@/modules/cases/transitions";
import { getConsentForCase } from "@/modules/consent/service";
import { getIntakeById } from "@/modules/intakes/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Support request case details",
};

const SHARED_FIELD_LABELS: Record<string, string> = {
  confirmed_summary: "Summary",
  region: "Area",
  practical_needs: "Need, in their words",
  budget_constraint: "Budget",
  access_needs: "Access needs",
  preferred_contact_method: "Preferred contact",
};

type TimelineEntry = {
  id: string;
  at: Date;
  icon: LucideIcon;
  title: string;
  detail?: string | null;
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

  const { caseRow } = view;
  const [audit, notes, consent, intake] = await Promise.all([
    listAuditForCase(caseRow.id),
    listUserVisibleNotes(caseRow.id),
    getConsentForCase(caseRow.id),
    getIntakeById(caseRow.intakeId),
  ]);

  const allowed = CASE_TRANSITIONS[caseRow.status as CaseStatus] ?? [];
  const overdue = isCaseOverdue(caseRow);

  const fieldValues: Record<string, string | null | undefined> = {
    confirmed_summary: intake?.confirmedSummary,
    region: intake?.region,
    practical_needs: intake?.practicalNeeds,
    budget_constraint: intake?.budgetConstraint,
    access_needs: intake?.accessNeeds,
    preferred_contact_method: intake?.preferredContactMethod,
  };
  const sharedFields =
    consent && !consent.withdrawnAt
      ? consent.fieldsShared
          .map((field) => ({
            field,
            label: SHARED_FIELD_LABELS[field] ?? field,
            value: fieldValues[field],
          }))
          .filter((item) => Boolean(item.value))
      : [];

  const timeline: TimelineEntry[] = [
    ...audit.map((event): TimelineEntry => {
      const meta = (event.metadata ?? {}) as Record<string, unknown>;
      if (event.action === "status_changed") {
        const from = String(meta.from ?? "");
        const to = String(meta.to ?? "");
        return {
          id: event.id,
          at: event.createdAt,
          icon: History,
          title:
            from === to
              ? "Details updated"
              : `Status changed to ${caseStatusLabel(to).toLowerCase()}`,
          detail:
            typeof meta.statusReason === "string" ? meta.statusReason : null,
        };
      }
      if (event.action === "user_confirmed_receipt") {
        const answer = String(meta.answer ?? "") as ReceiptAnswer;
        return {
          id: event.id,
          at: event.createdAt,
          icon: ClipboardCheck,
          title: RECEIPT_ANSWER_META[answer]?.orgLabel ?? "Person replied",
          detail: typeof meta.note === "string" ? meta.note : null,
        };
      }
      return {
        id: event.id,
        at: event.createdAt,
        icon: ClipboardCheck,
        title:
          event.action === "alternative_case_created"
            ? "Request received (alternative referral)"
            : event.action === "case_created"
              ? "Request received with consent"
              : event.action.replaceAll("_", " "),
      };
    }),
    ...notes.map((note): TimelineEntry => ({
      id: note.id,
      at: note.createdAt,
      icon: MessageSquare,
      title: "Message sent to the person",
      detail: note.note,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={`Case ${caseRow.caseReference}`}
        icon={ClipboardCheck}
        title={view.programmeName}
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="text-coral size-4" aria-hidden />
              {view.intakeRegion}
            </span>
            <span>Received {formatCaseDate(caseRow.createdAt)}</span>
          </span>
        }
        actions={
          <Link href="/org" className={heroSecondaryAction}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to all requests
          </Link>
        }
      >
        <CaseStatusPill status={caseRow.status} className="bg-white" />
      </PageHero>

      <div className="section-x py-10">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <CaseStatusTracker status={caseRow.status} />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="min-w-0 space-y-8">
              <section
                aria-labelledby="shared-heading"
                className="border-border bg-card rounded-2xl border p-6 shadow-sm"
              >
                <header className="flex items-start gap-3">
                  <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
                    <FileLock2 className="size-5" aria-hidden />
                  </span>
                  <div>
                    <h2
                      id="shared-heading"
                      className="font-display text-lg font-semibold"
                    >
                      What the person shared with you
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Only details they consented to share are shown. Use
                      nothing else to contact them.
                    </p>
                  </div>
                </header>

                {sharedFields.length === 0 ? (
                  <p className="border-border text-muted-foreground mt-5 rounded-xl border border-dashed p-4 text-sm">
                    {consent?.withdrawnAt
                      ? "The person has withdrawn consent. Their details are no longer available."
                      : "No shared details are available for this request."}
                  </p>
                ) : (
                  <dl className="divide-border mt-5 divide-y">
                    {sharedFields.map(({ field, label, value }) => (
                      <div
                        key={field}
                        className="grid gap-1 py-3 sm:grid-cols-[160px_1fr] sm:gap-4"
                      >
                        <dt className="text-muted-foreground text-sm font-medium">
                          {label}
                        </dt>
                        <dd className="text-sm leading-relaxed">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {consent ? (
                  <div className="bg-secondary/50 text-muted-foreground mt-5 flex flex-wrap items-start gap-x-6 gap-y-2 rounded-xl px-4 py-3 text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck
                        className="text-primary size-4"
                        aria-hidden
                      />
                      Consent given {formatCaseDate(consent.consentedAt)}
                    </span>
                    <span>Reason: {consent.purpose}</span>
                    <span>Version {consent.consentVersion}</span>
                  </div>
                ) : null}
              </section>

              <section aria-labelledby="activity-heading" className="space-y-4">
                <h2
                  id="activity-heading"
                  className="font-display text-xl font-semibold"
                >
                  Activity
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

            <aside className="space-y-6">
              <section className="border-border bg-card space-y-3 rounded-2xl border p-6 text-sm shadow-sm">
                <h2 className="font-display text-lg font-semibold">
                  At a glance
                </h2>
                <InfoRow icon={ListTodo} label="Next action">
                  {caseRow.nextAction ?? "None recorded"}
                </InfoRow>
                <InfoRow icon={CalendarClock} label="Follow up by">
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
                {caseRow.statusReason ? (
                  <InfoRow icon={History} label="Last reason">
                    {caseRow.statusReason}
                  </InfoRow>
                ) : null}
                {caseRow.outcome ? (
                  <InfoRow icon={ClipboardCheck} label="Outcome">
                    {caseRow.outcome}
                    {caseRow.outcomeConfirmedBy
                      ? ` (confirmed by ${caseRow.outcomeConfirmedBy})`
                      : ""}
                  </InfoRow>
                ) : null}
                <InfoRow icon={ClipboardCheck} label="Person's confirmation">
                  {caseRow.userConfirmation ? (
                    <span
                      className={
                        caseRow.userConfirmation === "received"
                          ? "font-semibold text-emerald-700"
                          : "text-destructive font-semibold"
                      }
                    >
                      {RECEIPT_ANSWER_META[caseRow.userConfirmation].orgLabel}
                      {caseRow.userConfirmationNote
                        ? `: “${caseRow.userConfirmationNote}”`
                        : ""}
                    </span>
                  ) : isAwaitingUserConfirmation(caseRow) ? (
                    "Waiting for the person to confirm"
                  ) : (
                    "Asked once support is marked delivered"
                  )}
                </InfoRow>
              </section>

              <OrgCaseUpdateForm
                caseId={caseRow.id}
                organizationId={membership.organization.id}
                currentStatus={caseRow.status}
                allowedStatuses={allowed}
                currentNextAction={caseRow.nextAction ?? ""}
              />
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
