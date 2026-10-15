import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConsentForm } from "@/components/consent-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIntakeById } from "@/modules/intakes/service";
import { matchPublishedProgrammes } from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request consent",
};

export default async function ReferralConsentPage({
  params,
  searchParams,
}: {
  params: Promise<{ intakeId: string }>;
  searchParams: Promise<{ programmeId?: string; parentCaseId?: string }>;
}) {
  const { intakeId } = await params;
  const { programmeId, parentCaseId } = await searchParams;
  const intake = await getIntakeById(intakeId);
  if (!intake) notFound();

  const matched = await matchPublishedProgrammes({
    region: intake.region,
    categoryId: intake.categoryId ?? undefined,
    categorySlug: intake.supportCategorySlug,
  });

  const selected =
    matched.find((p) => p.id === programmeId) ?? matched[0] ?? null;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <Badge variant="secondary">Explicit consent required</Badge>
        <h1 className="text-3xl font-semibold">
          {parentCaseId ? "Alternative referral" : "Submit a support request"}
        </h1>
        <p className="text-muted-foreground">
          Only published programmes from verified organisations can receive
          requests. AccessPath never invents listings.
        </p>
      </header>

      {!selected ? (
        <div className="space-y-4 rounded-xl border border-border bg-secondary/30 p-6">
          <h2 className="text-lg font-semibold">No verified match found</h2>
          <p className="text-sm text-muted-foreground">
            There are no published, verified programmes for this category and
            region in the demo catalogue. We will not fabricate results.
          </p>
          <Button asChild variant="outline">
            <Link href={`/plan/${intake.id}`}>Back to plan</Link>
          </Button>
        </div>
      ) : (
        <>
          {matched.length > 1 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Choose a programme</p>
              <ul className="space-y-2">
                {matched.map((programme) => (
                  <li key={programme.id}>
                    <Button
                      asChild
                      variant={
                        programme.id === selected.id ? "default" : "outline"
                      }
                      className="h-auto w-full justify-start whitespace-normal px-4 py-3 text-left"
                    >
                      <Link
                        href={`/referral/${intake.id}?programmeId=${programme.id}${
                          parentCaseId ? `&parentCaseId=${parentCaseId}` : ""
                        }`}
                      >
                        <span className="block font-medium">{programme.name}</span>
                        <span className="block text-xs opacity-80">
                          {programme.organizationName} ·{" "}
                          {programme.availabilityStatus.replaceAll("_", " ")}
                        </span>
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {selected.organizationId ? (
            <ConsentForm
              intakeId={intake.id}
              organizationId={selected.organizationId}
              organizationName={selected.organizationName}
              assistanceProgramId={selected.id}
              programmeName={selected.name}
              parentCaseId={parentCaseId}
            />
          ) : null}
        </>
      )}
    </main>
  );
}
