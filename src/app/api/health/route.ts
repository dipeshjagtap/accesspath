import { NextResponse } from "next/server";

import { checkEnvHealth } from "@/lib/env";
import { getSql } from "@/lib/db";
import { countResources } from "@/modules/resources/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const envHealth = checkEnvHealth();
  let database: "ok" | "error" | "skipped" = "skipped";
  let resourceCount: number | null = null;
  let databaseError: string | null = null;

  if (envHealth.ok) {
    try {
      await getSql()`select 1`;
      resourceCount = await countResources();
      database = "ok";
    } catch (error) {
      database = "error";
      databaseError =
        error instanceof Error ? error.message : "Unknown database error";
    }
  }

  const status =
    envHealth.ok && database !== "error"
      ? 200
      : envHealth.missing.length > 0
        ? 503
        : 200;

  return NextResponse.json(
    {
      service: "accesspath-ai",
      phase: 4,
      status: status === 200 ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      env: {
        ok: envHealth.ok,
        missing: envHealth.missing,
        warnings: envHealth.warnings,
      },
      database: {
        status: database,
        resourceCount,
        error: databaseError,
      },
      notes: [
        "Gemini via Vertex AI is wired; falls back to deterministic grounded plans if project/ADC missing.",
        "Authenticate locally with ADC; Cloud Run uses a dedicated service account.",
        "Hackathon demos must use fictional seed data.",
      ],
    },
    { status },
  );
}
