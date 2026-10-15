import { and, asc, eq, inArray, isNotNull, notInArray } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  assistancePrograms,
  organizations,
  supportCategories,
  type AssistanceProgram,
} from "@/lib/db/schema";
import {
  LIVE_AVAILABILITY,
  type ProgrammeMatchFilters,
  type PublicProgramme,
} from "@/modules/programmes/types";

function toPublic(
  program: AssistanceProgram,
  org: typeof organizations.$inferSelect,
  category: typeof supportCategories.$inferSelect,
): PublicProgramme {
  return {
    id: program.id,
    organizationId: program.organizationId,
    categoryId: program.categoryId,
    name: program.name,
    description: program.description,
    officialUrl: program.officialUrl,
    evidenceUrl: program.evidenceUrl,
    regions: program.regions,
    purpose: program.purpose,
    eligibilityCriteria: program.eligibilityCriteria,
    verifiedRequirements: program.verifiedRequirements,
    requiredDocuments: program.requiredDocuments,
    availabilityStatus: program.availabilityStatus,
    applicationRoute: program.applicationRoute,
    verificationStatus: program.verificationStatus,
    lastVerifiedAt: program.lastVerifiedAt,
    nextReviewAt: program.nextReviewAt,
    publishedAt: program.publishedAt,
    sourceNotes: program.sourceNotes,
    eligibilityDisclaimer: program.eligibilityDisclaimer,
    isFictionalDemo: program.isFictionalDemo,
    organizationName: org.name,
    organizationVerificationStatus: org.verificationStatus,
    categorySlug: category.slug,
    categoryName: category.name,
  };
}

/**
 * Deterministic matching: published programmes from verified orgs only.
 * Never invents listings — DB filter only.
 */
export async function matchPublishedProgrammes(
  filters: ProgrammeMatchFilters,
): Promise<PublicProgramme[]> {
  const db = getDb();
  const availability = filters.includeWaitlist === false
    ? (["accepting_requests"] as const)
    : LIVE_AVAILABILITY;

  const rows = await db
    .select({
      program: assistancePrograms,
      organization: organizations,
      category: supportCategories,
    })
    .from(assistancePrograms)
    .innerJoin(
      organizations,
      eq(assistancePrograms.organizationId, organizations.id),
    )
    .innerJoin(
      supportCategories,
      eq(assistancePrograms.categoryId, supportCategories.id),
    )
    .where(
      and(
        isNotNull(assistancePrograms.publishedAt),
        eq(organizations.verificationStatus, "verified"),
        eq(assistancePrograms.verificationStatus, "verified"),
        inArray(assistancePrograms.availabilityStatus, [...availability]),
        filters.categoryId
          ? eq(assistancePrograms.categoryId, filters.categoryId)
          : undefined,
        filters.categorySlug
          ? eq(supportCategories.slug, filters.categorySlug)
          : undefined,
        filters.excludeProgramIds?.length
          ? notInArray(assistancePrograms.id, filters.excludeProgramIds)
          : undefined,
      ),
    );

  return rows
    .filter((row) =>
      row.program.regions.some(
        (r) =>
          r === filters.region ||
          filters.region.includes(r) ||
          r.includes(filters.region.split(",")[0]?.trim() ?? ""),
      ),
    )
    .map((row) => toPublic(row.program, row.organization, row.category));
}

export async function getProgrammeById(
  id: string,
): Promise<PublicProgramme | null> {
  const db = getDb();
  const rows = await db
    .select({
      program: assistancePrograms,
      organization: organizations,
      category: supportCategories,
    })
    .from(assistancePrograms)
    .innerJoin(
      organizations,
      eq(assistancePrograms.organizationId, organizations.id),
    )
    .innerJoin(
      supportCategories,
      eq(assistancePrograms.categoryId, supportCategories.id),
    )
    .where(eq(assistancePrograms.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return null;
  }
  return toPublic(row.program, row.organization, row.category);
}

export async function listProgrammesForOrganization(
  organizationId: string,
): Promise<PublicProgramme[]> {
  const db = getDb();
  const rows = await db
    .select({
      program: assistancePrograms,
      organization: organizations,
      category: supportCategories,
    })
    .from(assistancePrograms)
    .innerJoin(
      organizations,
      eq(assistancePrograms.organizationId, organizations.id),
    )
    .innerJoin(
      supportCategories,
      eq(assistancePrograms.categoryId, supportCategories.id),
    )
    .where(eq(assistancePrograms.organizationId, organizationId));

  return rows.map((row) =>
    toPublic(row.program, row.organization, row.category),
  );
}

export async function listActiveCategories() {
  const db = getDb();
  return db
    .select()
    .from(supportCategories)
    .where(eq(supportCategories.isActive, "true"))
    .orderBy(asc(supportCategories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(supportCategories)
    .where(eq(supportCategories.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function canReceiveLiveRequests(
  organizationId: string,
  programmeId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const programme = await getProgrammeById(programmeId);
  if (!programme) {
    return { ok: false, reason: "Programme not found" };
  }
  if (programme.organizationId !== organizationId) {
    return { ok: false, reason: "Programme does not belong to organisation" };
  }
  if (programme.organizationVerificationStatus !== "verified") {
    return {
      ok: false,
      reason: "Organisation is not verified to receive live requests",
    };
  }
  if (!programme.publishedAt) {
    return { ok: false, reason: "Programme is not published" };
  }
  if (programme.verificationStatus !== "verified") {
    return { ok: false, reason: "Programme listing is not verified" };
  }
  if (
    programme.availabilityStatus !== "accepting_requests" &&
    programme.availabilityStatus !== "waitlist"
  ) {
    return { ok: false, reason: "Programme is not accepting requests" };
  }
  return { ok: true };
}

/** Unused import guard helpers — keep API surface clean for org CRUD later. */
export async function assertProgrammeOwnedByOrg(
  programmeId: string,
  organizationId: string,
): Promise<AssistanceProgram> {
  const db = getDb();
  const rows = await db
    .select()
    .from(assistancePrograms)
    .where(
      and(
        eq(assistancePrograms.id, programmeId),
        eq(assistancePrograms.organizationId, organizationId),
      ),
    )
    .limit(1);
  if (!rows[0]) {
    throw new Error("Programme not found for organisation");
  }
  return rows[0];
}
