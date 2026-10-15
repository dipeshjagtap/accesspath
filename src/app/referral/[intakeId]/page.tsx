import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ConsentForm } from "@/components/consent-form";
import { Badge } from "@/components/ui/badge";
import { getActiveConsentForIntake } from "@/modules/consent/service";
import { getIntakeById } from "@/modules/intakes/service";
import { listPilotOrganizations } from "@/modules/organizations/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Referral consent",
};

export default async function ReferralConsentPage({
  params,
}: {
  params: Promise<{ intakeId: string }>;
}) {
  const { intakeId } = await params;
  const intake = await getIntakeById(intakeId);
  if (!intake) notFound();

  const [organizations, existingConsent] = await Promise.all([
    listPilotOrganizations(),
    getActiveConsentForIntake(intakeId),
  ]);
  const organization = organizations[0];
  if (!organization) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <Badge variant="secondary">Explicit consent required</Badge>
        <h1 className="text-3xl font-semibold">Request partner follow-up</h1>
        <p className="text-muted-foreground">
          Share only what you choose with a fictional demo partner organization.
          No case details are visible to partners before this step.
        </p>
      </header>

      {existingConsent ? (
        <p
          role="status"
          className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm"
        >
          Consent was already recorded for this intake. Opening the partner view
          will show the linked case.
        </p>
      ) : null}

      <ConsentForm
        intakeId={intake.id}
        organizationId={organization.id}
        organizationName={organization.name}
      />
    </main>
  );
}
