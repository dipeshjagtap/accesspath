"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AuthError, requireAdmin } from "@/modules/auth/permissions";
import { updateOrganizationVerification } from "@/modules/organizations/repository";

export type AdminActionState = {
  ok: boolean;
  message?: string;
};

const verificationSchema = z.object({
  organizationId: z.string().uuid(),
  verificationStatus: z.enum([
    "pending",
    "in_review",
    "verified",
    "rejected",
    "suspended",
    "recheck_required",
  ]),
  verificationNotes: z.string().trim().max(2000).optional(),
});

export async function decideVerificationAction(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const admin = await requireAdmin();
    const parsed = verificationSchema.safeParse({
      organizationId: String(formData.get("organizationId") || ""),
      verificationStatus: String(formData.get("verificationStatus") || ""),
      verificationNotes: String(formData.get("verificationNotes") || "") || undefined,
    });

    if (!parsed.success) {
      return { ok: false, message: "Invalid verification decision." };
    }

    await updateOrganizationVerification({
      organizationId: parsed.data.organizationId,
      verificationStatus: parsed.data.verificationStatus,
      verificationNotes: parsed.data.verificationNotes,
      actorUserId: admin.id,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: error.message };
    }
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Decision failed",
    };
  }

  revalidatePath("/admin");
  return { ok: true, message: "Verification decision saved." };
}
