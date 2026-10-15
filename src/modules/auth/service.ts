import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/modules/auth/password";
import {
  clearSessionCookie,
  createSession,
  setSessionCookie,
  type AuthUser,
} from "@/modules/auth/session";

export const registerSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(128),
  displayName: z.string().trim().min(1).max(120),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(128),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

function toAuthUser(row: typeof users.$inferSelect): AuthUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    role: row.role,
    preferredLanguage: row.preferredLanguage,
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const db = getDb();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (existing[0]) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const [row] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
      displayName: input.displayName,
      role: "user",
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create account");
  }

  const token = await createSession(row.id);
  await setSessionCookie(token);
  return toAuthUser(row);
}

export async function loginUser(input: LoginInput): Promise<AuthUser> {
  const db = getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error("Invalid email or password");
  }

  const ok = await verifyPassword(input.password, row.passwordHash);
  if (!ok) {
    throw new Error("Invalid email or password");
  }

  const token = await createSession(row.id);
  await setSessionCookie(token);
  return toAuthUser(row);
}

export async function logoutUser(): Promise<void> {
  await clearSessionCookie();
}

/** Hash helper for seed scripts (no session). */
export async function createUserRecord(input: {
  email: string;
  password: string;
  displayName: string;
  role: "user" | "admin";
}): Promise<AuthUser> {
  const db = getDb();
  const passwordHash = await hashPassword(input.password);
  const [row] = await db
    .insert(users)
    .values({
      email: input.email.toLowerCase(),
      passwordHash,
      displayName: input.displayName,
      role: input.role,
    })
    .returning();

  if (!row) {
    throw new Error("Failed to insert user");
  }

  return toAuthUser(row);
}
