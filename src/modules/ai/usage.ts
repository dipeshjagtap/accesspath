/**
 * Model usage / cost tracking helpers for Vertex AI calls (Phase 2+).
 * Keep metrics free of sensitive free-text prompts (PRD §13).
 */

import type { VertexAiUsageMetrics } from "@/modules/ai/types";

/** Rough placeholder rates — replace with Vertex pricing tables in Phase 2. */
const APPROX_INPUT_USD_PER_1K = 0.0001;
const APPROX_OUTPUT_USD_PER_1K = 0.0004;

export function estimateCostUsd(
  inputTokens: number | null,
  outputTokens: number | null,
): number | null {
  if (inputTokens == null || outputTokens == null) {
    return null;
  }
  return (
    (inputTokens / 1000) * APPROX_INPUT_USD_PER_1K +
    (outputTokens / 1000) * APPROX_OUTPUT_USD_PER_1K
  );
}

export function logUsageMetrics(
  event: string,
  metrics: VertexAiUsageMetrics,
): void {
  // Structured log — avoid logging personal intake text.
  console.info(
    JSON.stringify({
      type: "ai_usage",
      event,
      modelName: metrics.modelName,
      latencyMs: metrics.latencyMs,
      inputTokens: metrics.inputTokens,
      outputTokens: metrics.outputTokens,
      estimatedCostUsd: metrics.estimatedCostUsd,
      success: metrics.success,
      errorMessage: metrics.errorMessage ?? null,
      at: new Date().toISOString(),
    }),
  );
}
