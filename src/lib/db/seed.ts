/**
 * Repeatable seed for the hackathon demo.
 *
 * IMPORTANT (PRD §10, §13, §21):
 * - All profiles and providers below are FICTIONAL demo records.
 * - Official URLs point to example.com demo paths on purpose.
 * - Do not treat these as real providers or eligibility rules.
 * - AI must only cite facts that appear in curated DB rows.
 */

import "dotenv/config";

import { getDb, getSql } from "@/lib/db";
import {
  assistancePrograms,
  auditEvents,
  caseNotes,
  cases,
  checklistItems,
  consentEvents,
  intakes,
  organizationMembers,
  organizations,
  plans,
  resources,
  users,
} from "@/lib/db/schema";

const DEMO_REGION = "Pune, Maharashtra (demo)";
const VERIFIED_AT = new Date("2026-09-15T00:00:00.000Z");

async function resetDemoTables() {
  const db = getDb();
  // Child tables first
  await db.delete(auditEvents);
  await db.delete(caseNotes);
  await db.delete(consentEvents);
  await db.delete(cases);
  await db.delete(checklistItems);
  await db.delete(plans);
  await db.delete(intakes);
  await db.delete(organizationMembers);
  await db.delete(assistancePrograms);
  await db.delete(resources);
  await db.delete(organizations);
  await db.delete(users);
}

