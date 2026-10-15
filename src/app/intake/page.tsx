import type { Metadata } from "next";

import { IntakeForm } from "@/components/intake-form";
import { listActiveCategories } from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Needs intake",
};

export default async function IntakePage() {
  const categories = await listActiveCategories();

  return (
    <main className="flex-1">
      <IntakeForm
        categories={categories.map((c) => ({
          slug: c.slug,
          name: c.name,
          description: c.description,
        }))}
      />
    </main>
  );
}
