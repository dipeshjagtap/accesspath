import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import {
  auditEvents,
  organizationMembers,
  organizations,
  users,
} from "@/lib/db/schema";
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

export const ORGANIZATION_TYPES = [
  "ngo",
  "hospital",
  "clinic",
  "public_agency",
  "service_provider",
  "rehabilitation_provider",
  "disability_support",
  "foundation",
  "other",
] as const;

export const registerOrganizationSchema = registerSchema.extend({
  organizationName: z.string().trim().min(2).max(200),
  organizationType: z.enum(ORGANIZATION_TYPES),
  contactEmail: z.string().trim().email().max(200).optional(),
  registrationType: z.string().trim().max(120).optional(),
  registrationNumber: z.string().trim().max(120).optional(),
  regionsServed: z.string().trim().max(500).optional(),
});

export type RegisterOrganizationInput = z.infer<
  typeof registerOrganizationSchema
>;

/**
 * Creates the account, a pending organisation, and makes the account its
 * org_admin in one transaction. Platform admins must verify the organisation
 * before its programmes are matched to users.
 */
export async function registerOrganization(
  input: RegisterOrganizationInput,
): Promise<AuthUser> {
  const db = getDb();
  const email = input.email.toLowerCase();
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing[0]) {
    throw new Error("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);
  const row = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email,
        passwordHash,
        displayName: input.displayName,
        role: "user",
      })
      .returning();
    if (!user) {
      throw new Error("Failed to create account");
    }

    const [org] = await tx
      .insert(organizations)
      .values({
        name: input.organizationName,
        organizationType: input.organizationType,
        contactEmail: input.contactEmail || email,
        registrationType: input.registrationType || null,
        registrationNumber: input.registrationNumber || null,
        regionsServed: (input.regionsServed || "")
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean),
        verificationStatus: "pending",
        isFictionalDemo: "false",
      })
      .returning();
    if (!org) {
      throw new Error("Failed to create organisation");
    }

    await tx.insert(organizationMembers).values({
      organizationId: org.id,
      userId: user.id,
      role: "org_admin",
    });

    await tx.insert(auditEvents).values({
      actorUserId: user.id,
      organizationId: org.id,
      entityType: "organization",
      entityId: org.id,
      action: "organization_registered",
      metadata: { organizationType: org.organizationType },
    });

    return user;
  });

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
