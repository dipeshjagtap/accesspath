import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/components/login-form";
import { homePathForUser } from "@/modules/auth/permissions";
import { getCurrentUser } from "@/modules/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in to track your support requests",
  description:
    "Sign in to follow your support requests, manage your organisation, or review providers.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(await homePathForUser(user));
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to follow your requests, manage your organisation, or review providers."
    >
      <LoginForm />
    </AuthShell>
  );
}
