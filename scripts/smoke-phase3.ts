import { config } from "dotenv";

config({ path: ".env.local" });

import { DEMO_REGION } from "../src/lib/constants";
import { getSql } from "../src/lib/db";
import {
  listCasesForOrganization,
  updateCaseStatus,
} from "../src/modules/cases/service";
import { createReferralWithConsent } from "../src/modules/consent/service";
import { CONSENT_VERSION } from "../src/modules/consent/types";
import {
  createIntake,
  updateConfirmedSummary,
} from "../src/modules/intakes/service";
import { generatePlanForIntake } from "../src/modules/plans/service";
import { matchPublishedProgrammes } from "../src/modules/programmes/repository";
import { getDemoCaseworker } from "../src/modules/organizations/repository";

async function main() {
  const demo = await getDemoCaseworker();
  if (!demo) throw new Error("Missing demo caseworker/org");

  const programmes = await matchPublishedProgrammes({
    region: DEMO_REGION,
    categorySlug: "disability_health_support",
  });
  const programme =
    programmes.find((p) => p.organizationId === demo.organization.id) ??
    programmes[0];
  if (!programme?.organizationId) {
    throw new Error("No published programme for smoke test");
  }

  const intake = await createIntake({
    askingFor: "self",
    region: DEMO_REGION,
    practicalNeeds: "Need help finding mobility assessment options.",
    supportCategorySlug: "disability_health_support",
    preferredLanguage: "en",
  });
  await updateConfirmedSummary(
    intake.id,
    intake.confirmedSummary ?? "Demo confirmed summary",
  );
  await generatePlanForIntake(intake.id);

  const { caseRow, consent } = await createReferralWithConsent({
    intakeId: intake.id,
    organizationId: programme.organizationId,
    assistanceProgramId: programme.id,
    purpose: "Coordinate support follow-up",
    fieldsShared: ["confirmed_summary", "region"],
    allowContact: true,
    consentVersion: CONSENT_VERSION,
  });

  await updateCaseStatus(
    {
      caseId: caseRow.id,
      status: "under_review",
      nextAction: "Schedule assessment call",
    },
    { organizationId: programme.organizationId, userId: demo.user.id },
  );

  const cases = await listCasesForOrganization(programme.organizationId);
  const found = cases.find((item) => item.caseRow.id === caseRow.id);
  if (!found || found.caseRow.status !== "under_review") {
    throw new Error("Partner case update failed");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        consentId: consent.id,
        caseId: caseRow.id,
        status: found.caseRow.status,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getSql().end({ timeout: 5 });
  });
