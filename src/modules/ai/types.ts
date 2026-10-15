import type { NavigationPlan } from "@/modules/plans/types";
import type {
  PublicAssistanceProgram,
  PublicResource,
} from "@/modules/resources/types";

export type VertexAiUsageMetrics = {
  modelName: string;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  estimatedCostUsd: number | null;
  success: boolean;
  errorMessage?: string;
};

export type GroundedPlanRequest = {
  confirmedSummary: string;
  region: string;
  resources: PublicResource[];
  programs: PublicAssistanceProgram[];
};

export type GroundedPlanResult =
  | {
      ok: true;
      plan: NavigationPlan;
      usage: VertexAiUsageMetrics;
      source: "vertex_ai" | "gemini_api";
    }
  | {
      ok: false;
      plan: NavigationPlan;
      usage: VertexAiUsageMetrics;
      source: "deterministic_fallback";
      reason: string;
    };
