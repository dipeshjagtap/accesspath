"use server";

import { redirect } from "next/navigation";

import { createReferralWithConsent } from "@/modules/consent/service";
import {
  CONSENT_VERSION,
  referralConsentSchema,
} from "@/modules/consent/types";

export type ReferralActionState = {
  ok: boolean;
  message?: string;
};

export async function submitReferralConsentAction(
  _prev: ReferralActionState,
  formData: FormData,
): Promise<ReferralActionState> {
  const allowContact = formData.get("allowContact") === "on";
  const fieldsShared = formData.getAll("fieldsShared").map(String);

  const parsed = referralConsentSchema.safeParse({
    intakeId: String(formData.get("intakeId") || ""),
    organizationId: String(formData.get("organizationId") || ""),
    purpose: String(formData.get("purpose") || ""),
    fieldsShared,
    allowContact: allowContact ? true : false,
    consentVersion: CONSENT_VERSION,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message:
        "Please review the consent details, select fields to share, and confirm contact permission.",
    };
  }

  const { caseRow } = await createReferralWithConsent(parsed.data);
  redirect(`/partner/cases/${caseRow.id}?from=consent`);
}
