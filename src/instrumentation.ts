export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATABASE_URL) {
    return;
  }
  const { ensureSchema } = await import("@/lib/db/runtime-migrations");
  try {
    await ensureSchema();
  } catch (error) {
    console.error("[db] schema check failed", error);
  }
}
