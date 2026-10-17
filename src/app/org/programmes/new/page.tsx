import { ArrowLeft, ClipboardPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProgrammeForm } from "@/components/programme-form";
import { heroSecondaryAction, PageHero } from "@/components/page-hero";
import { DEMO_REGION } from "@/lib/constants";
import { requireAnyOrgMember } from "@/modules/auth/permissions";
import { listActiveCategories } from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publish a new support programme",
};

export default async function NewProgrammePage() {
  let membership;
  try {
    membership = await requireAnyOrgMember(["org_admin"]);
  } catch {
    redirect("/login");
  }

  const categories = await listActiveCategories();

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="3 short steps"
        icon={ClipboardPlus}
        title="Publish a support programme"
        description="Answer three prompts. Keep demo listings clearly fictional — new programmes start under review until a platform admin verifies them."
        actions={
          <Link href="/org/programmes" className={heroSecondaryAction}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to programmes
          </Link>
        }
      />
      <div className="section-x py-10">
        <ProgrammeForm
          organizationId={membership.organization.id}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          defaultRegion={DEMO_REGION}
        />
      </div>
    </main>
  );
}
