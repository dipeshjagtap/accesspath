import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { assistancePrograms, resources } from "@/lib/db/schema";
import {
  PRIMARY_RESULT_STATUSES,
  type PublicAssistanceProgram,
  type PublicResource,
} from "@/modules/resources/types";

function toPublicResource(
  row: typeof resources.$inferSelect,
): PublicResource {
  return {
    id: row.id,
    name: row.name,
    resourceType: row.resourceType,
    description: row.description,
    region: row.region,
    categories: row.categories,
    publicContactDetails: row.publicContactDetails,
    officialUrl: row.officialUrl,
    accessNotes: row.accessNotes,
    verificationStatus: row.verificationStatus,
    lastVerifiedAt: row.lastVerifiedAt,
    sourceNotes: row.sourceNotes,
    accessibilityInfo: row.accessibilityInfo,
    sponsorshipDisclosure: row.sponsorshipDisclosure,
    isFictionalDemo: row.isFictionalDemo,
  };
}

function toPublicProgram(
  row: typeof assistancePrograms.$inferSelect,
): PublicAssistanceProgram {
  return {
    id: row.id,
    name: row.name,
    officialUrl: row.officialUrl,
    regions: row.regions,
    purpose: row.purpose,
    verifiedRequirements: row.verifiedRequirements,
    applicationRoute: row.applicationRoute,
    verificationStatus: row.verificationStatus,
    lastVerifiedAt: row.lastVerifiedAt,
    sourceNotes: row.sourceNotes,
    eligibilityDisclaimer: row.eligibilityDisclaimer,
    isFictionalDemo: row.isFictionalDemo,
  };
}

/**
 * Deterministic resource lookup — filtering happens in code, not in the model.
 * Expired / unverified records are excluded from primary results by default.
 */
export async function listVerifiedResourcesForRegion(
  region: string,
  options?: { includeNeedsReview?: boolean },
): Promise<PublicResource[]> {
  const db = getDb();
  const statuses = options?.includeNeedsReview
    ? (["verified", "needs_review"] as const)
    : PRIMARY_RESULT_STATUSES;

  const rows = await db
    .select()
    .from(resources)
    .where(
      and(
        eq(resources.region, region),
        inArray(resources.verificationStatus, [...statuses]),
      ),
    );

  return rows.map(toPublicResource);
}

export async function getResourceById(
  id: string,
): Promise<PublicResource | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(resources)
    .where(eq(resources.id, id))
    .limit(1);
  const row = rows[0];
  return row ? toPublicResource(row) : null;
}

export async function listAssistanceProgramsForRegion(
  region: string,
): Promise<PublicAssistanceProgram[]> {
  const db = getDb();
  const rows = await db.select().from(assistancePrograms);
  return rows
    .filter(
      (row) =>
        row.regions.includes(region) &&
        (row.verificationStatus === "verified" ||
          row.verificationStatus === "needs_review"),
    )
    .map(toPublicProgram);
}

export async function countResources(): Promise<number> {
  const db = getDb();
  const rows = await db.select({ id: resources.id }).from(resources);
  return rows.length;
}

/** Primary directory: verified first; excludes expired/unverified from default list. */
export async function listPrimaryResources(): Promise<PublicResource[]> {
  const db = getDb();
  const rows = await db.select().from(resources);
  return rows
    .filter(
      (row) =>
        row.verificationStatus === "verified" ||
        row.verificationStatus === "needs_review",
    )
    .map(toPublicResource)
    .sort((a, b) => {
      if (a.verificationStatus === b.verificationStatus) {
        return a.name.localeCompare(b.name);
      }
      return a.verificationStatus === "verified" ? -1 : 1;
    });
}

export async function getAssistanceProgramById(
  id: string,
): Promise<PublicAssistanceProgram | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(assistancePrograms)
    .where(eq(assistancePrograms.id, id))
    .limit(1);
  const row = rows[0];
  return row ? toPublicProgram(row) : null;
}

export async function listPrimaryAssistancePrograms(): Promise<
  PublicAssistanceProgram[]
> {
  const db = getDb();
  const rows = await db.select().from(assistancePrograms);
  return rows
    .filter(
      (row) =>
        row.verificationStatus === "verified" ||
        row.verificationStatus === "needs_review",
    )
    .map(toPublicProgram);
}
