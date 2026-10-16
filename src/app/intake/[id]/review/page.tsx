import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StaffAccountNotice } from "@/components/staff-account-notice";
import { SummaryReviewForm } from "@/components/summary-review-form";
import { accountKindFor, canSubmitNeeds } from "@/modules/auth/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { getIntakeById } from "@/modules/intakes/service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Review your needs summary",
};

export default async function IntakeReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const kind = await accountKindFor(await getCurrentUser());
  if (!canSubmitNeeds(kind)) {
    return <StaffAccountNotice kind={kind} />;
  }

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
