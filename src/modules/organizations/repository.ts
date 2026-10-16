import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  auditEvents,
  organizationMembers,
  organizations,
  users,
  type Organization,
  type User,
} from "@/lib/db/schema";

export async function listVerifiedOrganizations(): Promise<Organization[]> {
  const db = getDb();
  return db
    .select()
    .from(organizations)
    .where(eq(organizations.verificationStatus, "verified"));
}

export async function listAllOrganizations(): Promise<Organization[]> {
  const db = getDb();
  return db.select().from(organizations).orderBy(desc(organizations.createdAt));
}

export async function getOrganizationById(
  id: string,
): Promise<Organization | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateOrganizationVerification(input: {
  organizationId: string;
  verificationStatus: Organization["verificationStatus"];
  verificationNotes?: string;
  actorUserId: string;
}): Promise<Organization> {
  const db = getDb();
  const existing = await getOrganizationById(input.organizationId);
  if (!existing) {
    throw new Error("Organisation not found");
  }

  const [updated] = await db
    .update(organizations)
    .set({
      verificationStatus: input.verificationStatus,
      verificationNotes:
        input.verificationNotes ?? existing.verificationNotes,
      verificationCheckedAt: new Date(),
      verifiedByUserId: input.actorUserId,
    })
    .where(eq(organizations.id, input.organizationId))
    .returning();

  if (!updated) {
    throw new Error("Failed to update verification");
  }

  await db.insert(auditEvents).values({
    actorUserId: input.actorUserId,
    organizationId: input.organizationId,
    entityType: "organization",
    entityId: input.organizationId,
    action: "verification_decision",
    metadata: {
      from: existing.verificationStatus,
      to: updated.verificationStatus,
      notes: input.verificationNotes ?? null,
    },
  });

  return updated;
}

export async function listOrgMembers(organizationId: string) {
  const db = getDb();
  return db
    .select({
      user: users,
      role: organizationMembers.role,
      membershipId: organizationMembers.id,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(organizationMembers.userId, users.id))
    .where(eq(organizationMembers.organizationId, organizationId));
}

type OrgMemberRole = (typeof organizationMembers.$inferSelect)["role"];

async function countOrgAdmins(organizationId: string): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.role, "org_admin"),
      ),
    );
  return rows.length;
}

async function getMembership(organizationId: string, membershipId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.id, membershipId),
        eq(organizationMembers.organizationId, organizationId),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) {
    throw new Error("Member not found in this organisation");
  }
  return row;
}

/** Adds an existing account to the organisation. Accounts are not auto-created. */
export async function addOrgMemberByEmail(input: {
  organizationId: string;
  email: string;
  role: OrgMemberRole;
  actorUserId: string;
}) {
  const db = getDb();
  const userRows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);
  const user = userRows[0];
  if (!user) {
    throw new Error(
      "No account with that email. Ask them to register as an individual first.",
    );
  }

  const existing = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, input.organizationId),
        eq(organizationMembers.userId, user.id),
      ),
    )
    .limit(1);
  if (existing[0]) {
    throw new Error("That person is already a member of this organisation");
  }

  const [membership] = await db
    .insert(organizationMembers)
    .values({
      organizationId: input.organizationId,
      userId: user.id,
      role: input.role,
    })
    .returning();
  if (!membership) {
    throw new Error("Failed to add member");
  }

  await db.insert(auditEvents).values({
    actorUserId: input.actorUserId,
    organizationId: input.organizationId,
    entityType: "organization_member",
    entityId: membership.id,
    action: "member_added",
    metadata: { userId: user.id, role: input.role },
  });

  return membership;
}

export async function updateOrgMemberRole(input: {
  organizationId: string;
  membershipId: string;
  role: OrgMemberRole;
  actorUserId: string;
}) {
  const existing = await getMembership(input.organizationId, input.membershipId);
  if (existing.role === input.role) {
    return existing;
  }
  if (
    existing.role === "org_admin" &&
    (await countOrgAdmins(input.organizationId)) <= 1
  ) {
    throw new Error("An organisation must keep at least one organisation admin");
  }

  const db = getDb();
  const [updated] = await db
    .update(organizationMembers)
    .set({ role: input.role })
    .where(eq(organizationMembers.id, input.membershipId))
    .returning();

  await db.insert(auditEvents).values({
    actorUserId: input.actorUserId,
    organizationId: input.organizationId,
    entityType: "organization_member",
    entityId: input.membershipId,
    action: "member_role_changed",
    metadata: { userId: existing.userId, from: existing.role, to: input.role },
  });

  return updated;
}

export async function removeOrgMember(input: {
  organizationId: string;
  membershipId: string;
  actorUserId: string;
}) {
  const existing = await getMembership(input.organizationId, input.membershipId);
  if (
    existing.role === "org_admin" &&
    (await countOrgAdmins(input.organizationId)) <= 1
  ) {
    throw new Error("An organisation must keep at least one organisation admin");
  }

  const db = getDb();
  await db
    .delete(organizationMembers)
    .where(eq(organizationMembers.id, input.membershipId));

  await db.insert(auditEvents).values({
    actorUserId: input.actorUserId,
    organizationId: input.organizationId,
    entityType: "organization_member",
    entityId: input.membershipId,
    action: "member_removed",
    metadata: { userId: existing.userId, role: existing.role },
  });
}

/** Every account with its platform role and organisation memberships. */
export async function listUsersWithRoles() {
  const db = getDb();
  const [allUsers, memberships] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt)),
    db
      .select({
        userId: organizationMembers.userId,
        memberRole: organizationMembers.role,
        organizationId: organizations.id,
        organizationName: organizations.name,
        verificationStatus: organizations.verificationStatus,
      })
      .from(organizationMembers)
      .innerJoin(
        organizations,
        eq(organizationMembers.organizationId, organizations.id),
      ),
  ]);

  return allUsers.map((user) => ({
    ...user,
    memberships: memberships.filter((m) => m.userId === user.id),
  }));
}

/** @deprecated Prefer requireOrgMember — kept for migration of old partner scripts. */
export async function getDemoCaseworker(): Promise<{
  user: User;
  organization: Organization;
} | null> {
  const db = getDb();
  const rows = await db
    .select({
      user: users,
      organization: organizations,
    })
    .from(organizationMembers)
    .innerJoin(users, eq(organizationMembers.userId, users.id))
    .innerJoin(
      organizations,
      eq(organizationMembers.organizationId, organizations.id),
    )
    .limit(1);

  return rows[0] ?? null;
}
