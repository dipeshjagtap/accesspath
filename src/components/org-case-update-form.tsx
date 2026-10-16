"use client";

import { useActionState, useState } from "react";
import { CircleAlert, Loader2 } from "lucide-react";

import {
  updateOrgCaseStatusAction,
  type OrgActionState,
} from "@/app/actions/org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CASE_STATUS_META, caseStatusLabel } from "@/modules/cases/labels";
import {
  TERMINAL_OUTCOME_STATUSES,
  type CaseStatus,
} from "@/modules/cases/transitions";

const initial: OrgActionState = { ok: true };

const REASON_STATUSES: CaseStatus[] = [
  "declined",
  "referred_elsewhere",
  "not_delivered",
  "unresolved",
  "closed",
  "information_requested",
];

const statusCard =
  "flex cursor-pointer flex-col gap-1 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-secondary/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring";

export function OrgCaseUpdateForm({
  caseId,
  organizationId,
  currentStatus,
  allowedStatuses,
  currentNextAction,
}: {
  caseId: string;
  organizationId: string;
  currentStatus: string;
  allowedStatuses: string[];
  currentNextAction: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateOrgCaseStatusAction,
    initial,
  );
  const [selected, setSelected] = useState(currentStatus);

  const nextStatuses = allowedStatuses.filter((s) => s !== currentStatus);
  const needsReason = REASON_STATUSES.includes(selected as CaseStatus);
  const needsOutcome =
    selected !== currentStatus &&
    TERMINAL_OUTCOME_STATUSES.includes(selected as CaseStatus);

  if (nextStatuses.length === 0) {
    return (
      <p className="border-border bg-card text-muted-foreground rounded-2xl border p-5 text-sm">
        This request is {caseStatusLabel(currentStatus).toLowerCase()}. No
        further status changes are possible.
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="border-border bg-card space-y-5 rounded-2xl border p-6 shadow-sm"
    >
      <input type="hidden" name="caseId" value={caseId} />
      <input type="hidden" name="organizationId" value={organizationId} />

      <div>
        <h2 className="font-display text-lg font-semibold">
          Update this request
        </h2>
        <p className="text-muted-foreground text-sm">
          Choose what happens next. The person sees the new status on their
          dashboard.
        </p>
      </div>

      {state.message ? (
        <p
          role="alert"
          className="bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg px-3 py-2 text-sm"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.message}
        </p>
      ) : null}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">New status</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className={statusCard}>
            <input
              type="radio"
              name="status"
              value={currentStatus}
              checked={selected === currentStatus}
              onChange={() => setSelected(currentStatus)}
              className="sr-only"
            />
            <span className="text-sm font-semibold">No status change</span>
            <span className="text-muted-foreground text-xs">
              Keep as {caseStatusLabel(currentStatus).toLowerCase()} and update
              the details below.
            </span>
          </label>
          {nextStatuses.map((status) => (
            <label key={status} className={statusCard}>
              <input
                type="radio"
                name="status"
                value={status}
                checked={selected === status}
                onChange={() => setSelected(status)}
                className="sr-only"
              />
              <span className="text-sm font-semibold">
                {caseStatusLabel(status)}
              </span>
              <span className="text-muted-foreground text-xs">
                {CASE_STATUS_META[status as CaseStatus]?.description}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {needsReason ? (
        <div className="space-y-2">
          <Label htmlFor="statusReason">Reason</Label>
          <Textarea
            id="statusReason"
            name="statusReason"
            maxLength={1000}
            rows={2}
            className="min-h-16"
            placeholder="Explain briefly, so the decision is on record."
          />
        </div>
      ) : null}

      {needsOutcome ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="outcome">What was the outcome?</Label>
            <Input
              id="outcome"
              name="outcome"
              maxLength={500}
              placeholder="e.g. Transport arranged for 6 sessions"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outcomeConfirmedBy">Who confirmed it?</Label>
            <Input
              id="outcomeConfirmedBy"
              name="outcomeConfirmedBy"
              maxLength={200}
              placeholder="e.g. Caseworker, or the person themselves"
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="nextAction">Next action for your team</Label>
        <Input
          id="nextAction"
          name="nextAction"
          defaultValue={currentNextAction}
          maxLength={500}
          placeholder="e.g. Call to confirm appointment times"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="userVisibleNote">
          Message to the person
          <span className="text-muted-foreground ml-1.5 font-normal">
            (optional)
          </span>
        </Label>
        <Textarea
          id="userVisibleNote"
          name="userVisibleNote"
          maxLength={2000}
          rows={3}
          className="min-h-20"
          placeholder="This appears on their dashboard. Keep it short and clear."
        />
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : selected === currentStatus ? (
          "Save details"
        ) : (
          `Mark as ${caseStatusLabel(selected).toLowerCase()}`
        )}
      </Button>
    </form>
  );
}
