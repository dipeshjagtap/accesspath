import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  organizationMembers,
  organizations,
  users,
  type Organization,
  type User,
} from "@/lib/db/schema";

export async function listPilotOrganizations(): Promise<Organization[]> {
  const db = getDb();
  return db
    .select()
    .from(organizations)
    .where(eq(organizations.status, "pilot"));
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
