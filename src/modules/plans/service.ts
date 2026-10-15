import { asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  checklistItems,
  plans,
  type ChecklistItem,
  type Plan,
} from "@/lib/db/schema";
import { generateGroundedPlan } from "@/modules/ai/client";
import { logUsageMetrics } from "@/modules/ai/usage";
import { getIntakeById } from "@/modules/intakes/service";
import { buildDeterministicChecklist } from "@/modules/plans/checklist";
import {
  navigationPlanSchema,
  PROMPT_VERSION,
  type NavigationPlan,
} from "@/modules/plans/types";
import {
  listAssistanceProgramsForRegion,
  listVerifiedResourcesForRegion,
} from "@/modules/resources/repository";

export type PlanBundle = {
  plan: Plan;
  planJson: NavigationPlan;
  checklist: ChecklistItem[];
};

export async function generatePlanForIntake(
  intakeId: string,
): Promise<PlanBundle> {
  const intake = await getIntakeById(intakeId);
  if (!intake?.confirmedSummary) {
    throw new Error("Confirm the needs summary before generating a plan.");
  }

  const resources = await listVerifiedResourcesForRegion(intake.region, {
    includeNeedsReview: false,
  });
  const programs = await listAssistanceProgramsForRegion(intake.region);

  const result = await generateGroundedPlan({
    confirmedSummary: intake.confirmedSummary,
    region: intake.region,
    resources,
    programs,
  });

  logUsageMetrics("generate_plan", result.usage);

  const planJson = navigationPlanSchema.parse(result.plan);
  // Only keep resource IDs that exist in curated verified results
  const allowedIds = new Set(resources.map((r) => r.id));
  planJson.resource_ids = planJson.resource_ids.filter((id) =>
    allowedIds.has(id),
  );
  planJson.source_ids = planJson.source_ids.filter(
    (id) => allowedIds.has(id) || programs.some((p) => p.id === id),
  );

  const checklistDraft = buildDeterministicChecklist({
    plan: planJson,
    resources,
    programs,
    askingFor: intake.askingFor,
  });

  const db = getDb();
  const [plan] = await db
    .insert(plans)
    .values({
      intakeId: intake.id,
      planJson,
      modelName: result.usage.modelName,
      promptVersion: PROMPT_VERSION,
      reviewStatus: result.ok ? "accepted" : "failed_fallback",
      latencyMs: String(result.usage.latencyMs),
      inputTokens:
        result.usage.inputTokens != null
          ? String(result.usage.inputTokens)
          : null,
      outputTokens:
        result.usage.outputTokens != null
          ? String(result.usage.outputTokens)
          : null,
      estimatedCostUsd:
        result.usage.estimatedCostUsd != null
          ? String(result.usage.estimatedCostUsd)
          : null,
      errorMessage: result.ok
        ? null
        : (result.usage.errorMessage ?? result.reason),
    })
    .returning();

  if (!plan) {
    throw new Error("Failed to save plan");
  }

  const insertedChecklist =
    checklistDraft.length > 0
      ? await db
          .insert(checklistItems)
          .values(
            checklistDraft.map((item) => ({
              planId: plan.id,
              title: item.title,
              description: item.description,
              sourceResourceId: item.sourceResourceId,
              status: "not_started" as const,
              ownerType: item.ownerType,
            })),
          )
          .returning()
      : [];

  return {
    plan,
    planJson,
    checklist: insertedChecklist,
  };
}

export async function getLatestPlanForIntake(
  intakeId: string,
): Promise<PlanBundle | null> {
  const db = getDb();
  const planRows = await db
    .select()
    .from(plans)
    .where(eq(plans.intakeId, intakeId))
    .orderBy(desc(plans.createdAt))
    .limit(1);
  const plan = planRows[0];
  if (!plan) return null;

  const checklist = await db
    .select()
    .from(checklistItems)
    .where(eq(checklistItems.planId, plan.id))
    .orderBy(asc(checklistItems.createdAt));

  const planJson = navigationPlanSchema.parse(plan.planJson);
  return { plan, planJson, checklist };
}

export async function updateChecklistItemStatus(
  itemId: string,
  status: "not_started" | "in_progress" | "completed" | "blocked",
): Promise<ChecklistItem> {
  const db = getDb();
  const [row] = await db
    .update(checklistItems)
    .set({ status, updatedAt: new Date() })
    .where(eq(checklistItems.id, itemId))
    .returning();
  if (!row) {
    throw new Error("Checklist item not found");
  }
  return row;
}
