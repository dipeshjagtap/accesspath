import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ProgrammeForm } from "@/components/programme-form";
import { DEMO_REGION } from "@/lib/constants";
import { requireAnyOrgMember } from "@/modules/auth/permissions";
import {
  assertProgrammeOwnedByOrg,
  listActiveCategories,
} from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit support programme",
};

export default async function EditProgrammePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let membership;
  try {
    membership = await requireAnyOrgMember(["org_admin"]);
  } catch {
    redirect("/login");
  }

  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    notFound();
  }

  let programme;
  try {
    programme = await assertProgrammeOwnedByOrg(id, membership.organization.id);
  } catch {
    notFound();
  }

  const categories = await listActiveCategories();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 py-10 section-x">
      <ProgrammeForm
        organizationId={membership.organization.id}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        defaultRegion={DEMO_REGION}
        programme={{
          id: programme.id,
          name: programme.name,
          categoryId: programme.categoryId,
          purpose: programme.purpose,
          description: programme.description,
          regions: programme.regions,
          requiredDocuments: programme.requiredDocuments,
          availabilityStatus: programme.availabilityStatus,
          officialUrl: programme.officialUrl,
          evidenceUrl: programme.evidenceUrl,
          isPublished: programme.publishedAt != null,
        }}
      />
    </main>
  );
}
