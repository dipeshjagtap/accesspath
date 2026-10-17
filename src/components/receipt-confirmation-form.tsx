"use client";

import { useActionState, useState } from "react";
import { CircleAlert, Loader2, PackageCheck } from "lucide-react";

import {
  confirmReceiptAction,
  type ReceiptActionState,
} from "@/app/actions/case-receipt";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RECEIPT_ANSWER_META,
  receiptAnswers,
  type ReceiptAnswer,
} from "@/modules/cases/receipt";

const initial: ReceiptActionState = { ok: true };

const answerCard =
  "flex cursor-pointer flex-col gap-1 rounded-xl border border-border bg-background p-3 transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-secondary/60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring";

export function ReceiptConfirmationForm({
  caseId,
  organizationName,
  outcome,
}: {
  caseId: string;
  organizationName: string;
  outcome: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    confirmReceiptAction,
    initial,
  );
  const [selected, setSelected] = useState<ReceiptAnswer | null>(null);
  const needsNote = selected !== null && selected !== "received";

  return (
    <form
      action={formAction}
      id="confirm-receipt"
      className="border-primary bg-secondary/40 space-y-5 rounded-2xl border-2 p-6 shadow-sm"
    >
      <input type="hidden" name="caseId" value={caseId} />

      <div className="flex items-start gap-3">
        <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
          <PackageCheck className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold">
            Did you receive this support?
          </h2>
          <p className="text-muted-foreground text-sm">
            {organizationName} has marked this request as delivered
            {outcome ? (
              <>
                : <strong className="text-foreground">{outcome}</strong>
              </>
            ) : null}
            . Your answer is shared with them and recorded on this request.
          </p>
        </div>
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
        <legend className="sr-only">Your answer</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {receiptAnswers.map((answer) => (
            <label key={answer} className={answerCard}>
              <input
                type="radio"
                name="answer"
                value={answer}
                checked={selected === answer}
                onChange={() => setSelected(answer)}
                className="sr-only"
                required
              />
              <span className="text-sm font-semibold">
                {RECEIPT_ANSWER_META[answer].label}
              </span>
              <span className="text-muted-foreground text-xs">
                {RECEIPT_ANSWER_META[answer].description}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {selected ? (
        <div className="space-y-2">
          <Label htmlFor="receipt-note">
            {needsNote ? "What is still missing?" : "Anything to add?"}
            {needsNote ? null : (
              <span className="text-muted-foreground ml-1.5 font-normal">
                (optional)
              </span>
            )}
          </Label>
          <Textarea
            id="receipt-note"
            name="note"
            maxLength={1000}
            rows={2}
            className="min-h-16"
            required={needsNote}
            placeholder={
              needsNote
                ? "e.g. The walker arrived, but physiotherapy has not started."
                : "e.g. Thank you, the sessions have been very helpful."
            }
          />
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={pending || !selected}
        className="w-full"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : selected === "received" || !selected ? (
          "Confirm I received it"
        ) : (
          "Send to the organisation"
        )}
      </Button>
    </form>
  );
}
