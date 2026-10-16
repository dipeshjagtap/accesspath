"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { AuthError, requireOrgMember } from "@/modules/auth/permissions";
import {
  addOrgMemberByEmail,
  removeOrgMember,
  updateOrgMemberRole,
} from "@/modules/organizations/repository";

export type OrgMemberActionState = {
  ok: boolean;
  message?: string;
};

const roleSchema = z.enum(["org_admin", "caseworker", "viewer"]);

const addMemberSchema = z.object({
  organizationId: z.string().uuid(),
  email: z.string().trim().email().max(200),
  role: roleSchema,
});

const changeRoleSchema = z.object({
  organizationId: z.string().uuid(),
  membershipId: z.string().uuid(),
  role: roleSchema,
});

const removeMemberSchema = z.object({
  organizationId: z.string().uuid(),
  membershipId: z.string().uuid(),
});

function toErrorState(error: unknown, fallback: string): OrgMemberActionState {
  if (error instanceof AuthError) {
    return { ok: false, message: error.message };
  }
  return {
    ok: false,
    message: error instanceof Error ? error.message : fallback,
  };
}

export async function addOrgMemberAction(
  _prev: OrgMemberActionState,
  formData: FormData,
): Promise<OrgMemberActionState> {
  const parsed = addMemberSchema.safeParse({
    organizationId: String(formData.get("organizationId") || ""),
    email: String(formData.get("email") || ""),
    role: String(formData.get("role") || ""),
  });
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email and role." };
  }

  try {
    const membership = await requireOrgMember(parsed.data.organizationId, [
      "org_admin",
    ]);
    await addOrgMemberByEmail({
      organizationId: membership.organization.id,
      email: parsed.data.email,
      role: parsed.data.role,
      actorUserId: membership.user.id,
    });
  } catch (error) {
    return toErrorState(error, "Could not add member");
  }

  revalidatePath("/org/members");
  return { ok: true, message: `Added ${parsed.data.email}.` };
}

export async function changeOrgMemberRoleAction(
  _prev: OrgMemberActionState,
  formData: FormData,
): Promise<OrgMemberActionState> {
  const parsed = changeRoleSchema.safeParse({
    organizationId: String(formData.get("organizationId") || ""),
    membershipId: String(formData.get("membershipId") || ""),
    role: String(formData.get("role") || ""),
  });
  if (!parsed.success) {
    return { ok: false, message: "Invalid role change." };
  }

  try {
    const membership = await requireOrgMember(parsed.data.organizationId, [
      "org_admin",
    ]);
    await updateOrgMemberRole({
      organizationId: membership.organization.id,
      membershipId: parsed.data.membershipId,
      role: parsed.data.role,
      actorUserId: membership.user.id,
    });
  } catch (error) {
    return toErrorState(error, "Could not change role");
  }

  revalidatePath("/org/members");
  return { ok: true, message: "Role updated." };
}

export async function removeOrgMemberAction(
  _prev: OrgMemberActionState,
  formData: FormData,
): Promise<OrgMemberActionState> {
  const parsed = removeMemberSchema.safeParse({
    organizationId: String(formData.get("organizationId") || ""),
    membershipId: String(formData.get("membershipId") || ""),
  });
  if (!parsed.success) {
    return { ok: false, message: "Invalid member." };
  }

  try {
    const membership = await requireOrgMember(parsed.data.organizationId, [
      "org_admin",
    ]);
    await removeOrgMember({
      organizationId: membership.organization.id,
      membershipId: parsed.data.membershipId,
      actorUserId: membership.user.id,
    });
  } catch (error) {
    return toErrorState(error, "Could not remove member");
  }

  revalidatePath("/org/members");
  return { ok: true, message: "Member removed." };
}
