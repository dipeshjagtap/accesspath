import { z } from "zod";

/**
 * Server-side environment validation.
 * Call getEnv() only from server code (route handlers, server actions, scripts).
 * Do not import this module from Client Components.
 */

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_ENV: z.enum(["local", "staging", "production"]).default("local"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  GOOGLE_CLOUD_PROJECT: z.string().min(1).optional(),
  GOOGLE_CLOUD_LOCATION: z.string().default("us-central1"),
  VERTEX_AI_MODEL: z.string().default("gemini-2.5-flash-lite"),
  /** Gemini API / AI Studio key — server-only local fallback when Vertex is unavailable */
  GEMINI_API_KEY: z.string().min(1).optional(),
  USE_FICTIONAL_DEMO_DATA: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  DEMO_PARTNER_ACCESS_TOKEN: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

function readRawEnv(): Record<string, string | undefined> {
  return {
    NODE_ENV: process.env.NODE_ENV,
    APP_ENV: process.env.APP_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT,
    GOOGLE_CLOUD_LOCATION: process.env.GOOGLE_CLOUD_LOCATION,
    VERTEX_AI_MODEL: process.env.VERTEX_AI_MODEL,
    GEMINI_API_KEY:
      process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || undefined,
    USE_FICTIONAL_DEMO_DATA: process.env.USE_FICTIONAL_DEMO_DATA,
    DEMO_PARTNER_ACCESS_TOKEN: process.env.DEMO_PARTNER_ACCESS_TOKEN,
  };
}

export function getEnv(): AppEnv {
  if (cached) {
    return cached;
  }

  const parsed = envSchema.safeParse(readRawEnv());

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  cached = parsed.data;
  return cached;
}

/** Soft check for health endpoints — does not throw. */
export function checkEnvHealth(): {
  ok: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!process.env.DATABASE_URL) {
    missing.push("DATABASE_URL");
  }

  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const hasVertexProject =
    Boolean(project) &&
    project !== "your-competition-gcp-project-id" &&
    project !== "YOUR_COMPETITION_GCP_PROJECT_ID";
  const hasApiKey = Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  );

  if (!hasVertexProject && !hasApiKey) {
    warnings.push(
      "No Vertex project and no GEMINI_API_KEY — plans use deterministic fallback",
    );
  } else if (!hasVertexProject && hasApiKey) {
    warnings.push(
      "Using GEMINI_API_KEY locally; prefer Vertex AI + ADC for competition Cloud Run",
    );
  }

  if (process.env.USE_FICTIONAL_DEMO_DATA === "false") {
    warnings.push(
      "USE_FICTIONAL_DEMO_DATA=false — hackathon demos must use fictional data",
    );
  }

  return {
    ok: missing.length === 0,
    missing,
    warnings,
  };
}
