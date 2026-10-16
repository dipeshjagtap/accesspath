import { MessageSquareText } from "lucide-react";
import type { Metadata } from "next";

import { IntakeForm } from "@/components/intake-form";
import { PageHero } from "@/components/page-hero";
import { StaffAccountNotice } from "@/components/staff-account-notice";
import { accountKindFor, canSubmitNeeds } from "@/modules/auth/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { listActiveCategories } from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Describe your support need",
  description:
    "Tell us what you need in your own words. You review a plain-language summary before anything is matched or shared.",
};

export default async function IntakePage() {
  const user = await getCurrentUser();
  const kind = await accountKindFor(user);
  if (!canSubmitNeeds(kind)) {
    return <StaffAccountNotice kind={kind} />;
  }

  const categories = await listActiveCategories();

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="Step 1 of 3"
        icon={MessageSquareText}
        title="Tell us what you need"
        description="Describe your situation in your own words. You will review a plain-language summary before anything is matched or shared."
      />
      <IntakeForm
        signedIn={Boolean(user)}
        categories={categories.map((c) => ({
          slug: c.slug,
          name: c.name,
          description: c.description,
        }))}
      />
    </main>
  );
}
