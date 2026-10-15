import { desc, eq } from "drizzle-orm";

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
