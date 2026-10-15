import { z } from "zod";

/**
 * Structured Gemini output schema (PRD §10).
 * resource_ids and source_ids must refer to curated database IDs only.
 */
export const navigationPlanSchema = z.object({
  needs_summary: z.string(),
  suggested_next_steps: z.array(z.string()),
  resource_ids: z.array(z.string().uuid()),
  questions_for_provider: z.array(z.string()),
  unknowns: z.array(z.string()),
  safety_note: z.string(),
  source_ids: z.array(z.string().uuid()),
});

export type NavigationPlan = z.infer<typeof navigationPlanSchema>;

export const PROMPT_VERSION = "v1-grounded-navigation";
