/**
 * Grant or revoke platform admin. Intentionally CLI-only so no web form can
 * promote an account.
 *
 *   npm run user:set-role -- someone@example.com admin
 *   npm run user:set-role -- someone@example.com user
 */
import { eq } from "drizzle-orm";

import { getDb, getSql } from "../src/lib/db";
import { auditEvents, users } from "../src/lib/db/schema";

async function main() {
  const [email, role] = process.argv.slice(2);
  if (!email || (role !== "admin" && role !== "user")) {
    console.error("Usage: npm run user:set-role -- <email> <admin|user>");
    process.exitCode = 1;
    return;
  }

  const db = getDb();
  const [updated] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.email, email.toLowerCase()))
    .returning({ id: users.id, email: users.email, role: users.role });

  if (!updated) {
    console.error(`No account found for ${email}`);
    process.exitCode = 1;
    return;
  }

  await db.insert(auditEvents).values({
    entityType: "user",
    entityId: updated.id,
    action: "platform_role_set_via_cli",
    metadata: { role },
  });

  console.log(`${updated.email} is now platform role: ${updated.role}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getSql().end();
  });
