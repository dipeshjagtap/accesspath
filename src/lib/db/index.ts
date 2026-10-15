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
  });
}

export function getSql() {
  if (process.env.NODE_ENV !== "production") {
    globalThis.__accesspathSql ??= createClient();
    return globalThis.__accesspathSql;
  }
  return createClient();
}

export function getDb() {
  return drizzle(getSql(), { schema });
}

export type Database = ReturnType<typeof getDb>;
