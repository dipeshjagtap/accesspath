import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProgrammeForm } from "@/components/programme-form";
import { requireAnyOrgMember } from "@/modules/auth/permissions";
import { listActiveCategories } from "@/modules/programmes/repository";
import { DEMO_REGION } from "@/lib/constants";

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
    <main className="mx-auto w-full max-w-2xl flex-1 py-10 section-x">
      <ProgrammeForm
        organizationId={membership.organization.id}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        defaultRegion={DEMO_REGION}
      />
    </main>
  );
}
