import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SummaryReviewForm } from "@/components/summary-review-form";
import { getIntakeById } from "@/modules/intakes/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Review summary",
};

export default async function IntakeReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const intake = await getIntakeById(id);
  if (!intake) {
    notFound();
  }

  return (
    <main className="flex-1">
      <SummaryReviewForm
        intakeId={intake.id}
        initialSummary={intake.confirmedSummary ?? ""}
      />
    </main>
  );
}
