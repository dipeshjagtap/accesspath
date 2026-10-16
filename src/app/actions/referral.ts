"use server";

import { redirect } from "next/navigation";

import { AuthError, assertCanSubmitNeeds } from "@/modules/auth/permissions";
import type { AuthUser } from "@/modules/auth/session";
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
  let user: AuthUser | null;
  try {
    user = await assertCanSubmitNeeds();
  } catch (error) {
    if (error instanceof AuthError) return { ok: false, message: error.message };
    throw error;
  }
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
        "Choose at least one detail to share, keep a reason for sharing, and tick the consent box to send your request.",
    };
  }

  let caseId: string;
  try {
    const { caseRow } = await createReferralWithConsent(
      parsed.data,
      user?.id ?? null,
    );
    caseId = caseRow.id;
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Could not submit request",
    };
  }
  redirect(`/dashboard/cases/${caseId}?from=consent`);
}
