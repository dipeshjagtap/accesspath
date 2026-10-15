"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/session";
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
  const user = await getCurrentUser();
  const allowContact = formData.get("allowContact") === "on";
  const fieldsShared = formData.getAll("fieldsShared").map(String);
  const parentRaw = String(formData.get("parentCaseId") || "").trim();

  const parsed = referralConsentSchema.safeParse({
    intakeId: String(formData.get("intakeId") || ""),
    organizationId: String(formData.get("organizationId") || ""),
    assistanceProgramId: String(formData.get("assistanceProgramId") || ""),
    purpose: String(formData.get("purpose") || ""),
    fieldsShared,
    allowContact: allowContact ? true : false,
    consentVersion: CONSENT_VERSION,
    parentCaseId: parentRaw || undefined,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message:
        "Please review the consent details, select a programme, fields to share, and confirm contact permission.",
    };
  }

  try {
    const { caseRow } = await createReferralWithConsent(
      parsed.data,
      user?.id ?? null,
    );
    redirect(`/dashboard/cases/${caseRow.id}?from=consent`);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not submit request",
    };
  }
}
