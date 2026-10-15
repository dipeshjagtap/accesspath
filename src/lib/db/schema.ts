import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Logical data model from AccessPath_AI_PRD.md §12.
 * Factual provider/scheme claims must come from curated rows here —
 * never from model invention.
 */

export const verificationStatusEnum = pgEnum("verification_status", [
  "verified",
  "needs_review",
  "expired",
  "unverified",
]);

export const resourceTypeEnum = pgEnum("resource_type", [
  "provider",
  "rehabilitation_service",
  "ngo",
  "government_scheme",
  "supplier",
  "support_service",
]);

export const organizationTypeEnum = pgEnum("organization_type", [
  "ngo",
  "rehabilitation_provider",
  "hospital",
  "disability_support",
  "foundation",
  "other",
]);

export const organizationStatusEnum = pgEnum("organization_status", [
  "active",
  "inactive",
  "pilot",
]);

export const orgMemberRoleEnum = pgEnum("org_member_role", [
  "org_admin",
  "caseworker",
  "viewer",
]);

export const supportCategoryEnum = pgEnum("support_category", [
  "mobility_aid",
]);

export const checklistStatusEnum = pgEnum("checklist_status", [
  "not_started",
  "in_progress",
  "completed",
  "blocked",
]);

export const checklistOwnerEnum = pgEnum("checklist_owner", [
  "user",
  "caregiver",
  "caseworker",
]);

export const caseStatusEnum = pgEnum("case_status", [
  "new",
  "needs_review",
  "ready_for_referral",
  "referred",
  "contacted",
  "assessment_scheduled",
  "support_obtained",
  "blocked",
  "closed_not_completed",
  "closed_completed",
]);

export const noteVisibilityEnum = pgEnum("note_visibility", [
  "internal",
  "user_visible",
]);

export const planReviewStatusEnum = pgEnum("plan_review_status", [
  "pending",
  "accepted",
  "needs_human_review",
  "failed_fallback",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  displayName: text("display_name"),
  email: text("email"),
  preferredLanguage: text("preferred_language").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  organizationType: organizationTypeEnum("organization_type").notNull(),
  regionsServed: text("regions_served").array().notNull().default([]),
  contactEmail: text("contact_email").notNull(),
  status: organizationStatusEnum("status").notNull().default("pilot"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: orgMemberRoleEnum("role").notNull().default("caseworker"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("organization_members_org_idx").on(table.organizationId),
    index("organization_members_user_idx").on(table.userId),
  ],
);

export const resources = pgTable(
  "resources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    resourceType: resourceTypeEnum("resource_type").notNull(),
    description: text("description").notNull(),
    region: text("region").notNull(),
    categories: text("categories").array().notNull().default([]),
    publicContactDetails: text("public_contact_details"),
    officialUrl: text("official_url"),
    accessNotes: text("access_notes"),
    verificationStatus: verificationStatusEnum("verification_status")
      .notNull()
      .default("unverified"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    sourceNotes: text("source_notes").notNull(),
    reviewerName: text("reviewer_name"),
    reviewNotes: text("review_notes"),
    accessibilityInfo: text("accessibility_info"),
    sponsorshipDisclosure: text("sponsorship_disclosure"),
    isFictionalDemo: text("is_fictional_demo").notNull().default("true"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("resources_region_idx").on(table.region),
    index("resources_verification_idx").on(table.verificationStatus),
  ],
);

export const assistancePrograms = pgTable(
  "assistance_programs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    officialUrl: text("official_url"),
    regions: text("regions").array().notNull().default([]),
    purpose: text("purpose").notNull(),
    verifiedRequirements: text("verified_requirements").array().notNull().default([]),
    applicationRoute: text("application_route"),
    verificationStatus: verificationStatusEnum("verification_status")
      .notNull()
      .default("unverified"),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    sourceNotes: text("source_notes").notNull(),
    eligibilityDisclaimer: text("eligibility_disclaimer")
      .notNull()
      .default(
        "Potentially relevant — confirm eligibility and approval with the official program. AccessPath does not determine final eligibility.",
      ),
    isFictionalDemo: text("is_fictional_demo").notNull().default("true"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("assistance_programs_verification_idx").on(table.verificationStatus),
  ],
);

export const intakes = pgTable("intakes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  supportCategory: supportCategoryEnum("support_category")
    .notNull()
    .default("mobility_aid"),
  region: text("region").notNull(),
  practicalNeeds: text("practical_needs").notNull(),
  budgetConstraint: text("budget_constraint"),
  professionalRecommendationStatus: text("professional_recommendation_status"),
  askingFor: text("asking_for"),
  preferredContactMethod: text("preferred_contact_method"),
  accessNeeds: text("access_needs"),
  confirmedSummary: text("confirmed_summary"),
  sessionKey: text("session_key"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const plans = pgTable("plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  intakeId: uuid("intake_id")
    .notNull()
    .references(() => intakes.id, { onDelete: "cascade" }),
  planJson: jsonb("plan_json").notNull(),
  modelName: text("model_name").notNull(),
  promptVersion: text("prompt_version").notNull(),
  reviewStatus: planReviewStatusEnum("review_status")
    .notNull()
    .default("pending"),
  latencyMs: text("latency_ms"),
  inputTokens: text("input_tokens"),
  outputTokens: text("output_tokens"),
  estimatedCostUsd: text("estimated_cost_usd"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const checklistItems = pgTable(
  "checklist_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    sourceResourceId: uuid("source_resource_id").references(() => resources.id, {
      onDelete: "set null",
    }),
    status: checklistStatusEnum("status").notNull().default("not_started"),
    ownerType: checklistOwnerEnum("owner_type").notNull().default("user"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("checklist_items_plan_idx").on(table.planId)],
);

export const cases = pgTable(
  "cases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    intakeId: uuid("intake_id")
      .notNull()
      .references(() => intakes.id, { onDelete: "cascade" }),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "restrict" }),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: caseStatusEnum("status").notNull().default("new"),
    outcome: text("outcome"),
    nextAction: text("next_action"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
  },
  (table) => [
    index("cases_org_idx").on(table.organizationId),
    index("cases_status_idx").on(table.status),
  ],
);

export const consentEvents = pgTable("consent_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  intakeId: uuid("intake_id")
    .notNull()
    .references(() => intakes.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "restrict" }),
  purpose: text("purpose").notNull(),
  fieldsShared: text("fields_shared").array().notNull().default([]),
  consentVersion: text("consent_version").notNull(),
  consentedAt: timestamp("consented_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
});

export const caseNotes = pgTable(
  "case_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    note: text("note").notNull(),
    visibility: noteVisibilityEnum("visibility").notNull().default("internal"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("case_notes_case_idx").on(table.caseId)],
);

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    organizationId: uuid("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    action: text("action").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("audit_events_entity_idx").on(table.entityType, table.entityId),
  ],
);

export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type AssistanceProgram = typeof assistancePrograms.$inferSelect;
export type Intake = typeof intakes.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type Case = typeof cases.$inferSelect;
export type ConsentEvent = typeof consentEvents.$inferSelect;
