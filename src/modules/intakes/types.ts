import { z } from "zod";

/** Intake fields from PRD FR-02 — minimum necessary for navigation. */
export const intakeInputSchema = z.object({
  displayName: z.string().trim().max(120).optional(),
  askingFor: z.enum(["self", "someone_else"]).default("self"),
  region: z.string().trim().min(1).max(200),
  travelRange: z.string().trim().max(120).optional(),
  practicalNeeds: z.string().trim().min(1).max(2000),
  supportCategory: z.literal("mobility_aid").default("mobility_aid"),
  budgetConstraint: z.string().trim().max(200).optional(),
  preferredLanguage: z.string().trim().max(40).default("en"),
  preferredContactMethod: z.string().trim().max(120).optional(),
  professionalRecommendationStatus: z
    .enum(["yes", "no", "unsure", "prefer_not_to_say"])
    .optional(),
  accessNeeds: z.string().trim().max(500).optional(),
});

export type IntakeInput = z.infer<typeof intakeInputSchema>;

export const confirmedSummarySchema = z.object({
  intakeId: z.string().uuid(),
  confirmedSummary: z.string().trim().min(1).max(4000),
});

export type ConfirmedSummaryInput = z.infer<typeof confirmedSummarySchema>;
