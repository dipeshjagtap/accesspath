/**
 * PRD v2 acceptance journey (domain-level, no browser):
 * intake → plan → consent → decline → alternative consent → outcome.
 */
import { config } from "dotenv";

config({ path: ".env.local" });

import { DEMO_REGION } from "../src/lib/constants";
import { getSql } from "../src/lib/db";
import {
  listCasesForOrganization,
  suggestAlternativeProgrammes,
  updateCaseStatus,
} from "../src/modules/cases/service";
import { createReferralWithConsent } from "../src/modules/consent/service";
import { CONSENT_VERSION } from "../src/modules/consent/types";
import {
  createIntake,
  updateConfirmedSummary,
} from "../src/modules/intakes/service";
import {
  generatePlanForIntake,
  getLatestPlanForIntake,
  updateChecklistItemStatus,
} from "../src/modules/plans/service";
import { matchPublishedProgrammes } from "../src/modules/programmes/repository";
import { getDemoCaseworker } from "../src/modules/organizations/repository";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const started = Date.now();
  const demo = await getDemoCaseworker();
  assert(demo, "Seed demo org staff first (npm run db:seed)");
  assert(
    demo.organization.verificationStatus === "verified",
    "Demo org must be verified",
  );

  const programmes = await matchPublishedProgrammes({
    region: DEMO_REGION,
    categorySlug: "disability_health_support",
  });
  assert(programmes.length >= 1, "Expected published disability programmes");

  const primary =
    programmes.find((p) => p.organizationId === demo.organization.id) ??
    programmes[0]!;
  assert(primary.organizationId, "Programme must have organisation");

  const intake = await createIntake({
    displayName: "Demo Caregiver",
    askingFor: "someone_else",
    region: DEMO_REGION,
    practicalNeeds:
      "Father needs help finding mobility navigation support in Pune.",
    supportCategorySlug: "disability_health_support",
    budgetConstraint: "Prefer affordable options",
    preferredLanguage: "en",
    professionalRecommendationStatus: "unsure",
    accessNeeds: "Prefer phone calls",
  });

  const summary =
    intake.confirmedSummary ??
    "Demo confirmed summary for AccessPath journey verification.";
  await updateConfirmedSummary(intake.id, summary);

  const bundle = await generatePlanForIntake(intake.id);
  assert(bundle.checklist.length > 0, "Checklist must be generated");

  const first = bundle.checklist[0]!;
  await updateChecklistItemStatus(first.id, "completed");
  const refreshed = await getLatestPlanForIntake(intake.id);
  assert(
    refreshed?.checklist.find((item) => item.id === first.id)?.status ===
      "completed",
    "Checklist update failed",
  );

  const { caseRow } = await createReferralWithConsent({
    intakeId: intake.id,
    organizationId: primary.organizationId!,
    assistanceProgramId: primary.id,
    purpose: "Coordinate disability/health support follow-up for the demo journey",
    fieldsShared: ["confirmed_summary", "region", "practical_needs"],
    allowContact: true,
    consentVersion: CONSENT_VERSION,
  });
  assert(caseRow.status === "submitted", "New case must start as submitted");
  assert(caseRow.caseReference.length > 0, "Case reference required");

  await updateCaseStatus(
    {
      caseId: caseRow.id,
      status: "under_review",
      nextAction: "Reviewing capacity",
    },
    { organizationId: primary.organizationId!, userId: demo.user.id },
  );

  await updateCaseStatus(
    {
      caseId: caseRow.id,
      status: "declined",
      statusReason: "Demo decline — capacity full this week",
      nextAction: "User may review alternatives",
      userVisibleNote: "We cannot take new requests this week (demo).",
    },
    { organizationId: primary.organizationId!, userId: demo.user.id },
  );

  const alternatives = await suggestAlternativeProgrammes(caseRow.id);
  assert(alternatives.length > 0, "Expected alternative programmes after decline");
  const alt = alternatives[0]!;
  assert(alt.id !== primary.id, "Alternative must differ from declined programme");

  const { caseRow: altCase } = await createReferralWithConsent(
    {
      intakeId: intake.id,
      organizationId: alt.organizationId!,
      assistanceProgramId: alt.id,
      purpose: "Alternative referral after decline",
      fieldsShared: ["confirmed_summary", "region", "practical_needs"],
      allowContact: true,
      consentVersion: CONSENT_VERSION,
      parentCaseId: caseRow.id,
    },
    demo.user.id,
  );
  assert(altCase.parentCaseId === caseRow.id, "Alternative must link parent case");
  assert(altCase.status === "submitted", "Alternative starts submitted");

  await updateCaseStatus(
    {
      caseId: altCase.id,
      status: "under_review",
    },
    { organizationId: alt.organizationId!, userId: demo.user.id },
  );
  await updateCaseStatus(
    {
      caseId: altCase.id,
      status: "accepted",
      nextAction: "Begin coordination",
    },
    { organizationId: alt.organizationId!, userId: demo.user.id },
  );
  await updateCaseStatus(
    {
      caseId: altCase.id,
      status: "in_progress",
    },
    { organizationId: alt.organizationId!, userId: demo.user.id },
  );
  await updateCaseStatus(
    {
      caseId: altCase.id,
      status: "assistance_delivered",
      outcome: "Demo navigation support completed",
      outcomeConfirmedBy: "organisation staff (demo)",
    },
    { organizationId: alt.organizationId!, userId: demo.user.id },
  );

  const orgCases = await listCasesForOrganization(alt.organizationId!);
  assert(
    orgCases.some((c) => c.caseRow.id === altCase.id),
    "Organisation must see its case",
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        ms: Date.now() - started,
        primaryCase: caseRow.caseReference,
        alternativeCase: altCase.caseReference,
        primaryProgramme: primary.name,
        alternativeProgramme: alt.name,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error: unknown) => {
    console.error("verify:journey failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getSql().end({ timeout: 5 });
  });
