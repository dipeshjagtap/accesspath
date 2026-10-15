import { createHash, randomBytes } from "node:crypto";

import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";

import { getDb } from "@/lib/db";
import { sessions, users, type User } from "@/lib/db/schema";

export const SESSION_COOKIE = "accesspath_session";
const SESSION_DAYS = 14;

export type AuthUser = Pick<
  User,
  "id" | "email" | "displayName" | "role" | "preferredLanguage"
>;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  const db = getDb();
  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  return token;
}

export async function destroySession(token: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

export async function getUserFromToken(
  token: string | undefined,
): Promise<AuthUser | null> {
  if (!token) {
    return null;
  }

  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      preferredLanguage: users.preferredLanguage,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(token)),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  return getUserFromToken(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await destroySession(token);
  }
  jar.delete(SESSION_COOKIE);
}
