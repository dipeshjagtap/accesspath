import { z } from "zod";

export const caseStatusValues = [
  "new",
  "needs_review",
  "ready_for_referral",
  "referred",
  "contacted",
  "assessment_scheduled",
  "support_obtained",
  "blocked",
  "closed_not_completed",
  "closed_completed",
] as const;

export const updateCaseStatusSchema = z.object({
  caseId: z.string().uuid(),
  status: z.enum(caseStatusValues),
  nextAction: z.string().trim().max(500).optional(),
  outcome: z.string().trim().max(500).optional(),
});

export type UpdateCaseStatusInput = z.infer<typeof updateCaseStatusSchema>;
