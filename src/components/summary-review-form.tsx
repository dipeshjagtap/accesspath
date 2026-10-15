"use client";

import { useActionState } from "react";

import {
  confirmSummaryAndGeneratePlanAction,
  type ActionState,
} from "@/app/actions/intake";
import { ProgressSteps } from "@/components/progress-steps";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: ActionState = { ok: true };

export function SummaryReviewForm({
  intakeId,
  initialSummary,
}: {
  intakeId: string;
  initialSummary: string;
}) {
  const [state, formAction, pending] = useActionState(
    confirmSummaryAndGeneratePlanAction,
    initialState,
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <ProgressSteps current={2} />
      <Card className={pending ? "ring-2 ring-primary/30" : undefined}>
        <CardHeader>
          <CardTitle>Review your needs summary</CardTitle>
          <CardDescription>
            Edit anything that looks wrong. AccessPath will call Gemini on Vertex
            AI when configured, otherwise a grounded deterministic plan. It will
            not invent providers or eligibility rules.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6" aria-busy={pending}>
            <input type="hidden" name="intakeId" value={intakeId} />
            {state.message ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {state.message}
              </p>
            ) : null}
            {pending ? (
              <p
                role="status"
                className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm"
              >
                Building your plan from curated records… This may take a few
                seconds if Vertex AI is available.
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="confirmedSummary">Confirmed summary</Label>
              <Textarea
                id="confirmedSummary"
                name="confirmedSummary"
                required
                defaultValue={initialSummary}
                className="min-h-40"
                disabled={pending}
              />
            </div>
            <div className="rounded-md border border-border bg-secondary/40 px-3 py-3 text-sm text-muted-foreground">
              Reminder: AccessPath does not diagnose conditions, prescribe
              devices, or decide scheme eligibility.
            </div>
            <SubmitButton
              idleLabel="Confirm and get plan"
              pendingLabel="Building plan…"
              size="lg"
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
