/**
 * Pre-submit environment / deployment readiness checklist.
 */
import { config } from "dotenv";

config({ path: ".env.local" });

import { checkEnvHealth } from "../src/lib/env";

type Check = { name: string; ok: boolean; detail: string };

const checks: Check[] = [];

const health = checkEnvHealth();
checks.push({
  name: "DATABASE_URL",
  ok: !health.missing.includes("DATABASE_URL"),
  detail: health.missing.includes("DATABASE_URL")
    ? "Missing DATABASE_URL"
    : "Present",
});

checks.push({
  name: "USE_FICTIONAL_DEMO_DATA",
  ok: process.env.USE_FICTIONAL_DEMO_DATA !== "false",
  detail:
    process.env.USE_FICTIONAL_DEMO_DATA === "false"
      ? "Must be true for hackathon demo"
      : "true (or default)",
});

const project = process.env.GOOGLE_CLOUD_PROJECT;
const projectReady =
  Boolean(project) &&
  project !== "your-competition-gcp-project-id" &&
  project !== "YOUR_COMPETITION_GCP_PROJECT_ID";
checks.push({
  name: "GOOGLE_CLOUD_PROJECT",
  ok: projectReady,
  detail: projectReady
    ? `Set to ${project}`
    : "Placeholder — Vertex AI will fall back; set competition project before submit if Gemini is judged",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL;
checks.push({
  name: "NEXT_PUBLIC_APP_URL",
  ok: Boolean(appUrl),
  detail: appUrl ?? "Missing",
});

checks.push({
  name: "Cloud Run deploy",
  ok: false,
  detail:
    "Manual step: follow docs/DEPLOYMENT.md once competition GCP project + Cloud SQL are ready",
});

checks.push({
  name: "ADC / service account",
  ok: false,
  detail:
    "Manual step: gcloud auth application-default login locally; dedicated SA on Cloud Run",
});

const blocking = checks.filter(
  (check) =>
    !check.ok &&
    (check.name === "DATABASE_URL" || check.name === "USE_FICTIONAL_DEMO_DATA"),
);

console.log(
  JSON.stringify(
    {
      readyForLocalDemo: blocking.length === 0,
      warnings: health.warnings,
      checks,
    },
    null,
    2,
  ),
);

if (blocking.length > 0) process.exitCode = 1;
