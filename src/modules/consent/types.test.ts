import { describe, expect, it } from "vitest";

import {
  CONSENT_VERSION,
  referralConsentSchema,
} from "@/modules/consent/types";

const IDS = {
  intake: "a1111111-1111-4111-8111-111111111111",
  org: "a2222222-2222-4222-8222-222222222222",
  programme: "a3333333-3333-4333-8333-333333333333",
  parent: "a4444444-4444-4444-8444-444444444444",
};

describe("referral consent schema", () => {
  it("requires programme, fields, and allowContact", () => {
    const ok = referralConsentSchema.safeParse({
      intakeId: IDS.intake,
      organizationId: IDS.org,
      assistanceProgramId: IDS.programme,
      purpose: "Request support",
      fieldsShared: ["confirmed_summary"],
      allowContact: true,
      consentVersion: CONSENT_VERSION,
    });
    expect(ok.success).toBe(true);
  });

  it("rejects consent without allowContact", () => {
    const bad = referralConsentSchema.safeParse({
      intakeId: IDS.intake,
      organizationId: IDS.org,
      assistanceProgramId: IDS.programme,
      purpose: "Request support",
      fieldsShared: ["confirmed_summary"],
      allowContact: false,
      consentVersion: CONSENT_VERSION,
    });
    expect(bad.success).toBe(false);
  });

  it("accepts parentCaseId for alternative referral consent", () => {
    const ok = referralConsentSchema.safeParse({
      intakeId: IDS.intake,
      organizationId: IDS.org,
      assistanceProgramId: IDS.programme,
      purpose: "Alternative referral",
      fieldsShared: ["confirmed_summary", "region"],
      allowContact: true,
      consentVersion: CONSENT_VERSION,
      parentCaseId: IDS.parent,
    });
    expect(ok.success).toBe(true);
  });
});
