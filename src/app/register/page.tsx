import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/components/register-form";
import { homePathForUser } from "@/modules/auth/permissions";
import { getCurrentUser } from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account – individuals and organisations",
  description:
    "Register for free as an individual to track support requests, or register your organisation to publish programmes.",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(await homePathForUser(user));
  }

  return (
    <AuthShell
      title="Join AccessPath"
      subtitle="Create a free account as an individual, or register your organisation to publish programmes."
    >
      <RegisterForm />
    </AuthShell>
  );
}
