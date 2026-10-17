import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getEnv } from "@/lib/env";
import * as schema from "@/lib/db/schema";

/**
 * Shared Drizzle client for the modular monolith.
 * Uses a single postgres.js connection factory per process.
 */

declare global {
  var __accesspathSql: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  const { DATABASE_URL } = getEnv();
  return postgres(DATABASE_URL, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => undefined,
    connection: {
      application_name: "accesspath-ai",
    },
    // Surface connection failures clearly (Drizzle otherwise only shows SQL text).
    transform: {
      undefined: null,
    },
  });
}

/** Helpful hint when Postgres is down (local demo uses port 5433). */
export function dbConnectionHint(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  const cause =
    error && typeof error === "object" && "cause" in error
      ? String((error as { cause?: unknown }).cause)
      : "";
  if (
    /ECONNREFUSED|CONNECT_TIMEOUT|connection.*refused/i.test(message) ||
    /ECONNREFUSED|CONNECT_TIMEOUT/i.test(cause)
  ) {
    return (
      "Database connection refused. Start Postgres with `npm run db:up` " +
      "(or `docker compose up -d`), then retry. " +
      "Expected DATABASE_URL=postgresql://accesspath@127.0.0.1:5433/postgres"
    );
  }
  return message;
}

/**
 * One pool per process in every environment. Creating a client per call
 * leaks a fresh pool each time and exhausts Postgres connections
 * ("too many clients"), especially on small Cloud SQL tiers.
 */
export function getSql() {
  globalThis.__accesspathSql ??= createClient();
  return globalThis.__accesspathSql;
}

export function getDb() {
  return drizzle(getSql(), { schema });
}

export type Database = ReturnType<typeof getDb>;
