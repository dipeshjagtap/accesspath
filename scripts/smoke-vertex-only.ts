/**
 * Vertex-only smoke test. Ignores GEMINI_API_KEY on purpose.
 */
import { config } from "dotenv";

config({ path: ".env.local" });

// Force API-key path off for this process
delete process.env.GEMINI_API_KEY;
delete process.env.GOOGLE_API_KEY;
if (process.env.SMOKE_MODEL) process.env.VERTEX_AI_MODEL = process.env.SMOKE_MODEL;
if (process.env.SMOKE_LOCATION) process.env.GOOGLE_CLOUD_LOCATION = process.env.SMOKE_LOCATION;

import { GoogleGenAI } from "@google/genai";
import { DEMO_REGION } from "../src/lib/constants";
import { getSql } from "../src/lib/db";
import {
  buildUserPrompt,
  PLAN_RESPONSE_SCHEMA,
  SYSTEM_PROMPT,
} from "../src/modules/ai/prompt";
import { navigationPlanSchema } from "../src/modules/plans/types";
import {
  listAssistanceProgramsForRegion,
  listVerifiedResourcesForRegion,
} from "../src/modules/resources/repository";

async function main() {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const model = process.env.VERTEX_AI_MODEL || "gemini-2.0-flash-001";

  if (!project || project.includes("your-competition")) {
    throw new Error("GOOGLE_CLOUD_PROJECT is not set to a real project");
  }

  const resources = await listVerifiedResourcesForRegion(DEMO_REGION);
  const programs = await listAssistanceProgramsForRegion(DEMO_REGION);

  const started = Date.now();
  const ai = new GoogleGenAI({
    vertexai: true,
    project,
    location,
  });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: buildUserPrompt({
        confirmedSummary:
          "Demo caregiver needs mobility-aid navigation help in Pune.",
        region: DEMO_REGION,
        resources,
        programs,
      }),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: PLAN_RESPONSE_SCHEMA,
        maxOutputTokens: 1024,
      },
    });

    const text =
      response.text?.trim() ||
      response.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim() ||
      "";

    const parsed = navigationPlanSchema.safeParse(JSON.parse(text || "{}"));
    console.log(
      JSON.stringify(
        {
          ok: parsed.success,
          source: "vertex_ai",
          project,
          location,
          model,
          latencyMs: Date.now() - started,
          resourceIds: parsed.success ? parsed.data.resource_ids.length : 0,
          sampleNeeds: parsed.success
            ? parsed.data.needs_summary.slice(0, 120)
            : null,
          parseError: parsed.success
            ? null
            : parsed.error.issues.map((i) => i.path.join(".")).join(","),
        },
        null,
        2,
      ),
    );
    if (!parsed.success) process.exitCode = 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(
      JSON.stringify(
        {
          ok: false,
          source: "vertex_ai",
          project,
          location,
          model,
          latencyMs: Date.now() - started,
          error: message.slice(0, 800),
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getSql().end({ timeout: 5 });
  });
