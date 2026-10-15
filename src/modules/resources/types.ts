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

export type PublicAssistanceProgram = Pick<
  AssistanceProgram,
  | "id"
  | "name"
  | "officialUrl"
  | "regions"
  | "purpose"
  | "verifiedRequirements"
  | "applicationRoute"
  | "verificationStatus"
  | "lastVerifiedAt"
  | "sourceNotes"
  | "eligibilityDisclaimer"
  | "isFictionalDemo"
>;

export const PRIMARY_RESULT_STATUSES = ["verified"] as const;
