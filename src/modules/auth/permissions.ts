import { and, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  organizationMembers,
  type Organization,
  organizations,
} from "@/lib/db/schema";
import { getCurrentUser, type AuthUser } from "@/modules/auth/session";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: "unauthenticated" | "forbidden" = "forbidden",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("You must be signed in", "unauthenticated");
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new AuthError("Admin access required", "forbidden");
  }
  return user;
}

export type OrgMembership = {
  user: AuthUser;
  organization: Organization;
  memberRole: "org_admin" | "caseworker" | "viewer";
};

export async function requireOrgMember(
  organizationId: string,
  allowedRoles?: Array<"org_admin" | "caseworker" | "viewer">,
): Promise<OrgMembership> {
  const user = await requireUser();
  const db = getDb();
  const rows = await db
    .select({
      organization: organizations,
      memberRole: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .where(
      and(
        eq(organizationMembers.userId, user.id),
        eq(organizationMembers.organizationId, organizationId),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new AuthError("Not a member of this organisation", "forbidden");
  }

  if (allowedRoles && !allowedRoles.includes(row.memberRole)) {
    throw new AuthError("Insufficient organisation role", "forbidden");
  }

  return {
    user,
    organization: row.organization,
    memberRole: row.memberRole,
  };
}

export async function listMembershipsForUser(userId: string) {
  const db = getDb();
  return db
    .select({
      organization: organizations,
      memberRole: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .where(eq(organizationMembers.userId, userId));
}

export async function requireAnyOrgMember(
  allowedRoles?: Array<"org_admin" | "caseworker" | "viewer">,
): Promise<OrgMembership> {
  const user = await requireUser();
  const memberships = await listMembershipsForUser(user.id);
  const first = memberships[0];
  if (!first) {
    throw new AuthError("No organisation membership", "forbidden");
  }
  if (allowedRoles && !allowedRoles.includes(first.memberRole)) {
    throw new AuthError("Insufficient organisation role", "forbidden");
  }
  return {
    user,
    organization: first.organization,
    memberRole: first.memberRole,
  };
}
