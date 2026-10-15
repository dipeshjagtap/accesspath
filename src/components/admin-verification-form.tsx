"use client";

import { useActionState } from "react";

import {
  decideVerificationAction,
  type AdminActionState,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: AdminActionState = { ok: true };

const STATUSES = [
  "pending",
  "in_review",
  "verified",
  "rejected",
  "suspended",
  "recheck_required",
] as const;

export function AdminVerificationForm({
  organizationId,
  currentStatus,
  currentNotes,
}: {
  organizationId: string;
  currentStatus: string;
  currentNotes: string;
}) {
  const [state, formAction, pending] = useActionState(
    decideVerificationAction,
    initial,
  );

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-border p-3">
      <input type="hidden" name="organizationId" value={organizationId} />
      {state.message ? (
        <p
          role="status"
          className={
            state.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor={`status-${organizationId}`}>Decision</Label>
        <select
          id={`status-${organizationId}`}
          name="verificationStatus"
          defaultValue={currentStatus}
          className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`notes-${organizationId}`}>Reviewer notes</Label>
        <Textarea
          id={`notes-${organizationId}`}
          name="verificationNotes"
          defaultValue={currentNotes}
          maxLength={2000}
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save decision"}
      </Button>
    </form>
  );
}
