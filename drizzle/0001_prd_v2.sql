-- PRD v2 schema reset migration.
-- For local demo: DROP SCHEMA public CASCADE; CREATE SCHEMA public; then apply this file,
-- or run: npm run db:push after starting docker compose.

CREATE TYPE "public"."listing_verification_status" AS ENUM('verified', 'needs_review', 'expired', 'unverified');
CREATE TYPE "public"."org_verification_status" AS ENUM('pending', 'in_review', 'verified', 'rejected', 'suspended', 'recheck_required');
CREATE TYPE "public"."resource_type" AS ENUM('provider', 'rehabilitation_service', 'ngo', 'government_scheme', 'supplier', 'support_service');
CREATE TYPE "public"."organization_type" AS ENUM('ngo', 'hospital', 'clinic', 'public_agency', 'service_provider', 'rehabilitation_provider', 'disability_support', 'foundation', 'other');
CREATE TYPE "public"."organization_status" AS ENUM('active', 'inactive', 'pilot');
CREATE TYPE "public"."platform_role" AS ENUM('user', 'admin');
CREATE TYPE "public"."org_member_role" AS ENUM('org_admin', 'caseworker', 'viewer');
CREATE TYPE "public"."programme_availability" AS ENUM('accepting_requests', 'waitlist', 'temporarily_unavailable', 'closed', 'unknown');
CREATE TYPE "public"."checklist_status" AS ENUM('not_started', 'in_progress', 'completed', 'blocked');
CREATE TYPE "public"."checklist_owner" AS ENUM('user', 'caregiver', 'caseworker');
CREATE TYPE "public"."case_status" AS ENUM('submitted', 'under_review', 'information_requested', 'accepted', 'declined', 'in_progress', 'referred_elsewhere', 'assistance_delivered', 'partially_delivered', 'not_delivered', 'unresolved', 'closed');
CREATE TYPE "public"."note_visibility" AS ENUM('internal', 'user_visible');
CREATE TYPE "public"."plan_review_status" AS ENUM('pending', 'accepted', 'needs_human_review', 'failed_fallback');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "display_name" text,
  "email" text NOT NULL,
  "password_hash" text NOT NULL,
  "role" "platform_role" DEFAULT 'user' NOT NULL,
  "preferred_language" text DEFAULT 'en' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "users_email_uidx" ON "users" USING btree ("email");

CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "token_hash" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "sessions_token_hash_uidx" ON "sessions" USING btree ("token_hash");
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

CREATE TABLE "support_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "sort_order" text DEFAULT '0' NOT NULL,
  "is_active" text DEFAULT 'true' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "support_categories_slug_uidx" ON "support_categories" USING btree ("slug");

CREATE TABLE "organizations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "legal_name" text,
  "organization_type" "organization_type" NOT NULL,
  "registration_type" text,
  "registration_number" text,
  "registration_source_url" text,
  "regions_served" text[] DEFAULT '{}' NOT NULL,
  "contact_email" text NOT NULL,
  "verification_status" "org_verification_status" DEFAULT 'pending' NOT NULL,
  "verification_checked_at" timestamp with time zone,
  "verification_expires_at" timestamp with time zone,
  "verification_notes" text,
  "verified_by_user_id" uuid,
  "status" "organization_status" DEFAULT 'pilot' NOT NULL,
  "is_fictional_demo" text DEFAULT 'true' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_verified_by_user_id_users_id_fk" FOREIGN KEY ("verified_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

CREATE TABLE "organization_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" "org_member_role" DEFAULT 'caseworker' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "organization_members_org_idx" ON "organization_members" USING btree ("organization_id");
CREATE INDEX "organization_members_user_idx" ON "organization_members" USING btree ("user_id");
CREATE UNIQUE INDEX "organization_members_org_user_uidx" ON "organization_members" USING btree ("organization_id","user_id");
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

CREATE TABLE "resources" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "resource_type" "resource_type" NOT NULL,
  "description" text NOT NULL,
  "region" text NOT NULL,
  "categories" text[] DEFAULT '{}' NOT NULL,
  "public_contact_details" text,
  "official_url" text,
  "access_notes" text,
  "verification_status" "listing_verification_status" DEFAULT 'unverified' NOT NULL,
  "last_verified_at" timestamp with time zone,
  "source_notes" text NOT NULL,
  "reviewer_name" text,
  "review_notes" text,
  "accessibility_info" text,
  "sponsorship_disclosure" text,
  "is_fictional_demo" text DEFAULT 'true' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "resources_region_idx" ON "resources" USING btree ("region");
CREATE INDEX "resources_verification_idx" ON "resources" USING btree ("verification_status");

CREATE TABLE "assistance_programs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid,
  "category_id" uuid,
  "name" text NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "official_url" text,
  "evidence_url" text,
  "regions" text[] DEFAULT '{}' NOT NULL,
  "purpose" text NOT NULL,
  "eligibility_criteria" jsonb DEFAULT '{}'::jsonb,
  "verified_requirements" text[] DEFAULT '{}' NOT NULL,
  "required_documents" text[] DEFAULT '{}' NOT NULL,
  "availability_status" "programme_availability" DEFAULT 'unknown' NOT NULL,
  "application_route" text,
  "verification_status" "listing_verification_status" DEFAULT 'unverified' NOT NULL,
  "last_verified_at" timestamp with time zone,
  "next_review_at" timestamp with time zone,
  "published_at" timestamp with time zone,
  "source_notes" text NOT NULL,
  "eligibility_disclaimer" text DEFAULT 'Potentially relevant — confirm eligibility and approval with the organisation. AccessPath does not determine final eligibility.' NOT NULL,
  "is_fictional_demo" text DEFAULT 'true' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "assistance_programs_org_idx" ON "assistance_programs" USING btree ("organization_id");
