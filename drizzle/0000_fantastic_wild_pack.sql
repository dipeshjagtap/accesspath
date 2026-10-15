CREATE TYPE "public"."case_status" AS ENUM('new', 'needs_review', 'ready_for_referral', 'referred', 'contacted', 'assessment_scheduled', 'support_obtained', 'blocked', 'closed_not_completed', 'closed_completed');--> statement-breakpoint
CREATE TYPE "public"."checklist_owner" AS ENUM('user', 'caregiver', 'caseworker');--> statement-breakpoint
CREATE TYPE "public"."checklist_status" AS ENUM('not_started', 'in_progress', 'completed', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."note_visibility" AS ENUM('internal', 'user_visible');--> statement-breakpoint
CREATE TYPE "public"."org_member_role" AS ENUM('org_admin', 'caseworker', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."organization_status" AS ENUM('active', 'inactive', 'pilot');--> statement-breakpoint
CREATE TYPE "public"."organization_type" AS ENUM('ngo', 'rehabilitation_provider', 'hospital', 'disability_support', 'foundation', 'other');--> statement-breakpoint
CREATE TYPE "public"."plan_review_status" AS ENUM('pending', 'accepted', 'needs_human_review', 'failed_fallback');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('provider', 'rehabilitation_service', 'ngo', 'government_scheme', 'supplier', 'support_service');--> statement-breakpoint
CREATE TYPE "public"."support_category" AS ENUM('mobility_aid');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('verified', 'needs_review', 'expired', 'unverified');--> statement-breakpoint
CREATE TABLE "assistance_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"official_url" text,
	"regions" text[] DEFAULT '{}' NOT NULL,
	"purpose" text NOT NULL,
	"verified_requirements" text[] DEFAULT '{}' NOT NULL,
	"application_route" text,
	"verification_status" "verification_status" DEFAULT 'unverified' NOT NULL,
	"last_verified_at" timestamp with time zone,
	"source_notes" text NOT NULL,
	"eligibility_disclaimer" text DEFAULT 'Potentially relevant — confirm eligibility and approval with the official program. AccessPath does not determine final eligibility.' NOT NULL,
	"is_fictional_demo" text DEFAULT 'true' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "case_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"author_user_id" uuid NOT NULL,
	"note" text NOT NULL,
	"visibility" "note_visibility" DEFAULT 'internal' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"intake_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"assigned_to_user_id" uuid,
	"status" "case_status" DEFAULT 'new' NOT NULL,
	"outcome" text,
	"next_action" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "checklist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"source_resource_id" uuid,
	"status" "checklist_status" DEFAULT 'not_started' NOT NULL,
	"owner_type" "checklist_owner" DEFAULT 'user' NOT NULL,
	"due_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"intake_id" uuid NOT NULL,
	"user_id" uuid,
	"organization_id" uuid NOT NULL,
	"purpose" text NOT NULL,
	"fields_shared" text[] DEFAULT '{}' NOT NULL,
	"consent_version" text NOT NULL,
	"consented_at" timestamp with time zone DEFAULT now() NOT NULL,
	"withdrawn_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "intakes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"support_category" "support_category" DEFAULT 'mobility_aid' NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "org_member_role" DEFAULT 'caseworker' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization_type" "organization_type" NOT NULL,
	"regions_served" text[] DEFAULT '{}' NOT NULL,
	"contact_email" text NOT NULL,
	"status" "organization_status" DEFAULT 'pilot' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
	"verification_status" "verification_status" DEFAULT 'unverified' NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text,
	"email" text,
	"preferred_language" text DEFAULT 'en' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_notes" ADD CONSTRAINT "case_notes_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cases" ADD CONSTRAINT "cases_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_source_resource_id_resources_id_fk" FOREIGN KEY ("source_resource_id") REFERENCES "public"."resources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_events" ADD CONSTRAINT "consent_events_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_events" ADD CONSTRAINT "consent_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_events" ADD CONSTRAINT "consent_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intakes" ADD CONSTRAINT "intakes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_intake_id_intakes_id_fk" FOREIGN KEY ("intake_id") REFERENCES "public"."intakes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assistance_programs_verification_idx" ON "assistance_programs" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "audit_events_entity_idx" ON "audit_events" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "case_notes_case_idx" ON "case_notes" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "cases_org_idx" ON "cases" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "cases_status_idx" ON "cases" USING btree ("status");--> statement-breakpoint
CREATE INDEX "checklist_items_plan_idx" ON "checklist_items" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "organization_members_org_idx" ON "organization_members" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "organization_members_user_idx" ON "organization_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resources_region_idx" ON "resources" USING btree ("region");--> statement-breakpoint
CREATE INDEX "resources_verification_idx" ON "resources" USING btree ("verification_status");