import { getSql } from "@/lib/db";

/**
 * Additive, idempotent schema changes applied when the server starts
 * (src/instrumentation.ts), so a deploy never serves code that reads
 * columns the database does not have yet. Keep every statement safe to
 * re-run; mirror each change in src/lib/db/schema.ts.
 */
const RUNTIME_MIGRATIONS: { id: string; sql: string }[] = [
  {
    id: "0002_user_receipt_confirmation",
    sql: `
      DO $$ BEGIN
        CREATE TYPE "public"."receipt_confirmation" AS ENUM('received', 'partly_received', 'not_received');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
      ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "user_seen_at" timestamp with time zone;
      ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "user_confirmation" "receipt_confirmation";
      ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "user_confirmation_note" text;
      ALTER TABLE "cases" ADD COLUMN IF NOT EXISTS "user_confirmed_at" timestamp with time zone;
    `,
  },
];

export async function ensureSchema(): Promise<void> {
  const sql = getSql();
  for (const migration of RUNTIME_MIGRATIONS) {
    await sql.unsafe(migration.sql);
    console.log(`[db] ensured ${migration.id}`);
  }
}
