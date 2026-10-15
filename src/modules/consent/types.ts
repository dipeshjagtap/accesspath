import { z } from "zod";

export const CONSENT_VERSION = "2026-10-hackathon-v1";

export const referralConsentSchema = z.object({
  intakeId: z.string().uuid(),
  organizationId: z.string().uuid(),
  purpose: z.string().trim().min(1).max(500),
  fieldsShared: z.array(z.string().trim().min(1)).min(1),
  allowContact: z.literal(true),
  consentVersion: z.literal(CONSENT_VERSION),
});

export type ReferralConsentInput = z.infer<typeof referralConsentSchema>;
