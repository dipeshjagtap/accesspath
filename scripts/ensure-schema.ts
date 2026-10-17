/**
 * Apply the idempotent runtime migrations to DATABASE_URL by hand.
 * The server also runs these on startup (src/instrumentation.ts).
 *
 *   npm run db:ensure
 */
import { getSql } from "../src/lib/db";
import { ensureSchema } from "../src/lib/db/runtime-migrations";

ensureSchema()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => getSql().end({ timeout: 5 }));
