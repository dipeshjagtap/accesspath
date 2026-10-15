/**
 * Gemini integration (server-side only).
 *
 * Preferred (PRD / competition):
 * - Vertex AI with GOOGLE_CLOUD_PROJECT
 * - Local ADC / Cloud Run dedicated service account
 *
 * Optional local fallback:
 * - GEMINI_API_KEY or GOOGLE_API_KEY (Gemini API / AI Studio)
 * - Never expose keys to the browser or commit them to Git
 */

import { GoogleGenAI } from "@google/genai";

import { getEnv } from "@/lib/env";
import {
  buildUserPrompt,
  PLAN_RESPONSE_SCHEMA,
  SYSTEM_PROMPT,
} from "@/modules/ai/prompt";
import type {
  GroundedPlanRequest,
  GroundedPlanResult,
  VertexAiUsageMetrics,
} from "@/modules/ai/types";
import { estimateCostUsd } from "@/modules/ai/usage";
import {
  navigationPlanSchema,
  type NavigationPlan,
} from "@/modules/plans/types";

const PLACEHOLDER_PROJECTS = new Set([
  "",
  "your-competition-gcp-project-id",
  "YOUR_COMPETITION_GCP_PROJECT_ID",
]);

export function buildDeterministicFallbackPlan(
  request: GroundedPlanRequest,
): NavigationPlan {
  const verifiedResources = request.resources.filter(
    (resource) => resource.verificationStatus === "verified",
  );
  const resourceIds = verifiedResources.map((resource) => resource.id);
  const programIds = request.programs
    .filter(
      (program) =>
        program.verificationStatus === "verified" ||
        program.verificationStatus === "needs_review",
    )
    .map((program) => program.id);

  return {
    needs_summary: request.confirmedSummary,
    suggested_next_steps: [
      "Review the verified resources listed for your region.",
      "Contact a rehabilitation or assessment service to ask whether a professional assessment is needed.",
      "Confirm availability, fitting support, maintenance, and total cost before deciding.",
      "If an assistance program looks relevant, confirm eligibility only with the official program.",
    ],
    resource_ids: resourceIds,
    questions_for_provider: [
      "Do I need a professional assessment before choosing a mobility aid?",
      "What fitting, adjustment, and maintenance support do you provide?",
      "What is the total cost, including delivery or follow-up visits?",
    ],
    unknowns: [
      resourceIds.length === 0
        ? "No verified provider match is available in the curated dataset for this region."
        : "Clinical suitability must be confirmed by a qualified professional.",
      "Assistance-program eligibility and approval are never determined by AccessPath.",
    ],
    safety_note:
      "AccessPath does not diagnose conditions, prescribe devices, or guarantee scheme approval. Use verified sources and qualified professionals for decisions.",
    source_ids: [...resourceIds, ...programIds],
  };
}

function isVertexConfigured(project?: string): project is string {
  return Boolean(project && !PLACEHOLDER_PROJECTS.has(project));
}

function fallbackResult(
  request: GroundedPlanRequest,
  started: number,
  reason: string,
  errorMessage: string,
): GroundedPlanResult {
  return {
    ok: false,
    plan: buildDeterministicFallbackPlan(request),
    usage: {
      modelName: "deterministic-fallback",
      latencyMs: Date.now() - started,
      inputTokens: null,
      outputTokens: null,
      estimatedCostUsd: 0,
      success: true,
      errorMessage,
    },
    source: "deterministic_fallback",
    reason,
  };
}

function extractText(response: {
  text?: string;
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}): string {
  if (response.text?.trim()) {
    return response.text.trim();
  }
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function extractUsage(response: {
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}): Pick<
  VertexAiUsageMetrics,
  "inputTokens" | "outputTokens" | "estimatedCostUsd"
> {
  const inputTokens = response.usageMetadata?.promptTokenCount ?? null;
  const outputTokens = response.usageMetadata?.candidatesTokenCount ?? null;
  return {
    inputTokens,
    outputTokens,
    estimatedCostUsd: estimateCostUsd(inputTokens, outputTokens),
  };
}

async function generateWithClient(params: {
  ai: GoogleGenAI;
  model: string;
  request: GroundedPlanRequest;
  started: number;
  source: "vertex_ai" | "gemini_api";
}): Promise<GroundedPlanResult> {
  const { ai, model, request, started, source } = params;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: buildUserPrompt(request),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: PLAN_RESPONSE_SCHEMA,
        maxOutputTokens: 2048,
      },
    });

    const usageBits = extractUsage(response);
    const rawText = extractText(response);
    if (!rawText) {
      return fallbackResult(
        request,
        started,
        "empty_model_response",
        `${source} returned an empty response.`,
      );
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawText);
    } catch {
      return fallbackResult(
        request,
        started,
        "invalid_json",
        `${source} response was not valid JSON.`,
      );
    }

    const validated = navigationPlanSchema.safeParse(parsedJson);
    if (!validated.success) {
      return fallbackResult(
        request,
        started,
        "schema_validation_failed",
        `${source} JSON failed schema validation: ${validated.error.issues
          .map((issue) => issue.path.join("."))
          .join(", ")}`,
      );
    }

    const usage: VertexAiUsageMetrics = {
      modelName: model,
      latencyMs: Date.now() - started,
      ...usageBits,
      success: true,
    };

    return {
      ok: true,
      plan: validated.data,
      usage,
      source,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : `Unknown ${source} error`;
    return fallbackResult(request, started, `${source}_error`, message);
  }
}

export async function generateGroundedPlan(
  request: GroundedPlanRequest,
): Promise<GroundedPlanResult> {
  const started = Date.now();
  const env = getEnv();
  const model = env.VERTEX_AI_MODEL;

  // Preferred: Vertex AI (competition / Cloud Run SA or local ADC)
  if (isVertexConfigured(env.GOOGLE_CLOUD_PROJECT)) {
    const ai = new GoogleGenAI({
      vertexai: true,
      project: env.GOOGLE_CLOUD_PROJECT,
      location: env.GOOGLE_CLOUD_LOCATION,
    });
    const vertexResult = await generateWithClient({
      ai,
      model,
      request,
      started,
      source: "vertex_ai",
    });
    if (vertexResult.ok) {
      return vertexResult;
    }
    // If Vertex fails (common before ADC login), try API key next.
  }

  // Local fallback: Gemini API key (server-only)
  if (env.GEMINI_API_KEY) {
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const apiResult = await generateWithClient({
      ai,
      model,
      request,
      started,
      source: "gemini_api",
    });
    if (apiResult.ok) {
      return apiResult;
    }
    return apiResult;
  }

  if (isVertexConfigured(env.GOOGLE_CLOUD_PROJECT)) {
    return fallbackResult(
      request,
      started,
      "vertex_unavailable_no_api_key",
      "Vertex AI call failed and GEMINI_API_KEY is unset. Run: gcloud auth application-default login",
    );
  }

  return fallbackResult(
    request,
    started,
    "no_ai_credentials",
    "No Vertex project (ADC) and no GEMINI_API_KEY. Using deterministic fallback.",
  );
}