async function seed() {
  if (process.env.USE_FICTIONAL_DEMO_DATA === "false") {
    throw new Error(
      "Refusing to seed: USE_FICTIONAL_DEMO_DATA must be true for hackathon demos.",
    );
  }

  console.log("Seeding AccessPath fictional demo data…");
  await resetDemoTables();
  const db = getDb();

  const [caseworker] = await db
    .insert(users)
    .values({
      displayName: "Asha Kulkarni (demo caseworker)",
      email: "asha.demo@accesspath.example",
      preferredLanguage: "en",
    })
    .returning();

  if (!caseworker) {
    throw new Error("Failed to insert demo caseworker");
  }

  const [partnerOrg] = await db
    .insert(organizations)
    .values({
      name: "Sahara Mobility Support Network (demo)",
      organizationType: "ngo",
      regionsServed: [DEMO_REGION, "Maharashtra (demo)"],
      contactEmail: "referrals.demo@sahara-mobility.example",
      status: "pilot",
    })
    .returning();

  if (!partnerOrg) {
    throw new Error("Failed to insert demo organization");
  }

  await db.insert(organizationMembers).values({
    organizationId: partnerOrg.id,
    userId: caseworker.id,
    role: "caseworker",
  });

  const insertedResources = await db
    .insert(resources)
    .values([
      {
        name: "Demo Pune Mobility Assessment Clinic",
        resourceType: "rehabilitation_service",
        description:
          "Fictional clinic that offers mobility assessments and fitting guidance. Not a real provider.",
        region: DEMO_REGION,
        categories: ["mobility_aid", "assessment", "fitting"],
        publicContactDetails:
          "Phone: +91-20-5550-0101 (demo) · Email: intake@pune-mobility-demo.example",
        officialUrl: "https://example.com/demo/pune-mobility-assessment-clinic",
        accessNotes:
          "Walk-in enquiry hours Mon–Fri 10:00–16:00 (demo). Ask whether a clinical assessment is required before selecting a device.",
        verificationStatus: "verified",
        lastVerifiedAt: VERIFIED_AT,
        sourceNotes:
          "Curated fictional demo record for AccessPath hackathon. Source: internal demo catalogue v1.",
        reviewerName: "AccessPath demo curator",
        reviewNotes: "Verified for demo use only — not a live provider.",
        accessibilityInfo:
          "Ground-floor reception (demo). Request interpreter support when booking.",
        sponsorshipDisclosure: "No sponsorship. Fictional demo record.",
        isFictionalDemo: "true",
      },
      {
        name: "Demo Riverbend Assistive Device Supplier",
        resourceType: "supplier",
        description:
          "Fictional supplier listing wheelchairs and walking aids for demonstration. Prices and stock are not real.",
        region: DEMO_REGION,
        categories: ["mobility_aid", "wheelchair", "walker"],
        publicContactDetails:
          "Phone: +91-20-5550-0202 (demo) · Email: sales@riverbend-aids-demo.example",
        officialUrl: "https://example.com/demo/riverbend-assistive-supplier",
        accessNotes:
          "Confirm availability, fitting, maintenance, and total cost directly with the supplier. Demo record only.",
        verificationStatus: "verified",
        lastVerifiedAt: VERIFIED_AT,
        sourceNotes:
          "Curated fictional demo record for AccessPath hackathon. Source: internal demo catalogue v1.",
        reviewerName: "AccessPath demo curator",
        reviewNotes: "Do not invent prices beyond what is stored here (none).",
        accessibilityInfo: "Step-free shop entrance (demo claim).",
        sponsorshipDisclosure: "No sponsorship. Fictional demo record.",
        isFictionalDemo: "true",
      },
      {
        name: "Demo Community Access NGO — Pune Desk",
        resourceType: "ngo",
        description:
          "Fictional NGO desk that helps families prepare documents and navigate local support options.",
        region: DEMO_REGION,
        categories: ["mobility_aid", "navigation_support", "referral"],
        publicContactDetails:
          "Phone: +91-20-5550-0303 (demo) · Email: help@community-access-demo.example",
        officialUrl: "https://example.com/demo/community-access-ngo-pune",
        accessNotes:
          "Can help with referral coordination after explicit consent. Does not diagnose or prescribe devices.",
        verificationStatus: "verified",
        lastVerifiedAt: VERIFIED_AT,
        sourceNotes:
          "Curated fictional demo record for AccessPath hackathon. Source: internal demo catalogue v1.",
        reviewerName: "AccessPath demo curator",
        reviewNotes: "Partner-style support organization for demo journey.",
        accessibilityInfo: "Phone-first enquiry preferred (demo).",
        sponsorshipDisclosure: "No sponsorship. Fictional demo record.",
        isFictionalDemo: "true",
      },
      {
        name: "Expired Demo Listing (intentional)",
        resourceType: "provider",
        description:
          "Intentionally expired fictional listing used to demonstrate verification labelling.",
        region: DEMO_REGION,
        categories: ["mobility_aid"],
        publicContactDetails: "Do not contact — expired demo record.",
        officialUrl: "https://example.com/demo/expired-provider",
        accessNotes: "Excluded from primary results when status is expired.",
        verificationStatus: "expired",
        lastVerifiedAt: new Date("2024-01-01T00:00:00.000Z"),
        sourceNotes: "Expired on purpose for UI/demo edge-case coverage.",
        reviewerName: "AccessPath demo curator",
        reviewNotes: "Keep expired to show honest verification states.",
        sponsorshipDisclosure: "No sponsorship. Fictional demo record.",
        isFictionalDemo: "true",
      },
    ])
    .returning();

  await db.insert(assistancePrograms).values([
    {
      name: "Demo State Mobility Support Scheme (fictional)",
      officialUrl: "https://example.com/demo/state-mobility-support-scheme",
      regions: [DEMO_REGION, "Maharashtra (demo)"],
      purpose:
        "Fictional scheme that may help eligible residents with part of mobility-aid costs. Rules are illustrative only.",
      verifiedRequirements: [
        "Proof of residence in the demo region (confirm with official program)",
        "Assessment note from a qualified professional when required by the program",
        "Completed application form from the official program office",
      ],
      applicationRoute:
        "Apply only through the official program channel listed on the scheme page. AccessPath does not submit applications.",
      verificationStatus: "verified",
      lastVerifiedAt: VERIFIED_AT,
      sourceNotes:
        "Fictional assistance program for hackathon grounding demos. Not a government scheme.",
      eligibilityDisclaimer:
        "Potentially relevant — confirm eligibility and approval with the official program. AccessPath does not determine final eligibility.",
      isFictionalDemo: "true",
    },
    {
      name: "Demo Charitable Mobility Grant (fictional)",
      officialUrl: "https://example.com/demo/charitable-mobility-grant",
      regions: [DEMO_REGION],
      purpose:
        "Fictional charitable grant that may support families with documented financial need.",
      verifiedRequirements: [
        "Written request describing the practical need",
        "Income self-declaration if requested by the grant office",
      ],
      applicationRoute:
        "Contact the grant office via the official demo URL. Approval is never guaranteed.",
      verificationStatus: "needs_review",
      lastVerifiedAt: VERIFIED_AT,
      sourceNotes:
        "Fictional grant with needs_review status to demonstrate cautious labelling.",
      eligibilityDisclaimer:
        "Potentially relevant — confirm eligibility and approval with the official program. AccessPath does not determine final eligibility.",
      isFictionalDemo: "true",
    },
  ]);

  await db.insert(auditEvents).values({
    actorUserId: caseworker.id,
    organizationId: partnerOrg.id,
    entityType: "seed",
    entityId: partnerOrg.id,
    action: "demo_seed_completed",
    metadata: {
      region: DEMO_REGION,
      resourceCount: insertedResources.length,
      fictional: true,
      note: "Hackathon demo seed — no real beneficiary data",
    },
  });

  console.log("Seed complete:");
  console.log(`  region: ${DEMO_REGION}`);
  console.log(`  resources: ${insertedResources.length}`);
  console.log(`  partner org: ${partnerOrg.name}`);
  console.log(`  caseworker: ${caseworker.displayName}`);
  console.log("  All records are fictional demo data.");
}

seed()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getSql().end({ timeout: 5 });
  });
