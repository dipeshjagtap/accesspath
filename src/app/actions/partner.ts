"use server";

import { revalidatePath } from "next/cache";

import { isPartnerAuthorized } from "@/lib/partner-auth";
import { updateCaseStatus } from "@/modules/cases/service";
import { updateCaseStatusSchema } from "@/modules/cases/types";
import { getDemoCaseworker } from "@/modules/organizations/repository";

export async function updatePartnerCaseStatusAction(formData: FormData) {
  if (!(await isPartnerAuthorized())) {
    throw new Error("Unauthorized partner access");
  }

  const demo = await getDemoCaseworker();
  if (!demo) {
    throw new Error("Demo partner staff not seeded");
  }

  const parsed = updateCaseStatusSchema.safeParse({
    caseId: String(formData.get("caseId") || ""),
    status: String(formData.get("status") || ""),
    nextAction: emptyToUndefined(formData.get("nextAction")),
    outcome: emptyToUndefined(formData.get("outcome")),
  });

  if (!parsed.success) {
    throw new Error("Invalid case update");
  }

  await updateCaseStatus(parsed.data, {
    organizationId: demo.organization.id,
    userId: demo.user.id,
  });

  revalidatePath("/partner");
  revalidatePath(`/partner/cases/${parsed.data.caseId}`);
}

function emptyToUndefined(value: FormDataEntryValue | null) {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}
