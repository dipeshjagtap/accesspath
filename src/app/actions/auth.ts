"use server";

import { redirect } from "next/navigation";

import { homePathForUser } from "@/modules/auth/permissions";
import {
  loginSchema,
  loginUser,
  logoutUser,
  registerOrganization,
  registerOrganizationSchema,
  registerSchema,
  registerUser,
} from "@/modules/auth/service";
import { getCurrentUser } from "@/modules/auth/session";

function optionalField(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : undefined;
}

export type AuthActionState = {
  ok: boolean;
  message?: string;
};

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const current = await getCurrentUser();
  if (current) {
    redirect(await homePathForUser(current));
  }

  const account = {
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    displayName: String(formData.get("displayName") || ""),
  };

  if (formData.get("accountType") === "organization") {
    const parsedOrg = registerOrganizationSchema.safeParse({
      ...account,
      organizationName: String(formData.get("organizationName") || ""),
      organizationType: String(formData.get("organizationType") || ""),
      contactEmail: optionalField(formData.get("contactEmail")),
      registrationType: optionalField(formData.get("registrationType")),
      registrationNumber: optionalField(formData.get("registrationNumber")),
      regionsServed: optionalField(formData.get("regionsServed")),
    });

    if (!parsedOrg.success) {
      return {
        ok: false,
        message:
          "Please provide your name, email, password (8+ characters), organisation name, and organisation type.",
      };
    }

    try {
      await registerOrganization(parsedOrg.data);
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Registration failed",
      };
    }

    redirect("/org");
  }

  const parsed = registerSchema.safeParse(account);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        "Please provide a valid name, email, and password (8+ characters).",
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

  redirect(await homePathForUser(user));
}

export async function logoutAction(): Promise<void> {
  await logoutUser();
  redirect("/");
}
