"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/lib/db";
import { assistancePrograms } from "@/lib/db/schema";
import { AuthError, requireOrgMember } from "@/modules/auth/permissions";
import { updateCaseStatus } from "@/modules/cases/service";
import { updateCaseStatusSchema } from "@/modules/cases/types";
import { eq } from "drizzle-orm";
import { z } from "zod";

export type OrgActionState = {
  ok: boolean;
  message?: string;
};

export async function updateOrgCaseStatusAction(
  _prev: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  const organizationId = String(formData.get("organizationId") || "");
  try {
    const membership = await requireOrgMember(organizationId, [
      "org_admin",
      "caseworker",
    ]);

    const parsed = updateCaseStatusSchema.safeParse({
      caseId: String(formData.get("caseId") || ""),
      status: String(formData.get("status") || ""),
      statusReason: emptyToUndefined(formData.get("statusReason")),
      nextAction: emptyToUndefined(formData.get("nextAction")),
      outcome: emptyToUndefined(formData.get("outcome")),
      outcomeConfirmedBy: emptyToUndefined(formData.get("outcomeConfirmedBy")),
      userVisibleNote: emptyToUndefined(formData.get("userVisibleNote")),
    });

    if (!parsed.success) {
      return { ok: false, message: "Invalid case update." };
    }

    await updateCaseStatus(parsed.data, {
      organizationId: membership.organization.id,
      userId: membership.user.id,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: error.message };
    }
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Update failed",
    };
  }

  revalidatePath("/org");
  redirect(`/org/cases/${String(formData.get("caseId"))}`);
}

const programmeSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(4000),
  purpose: z.string().trim().min(1).max(1000),
  categoryId: z.string().uuid(),
  regions: z.string().trim().min(1),
  requiredDocuments: z.string().optional(),
  availabilityStatus: z.enum([
    "accepting_requests",
    "waitlist",
    "temporarily_unavailable",
    "closed",
    "unknown",
  ]),
  officialUrl: z.string().url().optional().or(z.literal("")),
  evidenceUrl: z.string().url().optional().or(z.literal("")),
  publish: z.boolean(),
});

export async function upsertProgrammeAction(
  _prev: OrgActionState,
  formData: FormData,
): Promise<OrgActionState> {
  const organizationId = String(formData.get("organizationId") || "");
  const programmeId = String(formData.get("programmeId") || "").trim();

  try {
    const membership = await requireOrgMember(organizationId, ["org_admin"]);
    const parsed = programmeSchema.safeParse({
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      purpose: String(formData.get("purpose") || ""),
      categoryId: String(formData.get("categoryId") || ""),
      regions: String(formData.get("regions") || ""),
      requiredDocuments: String(formData.get("requiredDocuments") || ""),
      availabilityStatus: String(formData.get("availabilityStatus") || "unknown"),
      officialUrl: String(formData.get("officialUrl") || ""),
      evidenceUrl: String(formData.get("evidenceUrl") || ""),
      publish: formData.get("publish") === "on",
    });

    if (!parsed.success) {
      return { ok: false, message: "Please check programme fields." };
    }

    const regions = parsed.data.regions
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
    const requiredDocuments = (parsed.data.requiredDocuments || "")
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const db = getDb();
    const values = {
      organizationId: membership.organization.id,
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      description: parsed.data.description,
      purpose: parsed.data.purpose,
      regions,
      requiredDocuments,
      availabilityStatus: parsed.data.availabilityStatus,
      officialUrl: parsed.data.officialUrl || null,
      evidenceUrl: parsed.data.evidenceUrl || null,
      verificationStatus: "needs_review" as const,
      sourceNotes: "Organisation-submitted programme (demo). Pending review.",
      publishedAt: parsed.data.publish ? new Date() : null,
      isFictionalDemo: "true",
      updatedAt: new Date(),
    };

    if (programmeId) {
      await db
        .update(assistancePrograms)
        .set(values)
        .where(eq(assistancePrograms.id, programmeId));
    } else {
      await db.insert(assistancePrograms).values(values);
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: error.message };
    }
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Save failed",
    };
  }

  revalidatePath("/org/programmes");
  redirect("/org/programmes");
}

function emptyToUndefined(value: FormDataEntryValue | null) {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}
