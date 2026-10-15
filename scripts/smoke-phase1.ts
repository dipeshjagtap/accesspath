/**
 * Phase 1 smoke test: intake → confirm → plan → checklist (no HTTP).
 */
import { config } from "dotenv";

config({ path: ".env.local" });

import { DEMO_REGION } from "../src/lib/constants";
import { getSql } from "../src/lib/db";
import {
  createIntake,
  updateConfirmedSummary,
} from "../src/modules/intakes/service";
import {
  generatePlanForIntake,
  getLatestPlanForIntake,
  updateChecklistItemStatus,
} from "../src/modules/plans/service";
import { listVerifiedResourcesForRegion } from "../src/modules/resources/repository";

async function main() {
  const resources = await listVerifiedResourcesForRegion(DEMO_REGION);
  if (resources.length === 0) {
    throw new Error("Expected seeded verified resources for demo region");
  }

  const intake = await createIntake({
    askingFor: "someone_else",
    region: DEMO_REGION,
    practicalNeeds:
      "Father has difficulty walking longer distances and needs help understanding mobility-aid options.",
    supportCategorySlug: "disability_health_support",
    budgetConstraint: "Prefer lower-cost options",
    preferredLanguage: "en",
    professionalRecommendationStatus: "unsure",
  });

  await updateConfirmedSummary(
    intake.id,
    intake.confirmedSummary ?? "Confirmed demo summary for smoke test.",
  );

  const bundle = await generatePlanForIntake(intake.id);
  if (bundle.planJson.resource_ids.length === 0) {
    throw new Error("Expected grounded resource_ids from curated dataset");
  }
  if (bundle.checklist.length === 0) {
    throw new Error("Expected deterministic checklist items");
  }

  const first = bundle.checklist[0]!;
  await updateChecklistItemStatus(first.id, "in_progress");
  const latest = await getLatestPlanForIntake(intake.id);
  const updated = latest?.checklist.find((item) => item.id === first.id);
  if (updated?.status !== "in_progress") {
    throw new Error("Checklist status update failed");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        intakeId: intake.id,
        planId: bundle.plan.id,
        resources: bundle.planJson.resource_ids.length,
        checklistItems: bundle.checklist.length,
        model: bundle.plan.modelName,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getSql().end({ timeout: 5 });
  });
