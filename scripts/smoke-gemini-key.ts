import { config } from "dotenv";

config({ path: ".env.local" });

import { DEMO_REGION } from "../src/lib/constants";
import { getSql } from "../src/lib/db";
import { generateGroundedPlan } from "../src/modules/ai/client";
import {
  listAssistanceProgramsForRegion,
  listVerifiedResourcesForRegion,
} from "../src/modules/resources/repository";

async function main() {
  const resources = await listVerifiedResourcesForRegion(DEMO_REGION);
  const programs = await listAssistanceProgramsForRegion(DEMO_REGION);
  const result = await generateGroundedPlan({
    confirmedSummary:
      "Demo caregiver needs mobility-aid navigation help in Pune.",
    region: DEMO_REGION,
    resources,
    programs,
  });

  console.log(
    JSON.stringify(
      {
        ok: result.ok,
        source: result.source,
        model: result.usage.modelName,
        latencyMs: result.usage.latencyMs,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        estimatedCostUsd: result.usage.estimatedCostUsd,
        error: result.usage.errorMessage ?? null,
        reason: "reason" in result ? result.reason : null,
        resourceIds: result.plan.resource_ids.length,
      },
      null,
      2,
    ),
  );

  if (!result.ok) process.exitCode = 1;
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getSql().end({ timeout: 5 });
  });
