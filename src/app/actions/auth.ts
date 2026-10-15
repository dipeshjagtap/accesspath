"use server";

import { redirect } from "next/navigation";

import { listMembershipsForUser } from "@/modules/auth/permissions";
import {
  loginSchema,
  loginUser,
  logoutUser,
  registerSchema,
  registerUser,
} from "@/modules/auth/service";

export type AuthActionState = {
  ok: boolean;
  message?: string;
};

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    displayName: String(formData.get("displayName") || ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please provide a valid name, email, and password (8+ characters).",
    };
  }

  try {
    await registerUser(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Registration failed",
    };
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  });

  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email and password." };
  }

  let user;
  try {
    user = await loginUser(parsed.data);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Login failed",
    };
  }

  if (user.role === "admin") {
    redirect("/admin");
  }

  const memberships = await listMembershipsForUser(user.id);
  if (memberships.length > 0) {
    redirect("/org");
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await logoutUser();
  redirect("/");
}
