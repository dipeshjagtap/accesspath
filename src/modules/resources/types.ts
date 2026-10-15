import type { AssistanceProgram, Resource } from "@/lib/db/schema";

/** Public-facing resource view — never invent fields beyond curated DB rows. */
export type PublicResource = Pick<
  Resource,
  | "id"
  | "name"
  | "resourceType"
  | "description"
  | "region"
  | "categories"
  | "publicContactDetails"
  | "officialUrl"
  | "accessNotes"
  | "verificationStatus"
  | "lastVerifiedAt"
  | "sourceNotes"
  | "accessibilityInfo"
  | "sponsorshipDisclosure"
  | "isFictionalDemo"
>;

/** @deprecated Prefer PublicProgramme from modules/programmes — kept for AI grounding compatibility. */
export type PublicAssistanceProgram = Pick<
  AssistanceProgram,
  | "id"
  | "name"
  | "organizationId"
  | "categoryId"
  | "description"
  | "officialUrl"
  | "evidenceUrl"
  | "regions"
  | "purpose"
  | "verifiedRequirements"
  | "requiredDocuments"
  | "availabilityStatus"
  | "applicationRoute"
  | "verificationStatus"
  | "lastVerifiedAt"
  | "publishedAt"
  | "sourceNotes"
  | "eligibilityDisclaimer"
  | "isFictionalDemo"
>;

export const PRIMARY_RESULT_STATUSES = ["verified"] as const;
