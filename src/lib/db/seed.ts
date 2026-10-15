/**
 * Repeatable seed for the PRD v2 hackathon demo.
 *
 * IMPORTANT:
 * - All organisations and programmes below are FICTIONAL demo records.
 * - Official URLs point to example.com demo paths on purpose.
 * - Do not treat these as real providers or eligibility rules.
 */

import "dotenv/config";

import { DEMO_PASSWORDS, DEMO_REGION } from "@/lib/constants";
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
  sessions,
  supportCategories,
  users,
} from "@/lib/db/schema";
import { hashPassword } from "@/modules/auth/password";

const VERIFIED_AT = new Date("2026-09-15T00:00:00.000Z");
const PUBLISHED_AT = new Date("2026-09-20T00:00:00.000Z");

async function resetDemoTables() {
  const db = getDb();
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
  await db.delete(sessions);
  await db.delete(supportCategories);
  await db.delete(users);
}

async function seed() {
  if (process.env.USE_FICTIONAL_DEMO_DATA === "false") {
    throw new Error(
      "Refusing to seed: USE_FICTIONAL_DEMO_DATA must be true for hackathon demos.",
    );
  }

  console.log("Seeding AccessPath PRD v2 fictional demo data…");
  await resetDemoTables();
  const db = getDb();

  const passwordHashes = {
    user: await hashPassword(DEMO_PASSWORDS.user),
    orgAdmin: await hashPassword(DEMO_PASSWORDS.orgAdmin),
    caseworker: await hashPassword(DEMO_PASSWORDS.caseworker),
    admin: await hashPassword(DEMO_PASSWORDS.admin),
  };

  const [demoUser] = await db
    .insert(users)
    .values({
      displayName: "Riya Sharma (demo user)",
      email: "user.demo@accesspath.example",
      passwordHash: passwordHashes.user,
      role: "user",
    })
    .returning();

  const [orgAdmin] = await db
    .insert(users)
    .values({
      displayName: "Meera Joshi (demo org admin)",
      email: "orgadmin.demo@accesspath.example",
      passwordHash: passwordHashes.orgAdmin,
      role: "user",
    })
    .returning();

  const [caseworker] = await db
    .insert(users)
    .values({
      displayName: "Asha Kulkarni (demo caseworker)",
      email: "caseworker.demo@accesspath.example",
      passwordHash: passwordHashes.caseworker,
      role: "user",
    })
    .returning();

  const [platformAdmin] = await db
    .insert(users)
    .values({
      displayName: "AccessPath Admin (demo)",
      email: "admin.demo@accesspath.example",
      passwordHash: passwordHashes.admin,
      role: "admin",
    })
    .returning();

  if (!demoUser || !orgAdmin || !caseworker || !platformAdmin) {
    throw new Error("Failed to insert demo users");
  }

  const categoryRows = await db
    .insert(supportCategories)
    .values([
      {
        slug: "education_support",
        name: "Education support",
        description:
          "Help finding learning materials, tutoring, school-related support programmes (navigation only).",
        sortOrder: "1",
      },
      {
        slug: "essential_needs",
        name: "Essential needs",
        description:
          "Food, basic supplies, and short-term essential support programmes.",
        sortOrder: "2",
      },
      {
        slug: "disability_health_support",
        name: "Disability / health support",
        description:
          "Navigation to disability and health-related support programmes. Not diagnosis or treatment.",
        sortOrder: "3",
      },
    ])
    .returning();

  const bySlug = Object.fromEntries(categoryRows.map((c) => [c.slug, c]));
  const education = bySlug.education_support!;
  const essential = bySlug.essential_needs!;
  const disability = bySlug.disability_health_support!;

  const [verifiedOrg] = await db
    .insert(organizations)
    .values({
      name: "Sahara Community Support Network (demo)",
      legalName: "Sahara Community Support Network Demo Trust",
      organizationType: "ngo",
      registrationType: "NGO-DARPAN (demo)",
      registrationNumber: "DEMO-MH-2026-0001",
      registrationSourceUrl: "https://example.com/demo/sahara-registration",
      regionsServed: [DEMO_REGION, "Maharashtra (demo)"],
      contactEmail: "referrals.demo@sahara-community.example",
      verificationStatus: "verified",
      verificationCheckedAt: VERIFIED_AT,
      verificationNotes:
        "Demo verification: registration number and contact channel reviewed manually. Not a government endorsement.",
      verifiedByUserId: platformAdmin.id,
      status: "pilot",
      isFictionalDemo: "true",
    })
    .returning();

  const [pendingOrg] = await db
    .insert(organizations)
    .values({
      name: "Pending Horizon Services (demo)",
      legalName: "Pending Horizon Services Demo NPC",
      organizationType: "service_provider",
      registrationType: "MCA/Section 8 (demo)",
      registrationNumber: "DEMO-PENDING-88",
      registrationSourceUrl: "https://example.com/demo/horizon-pending",
      regionsServed: [DEMO_REGION],
      contactEmail: "hello@horizon-pending.example",
      verificationStatus: "pending",
      status: "pilot",
      isFictionalDemo: "true",
    })
    .returning();

  const [altOrg] = await db
    .insert(organizations)
    .values({
      name: "Nirmal Alternative Care Desk (demo)",
      legalName: "Nirmal Alternative Care Desk Demo Society",
      organizationType: "ngo",
      registrationType: "Society (demo)",
      registrationNumber: "DEMO-MH-2026-0042",
      registrationSourceUrl: "https://example.com/demo/nirmal-registration",
      regionsServed: [DEMO_REGION],
      contactEmail: "desk.demo@nirmal-alt.example",
      verificationStatus: "verified",
      verificationCheckedAt: VERIFIED_AT,
      verificationNotes:
        "Demo verification for alternative-referral scenario. Identity evidence reviewed; service quality not guaranteed.",
      verifiedByUserId: platformAdmin.id,
      status: "pilot",
      isFictionalDemo: "true",
    })
    .returning();

  if (!verifiedOrg || !pendingOrg || !altOrg) {
    throw new Error("Failed to insert demo organisations");
  }

  await db.insert(organizationMembers).values([
    {
      organizationId: verifiedOrg.id,
      userId: orgAdmin.id,
      role: "org_admin",
    },
    {
      organizationId: verifiedOrg.id,
      userId: caseworker.id,
      role: "caseworker",
    },
    {
      organizationId: altOrg.id,
      userId: orgAdmin.id,
      role: "org_admin",
    },
  ]);

  await db.insert(resources).values([
    {
      name: "Demo Pune Community Resource Desk",
      resourceType: "ngo",
      description:
        "Fictional desk that helps families navigate local support options. Not a real provider.",
      region: DEMO_REGION,
      categories: ["navigation_support", "referral"],
      publicContactDetails:
        "Phone: +91-20-5550-0101 (demo) · Email: desk@pune-community-demo.example",
      officialUrl: "https://example.com/demo/pune-community-resource-desk",
      accessNotes: "Phone-first enquiry preferred (demo).",
      verificationStatus: "verified",
      lastVerifiedAt: VERIFIED_AT,
      sourceNotes: "Curated fictional demo record for AccessPath hackathon.",
      reviewerName: "AccessPath demo curator",
      reviewNotes: "Verified for demo use only.",
      sponsorshipDisclosure: "No sponsorship. Fictional demo record.",
      isFictionalDemo: "true",
    },
  ]);

  const programmeRows = await db
    .insert(assistancePrograms)
    .values([
      {
        organizationId: verifiedOrg.id,
        categoryId: education.id,
        name: "Demo After-School Learning Kit Programme",
        description:
          "Fictional programme that may provide learning kits and tutoring referrals for school-age children in the demo region.",
        purpose: "Education support navigation — fictional demo programme.",
        officialUrl: "https://example.com/demo/after-school-learning-kit",
        evidenceUrl: "https://example.com/demo/after-school-learning-kit/evidence",
        regions: [DEMO_REGION],
        eligibilityCriteria: {
          notes: "Illustrative only — confirm with the organisation.",
          age_band: "6–16 (demo)",
        },
        verifiedRequirements: [
          "School enrolment note if requested (demo)",
          "Caregiver contact details",
        ],
        requiredDocuments: [
          "Brief written request",
          "Optional school ID copy (do not upload medical records)",
        ],
        availabilityStatus: "accepting_requests",
        applicationRoute: "Submit a consent-based request via AccessPath demo.",
        verificationStatus: "verified",
        lastVerifiedAt: VERIFIED_AT,
        nextReviewAt: new Date("2027-03-15T00:00:00.000Z"),
        publishedAt: PUBLISHED_AT,
        sourceNotes: "Fictional education programme for multi-category demo.",
        isFictionalDemo: "true",
      },
      {
        organizationId: verifiedOrg.id,
        categoryId: essential.id,
        name: "Demo Essentials Food Basket Desk",
        description:
          "Fictional short-term food and basic supplies desk for demonstration of essential-needs matching.",
        purpose: "Essential needs — fictional demo programme.",
        officialUrl: "https://example.com/demo/essentials-food-basket",
        evidenceUrl: "https://example.com/demo/essentials-food-basket/evidence",
        regions: [DEMO_REGION],
        eligibilityCriteria: {
          notes: "Short-term support only (demo). Confirm availability weekly.",
        },
        verifiedRequirements: ["Self-declared need summary"],
        requiredDocuments: ["Contact phone number"],
        availabilityStatus: "accepting_requests",
        applicationRoute: "Submit a consent-based request via AccessPath demo.",
        verificationStatus: "verified",
        lastVerifiedAt: VERIFIED_AT,
        publishedAt: PUBLISHED_AT,
        sourceNotes: "Fictional essentials programme.",
        isFictionalDemo: "true",
      },
      {
        organizationId: verifiedOrg.id,
        categoryId: disability.id,
        name: "Demo Mobility Navigation Clinic Link",
        description:
          "Fictional programme that helps people find mobility assessment pathways. Does not diagnose or prescribe devices.",
        purpose: "Disability/health support navigation — fictional demo.",
        officialUrl: "https://example.com/demo/mobility-navigation-clinic",
        evidenceUrl: "https://example.com/demo/mobility-navigation-clinic/evidence",
        regions: [DEMO_REGION, "Maharashtra (demo)"],
        eligibilityCriteria: {
          notes: "Navigation only. Clinical decisions require qualified professionals.",
        },
        verifiedRequirements: [
          "Practical need description",
          "Preferred contact method",
        ],
        requiredDocuments: ["None required to start a request (demo)"],
        availabilityStatus: "accepting_requests",
        applicationRoute: "Submit a consent-based request via AccessPath demo.",
        verificationStatus: "verified",
        lastVerifiedAt: VERIFIED_AT,
        publishedAt: PUBLISHED_AT,
        sourceNotes: "Primary disability/health demo programme (often declined in e2e scenario).",
        isFictionalDemo: "true",
      },
      {
        organizationId: altOrg.id,
        categoryId: disability.id,
        name: "Demo Alternate Assistive Pathway Desk",
        description:
          "Fictional alternative programme used when the primary mobility navigation request is declined or stalls.",
        purpose: "Alternative disability/health support — fictional demo.",
        officialUrl: "https://example.com/demo/alternate-assistive-pathway",
        evidenceUrl: "https://example.com/demo/alternate-assistive-pathway/evidence",
        regions: [DEMO_REGION],
        eligibilityCriteria: {
          notes: "Accepts referrals after prior decline with fresh user consent.",
        },
        verifiedRequirements: ["Prior request summary (shared only with consent)"],
        requiredDocuments: ["Contact details"],
        availabilityStatus: "accepting_requests",
        applicationRoute: "Alternative referral after user consent.",
        verificationStatus: "verified",
        lastVerifiedAt: VERIFIED_AT,
        publishedAt: PUBLISHED_AT,
        sourceNotes: "Alternative programme for recovery journey.",
        isFictionalDemo: "true",
      },
      {
        organizationId: pendingOrg.id,
        categoryId: essential.id,
        name: "Demo Unpublished Pending Org Programme",
        description: "Should not appear in live matching (org pending).",
        purpose: "Must remain gated.",
        regions: [DEMO_REGION],
        verifiedRequirements: [],
        requiredDocuments: [],
        availabilityStatus: "accepting_requests",
        verificationStatus: "unverified",
        publishedAt: null,
        sourceNotes: "Gating test — pending org.",
        isFictionalDemo: "true",
      },
    ])
    .returning();

  await db.insert(auditEvents).values({
    actorUserId: platformAdmin.id,
    organizationId: verifiedOrg.id,
    entityType: "seed",
    entityId: verifiedOrg.id,
    action: "demo_seed_completed",
    metadata: {
      region: DEMO_REGION,
      programmeCount: programmeRows.length,
      fictional: true,
      categories: categoryRows.map((c) => c.slug),
      note: "PRD v2 hackathon demo seed — no real beneficiary data",
    },
  });

  console.log("Seed complete (all fictional):");
  console.log(`  region: ${DEMO_REGION}`);
  console.log(`  categories: ${categoryRows.map((c) => c.slug).join(", ")}`);
  console.log(`  programmes: ${programmeRows.length}`);
  console.log("  Demo logins:");
  console.log(`    user:       user.demo@accesspath.example / ${DEMO_PASSWORDS.user}`);
  console.log(`    org admin:  orgadmin.demo@accesspath.example / ${DEMO_PASSWORDS.orgAdmin}`);
  console.log(`    caseworker: caseworker.demo@accesspath.example / ${DEMO_PASSWORDS.caseworker}`);
  console.log(`    admin:      admin.demo@accesspath.example / ${DEMO_PASSWORDS.admin}`);
}

seed()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getSql().end({ timeout: 5 });
  });