CREATE INDEX "assistance_programs_category_idx" ON "assistance_programs" USING btree ("category_id");
CREATE INDEX "assistance_programs_verification_idx" ON "assistance_programs" USING btree ("verification_status");
ALTER TABLE "assistance_programs" ADD CONSTRAINT "assistance_programs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "assistance_programs" ADD CONSTRAINT "assistance_programs_category_id_support_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."support_categories"("id") ON DELETE restrict ON UPDATE no action;

CREATE TABLE "intakes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid,
  "category_id" uuid,
  "support_category_slug" text DEFAULT 'disability_health_support' NOT NULL,
  "region" text NOT NULL,
  "practical_needs" text NOT NULL,
  "budget_constraint" text,
  "professional_recommendation_status" text,
  "asking_for" text,
  "preferred_contact_method" text,
  "access_needs" text,
  "confirmed_summary" text,
  "session_key" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "intakes" ADD CONSTRAINT "intakes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "intakes" ADD CONSTRAINT "intakes_category_id_support_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."support_categories"("id") ON DELETE restrict ON UPDATE no action;

CREATE TABLE "plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "intake_id" uuid NOT NULL,
  "plan_json" jsonb NOT NULL,
  "model_name" text NOT NULL,
  "prompt_version" text NOT NULL,
  "review_status" "plan_review_status" DEFAULT 'pending' NOT NULL,
  "latency_ms" text,
  "input_tokens" text,
  "output_tokens" text,
  "estimated_cost_usd" text,
  "error_message" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "plans" ADD CONSTRAINT "plans_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE cascade ON UPDATE no action;

CREATE TABLE "checklist_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "plan_id" uuid NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "source_resource_id" uuid,
  "source_program_id" uuid,
  "status" "checklist_status" DEFAULT 'not_started' NOT NULL,
  "owner_type" "checklist_owner" DEFAULT 'user' NOT NULL,
  "due_date" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "checklist_items_plan_idx" ON "checklist_items" USING btree ("plan_id");
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_source_resource_id_resources_id_fk" FOREIGN KEY ("source_resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_source_program_id_assistance_programs_id_fk" FOREIGN KEY ("source_program_id") REFERENCES "public"."assistance_programs"("id") ON DELETE set null ON UPDATE no action;

CREATE TABLE "cases" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "case_reference" text NOT NULL,
  "intake_id" uuid NOT NULL,
  "assistance_program_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL,
  "assigned_to_user_id" uuid,
  "parent_case_id" uuid,
  "status" "case_status" DEFAULT 'submitted' NOT NULL,
  "status_reason" text,
  "outcome" text,
  "outcome_confirmed_by" text,
  "next_action" text,
  "follow_up_due_at" timestamp with time zone,
  "last_user_notified_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "closed_at" timestamp with time zone
);
CREATE INDEX "cases_org_idx" ON "cases" USING btree ("organization_id");
CREATE INDEX "cases_status_idx" ON "cases" USING btree ("status");
CREATE INDEX "cases_program_idx" ON "cases" USING btree ("assistance_program_id");
CREATE UNIQUE INDEX "cases_reference_uidx" ON "cases" USING btree ("case_reference");
ALTER TABLE "cases" ADD CONSTRAINT "cases_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "cases" ADD CONSTRAINT "cases_assistance_program_id_assistance_programs_id_fk" FOREIGN KEY ("assistance_program_id") REFERENCES "public"."assistance_programs"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "cases" ADD CONSTRAINT "cases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "cases" ADD CONSTRAINT "cases_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

CREATE TABLE "consent_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "intake_id" uuid NOT NULL,
  "user_id" uuid,
  "organization_id" uuid NOT NULL,
  "assistance_program_id" uuid,
  "case_id" uuid,
  "purpose" text NOT NULL,
  "fields_shared" text[] DEFAULT '{}' NOT NULL,
  "consent_version" text NOT NULL,
  "consented_at" timestamp with time zone DEFAULT now() NOT NULL,
  "withdrawn_at" timestamp with time zone
);
ALTER TABLE "consent_events" ADD CONSTRAINT "consent_events_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "consent_events" ADD CONSTRAINT "consent_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "consent_events" ADD CONSTRAINT "consent_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "consent_events" ADD CONSTRAINT "consent_events_assistance_program_id_assistance_programs_id_fk" FOREIGN KEY ("assistance_program_id") REFERENCES "public"."assistance_programs"("id") ON DELETE restrict ON UPDATE no action;

CREATE TABLE "case_notes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "case_id" uuid NOT NULL,
  "author_user_id" uuid NOT NULL,
  "note" text NOT NULL,
  "visibility" "note_visibility" DEFAULT 'internal' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "case_notes_case_idx" ON "case_notes" USING btree ("case_id");
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;

CREATE TABLE "audit_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "actor_user_id" uuid,
  "organization_id" uuid,
  "entity_type" text NOT NULL,
  "entity_id" uuid NOT NULL,
  "action" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "audit_events_entity_idx" ON "audit_events" USING btree ("entity_type","entity_id");
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;
