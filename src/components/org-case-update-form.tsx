"use client";

import { useActionState } from "react";

import {
  updateOrgCaseStatusAction,
  type OrgActionState,
} from "@/app/actions/org";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: OrgActionState = { ok: true };

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

  const options = [currentStatus, ...allowedStatuses.filter((s) => s !== currentStatus)];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update case</CardTitle>
        <CardDescription>
          Only valid transitions are allowed. Record a reason when declining or
          closing without delivery.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="caseId" value={caseId} />
          <input type="hidden" name="organizationId" value={organizationId} />
          {state.message ? (
            <p role="alert" className="text-sm text-destructive">
              {state.message}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={currentStatus}
              className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {options.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="statusReason">Reason (optional)</Label>
            <Textarea id="statusReason" name="statusReason" maxLength={1000} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nextAction">Next action</Label>
            <Input
              id="nextAction"
              name="nextAction"
              defaultValue={currentNextAction}
              maxLength={500}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outcome">Outcome (when closing / delivering)</Label>
            <Input id="outcome" name="outcome" maxLength={500} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="outcomeConfirmedBy">Outcome confirmed by</Label>
            <Input
              id="outcomeConfirmedBy"
              name="outcomeConfirmedBy"
              maxLength={200}
              placeholder="e.g. organisation staff / user report"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userVisibleNote">User-visible update (optional)</Label>
            <Textarea
              id="userVisibleNote"
              name="userVisibleNote"
              maxLength={2000}
            />
          </div>
          <Button type="submit" disabled={pending || options.length === 0}>
            {pending ? "Saving…" : "Save status"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
