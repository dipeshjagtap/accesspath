import { z } from "zod";

import type { Case } from "@/lib/db/schema";
import type { CaseStatus } from "@/modules/cases/transitions";

/**
 * Two-sided outcomes: the organisation records delivery, then the person
 * confirms (or disputes) that they actually received the support.
 */

export const receiptAnswers = [
  "received",
  "partly_received",
  "not_received",
] as const;

export type ReceiptAnswer = (typeof receiptAnswers)[number];

export const confirmReceiptSchema = z.object({
  caseId: z.string().uuid(),
  answer: z.enum(receiptAnswers),
  note: z.string().trim().max(1000).optional(),
});

export type ConfirmReceiptInput = z.infer<typeof confirmReceiptSchema>;

/** Statuses where the organisation says support was (at least partly) delivered. */
export const AWAITING_RECEIPT_STATUSES: CaseStatus[] = [
  "assistance_delivered",
  "partially_delivered",
];

export const RECEIPT_ANSWER_META: Record<
  ReceiptAnswer,
  { label: string; orgLabel: string; description: string }
> = {
  received: {
    label: "Yes, I received it",
    orgLabel: "Confirmed received by the person",
    description: "The support arrived as described.",
  },
  partly_received: {
    label: "Only partly",
    orgLabel: "Person reports only partly received",
    description: "Some of it arrived, but something is still missing.",
  },
  not_received: {
    label: "No, not received",
    orgLabel: "Person reports not received",
    description: "The support has not reached me.",
  },
};

type ReceiptFields = Pick<
  Case,
  "status" | "userConfirmation" | "lastUserNotifiedAt" | "userSeenAt"
>;

export function isAwaitingUserConfirmation(caseRow: ReceiptFields): boolean {
  return (
    AWAITING_RECEIPT_STATUSES.includes(caseRow.status as CaseStatus) &&
    !caseRow.userConfirmation
  );
}

/**
 * The person's answer can reopen a case: a partial or missing delivery puts
 * it back in front of the organisation instead of silently closing it.
 */
export function statusAfterReceipt(
  answer: ReceiptAnswer,
  current: CaseStatus,
): CaseStatus {
  if (answer === "partly_received") return "partially_delivered";
  if (answer === "not_received") return "unresolved";
  return current;
}

export function hasUnreadUpdate(caseRow: ReceiptFields): boolean {
  if (!caseRow.lastUserNotifiedAt) return false;
  if (!caseRow.userSeenAt) return true;
  return caseRow.lastUserNotifiedAt.getTime() > caseRow.userSeenAt.getTime();
}

export function needsUserAttention(caseRow: ReceiptFields): boolean {
  return isAwaitingUserConfirmation(caseRow) || hasUnreadUpdate(caseRow);
}
