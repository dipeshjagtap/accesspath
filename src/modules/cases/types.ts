import { z } from "zod";

import type { CaseStatus } from "@/modules/cases/transitions";

export const caseStatusValues = [
  "submitted",
  "under_review",
  "information_requested",
  "accepted",
  "declined",
  "in_progress",
  "referred_elsewhere",
  "assistance_delivered",
  "partially_delivered",
  "not_delivered",
  "unresolved",
  "closed",
] as const satisfies readonly CaseStatus[];

export const updateCaseStatusSchema = z.object({
  caseId: z.string().uuid(),
  status: z.enum(caseStatusValues),
  statusReason: z.string().trim().max(1000).optional(),
  nextAction: z.string().trim().max(500).optional(),
  outcome: z.string().trim().max(500).optional(),
  outcomeConfirmedBy: z.string().trim().max(200).optional(),
  assignedToUserId: z.string().uuid().optional().nullable(),
  followUpDueAt: z.string().datetime().optional().nullable(),
  userVisibleNote: z.string().trim().max(2000).optional(),
});

export type UpdateCaseStatusInput = z.infer<typeof updateCaseStatusSchema>;

export function generateCaseReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AP-${stamp}-${rand}`;
}
