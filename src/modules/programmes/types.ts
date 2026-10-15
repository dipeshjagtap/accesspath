import type { AssistanceProgram, Organization } from "@/lib/db/schema";

export type PublicProgramme = Pick<
  AssistanceProgram,
  | "id"
  | "organizationId"
  | "categoryId"
  | "name"
  | "description"
  | "officialUrl"
  | "evidenceUrl"
  | "regions"
  | "purpose"
  | "eligibilityCriteria"
  | "verifiedRequirements"
  | "requiredDocuments"
  | "availabilityStatus"
  | "applicationRoute"
  | "verificationStatus"
  | "lastVerifiedAt"
  | "nextReviewAt"
  | "publishedAt"
  | "sourceNotes"
  | "eligibilityDisclaimer"
  | "isFictionalDemo"
> & {
  organizationName: string;
  organizationVerificationStatus: Organization["verificationStatus"];
  categorySlug: string;
  categoryName: string;
};

export type ProgrammeMatchFilters = {
  categoryId?: string;
  categorySlug?: string;
  region: string;
  excludeProgramIds?: string[];
  /** When true, include waitlist programmes. Default true. */
  includeWaitlist?: boolean;
};

export const LIVE_AVAILABILITY = [
  "accepting_requests",
  "waitlist",
] as const;
