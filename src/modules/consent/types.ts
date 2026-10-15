import { z } from "zod";

export const CONSENT_VERSION = "2026-10-prd-v2";

export const referralConsentSchema = z.object({
  intakeId: z.string().uuid(),
  organizationId: z.string().uuid(),
  assistanceProgramId: z.string().uuid(),
  purpose: z.string().trim().min(1).max(500),
  fieldsShared: z.array(z.string().trim().min(1)).min(1),
  allowContact: z.literal(true),
  consentVersion: z.literal(CONSENT_VERSION),
  /** When referring after decline/stall, link to the prior case. */
  parentCaseId: z.string().uuid().optional(),
});

export type ReferralConsentInput = z.infer<typeof referralConsentSchema>;
