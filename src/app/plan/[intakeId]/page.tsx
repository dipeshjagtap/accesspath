import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ChecklistPanel } from "@/components/checklist-panel";
import { ProgressSteps } from "@/components/progress-steps";
import { ResourceCard } from "@/components/resource-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getIntakeById } from "@/modules/intakes/service";
import { getLatestPlanForIntake } from "@/modules/plans/service";
import {
  getAssistanceProgramById,
  getResourceById,
  listAssistanceProgramsForRegion,
  listVerifiedResourcesForRegion,
} from "@/modules/resources/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your navigation plan",
};

export default async function PlanPage({
  params,
}: {
  params: Promise<{ intakeId: string }>;
}) {
  const { intakeId } = await params;
  const intake = await getIntakeById(intakeId);
  if (!intake) notFound();

  const bundle = await getLatestPlanForIntake(intakeId);
  if (!bundle) notFound();

  const { plan, planJson, checklist } = bundle;

  const matchedResources = (
    await Promise.all(planJson.resource_ids.map((id) => getResourceById(id)))
  ).filter((r): r is NonNullable<typeof r> => r != null);

  const regionResources = await listVerifiedResourcesForRegion(intake.region);
  const programs = await listAssistanceProgramsForRegion(intake.region);

  const linkedPrograms = (
    await Promise.all(
      planJson.source_ids.map(async (id) => {
        if (matchedResources.some((r) => r.id === id)) return null;
        return getAssistanceProgramById(id);
      }),
    )
  ).filter((p): p is NonNullable<typeof p> => p != null);

  const programList =
    linkedPrograms.length > 0 ? linkedPrograms : programs;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <ProgressSteps current={3} />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge
          variant={
            plan.reviewStatus === "failed_fallback" ? "warning" : "success"
          }
        >
          {plan.reviewStatus === "failed_fallback"
            ? "Deterministic fallback plan"
            : "Gemini plan"}
        </Badge>
        <Badge variant="outline">Model: {plan.modelName}</Badge>
        {plan.latencyMs ? (
          <Badge variant="outline">{plan.latencyMs} ms</Badge>
        ) : null}
        <Badge variant="outline">Region: {intake.region}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Needs summary</CardTitle>
              <CardDescription>
                Confirmed by you. Suggestions below are navigation help only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed">
              <p>{planJson.needs_summary}</p>
              <p className="rounded-md bg-secondary/50 px-3 py-2 text-muted-foreground">
                {planJson.safety_note}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggested next steps</CardTitle>
              <CardDescription>
                Plain-language guidance. Factual contacts come from curated
                records on the right.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
                {planJson.suggested_next_steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions to ask a provider</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
                {planJson.questions_for_provider.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unknowns & caution</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
                {planJson.unknowns.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <section aria-labelledby="checklist-heading" className="space-y-4">
            <div>
              <h2 id="checklist-heading" className="text-2xl font-semibold">
                Action checklist
              </h2>
              <p className="text-sm text-muted-foreground">
                Update status as you go. Items are generated from your plan and
                verified records.
              </p>
            </div>
            <ChecklistPanel items={checklist} intakeId={intakeId} />
          </section>
        </section>

        <aside className="space-y-6">
          <section className="space-y-3" aria-labelledby="resources-heading">
            <h2 id="resources-heading" className="text-xl font-semibold">
              Verified resources
            </h2>
            {matchedResources.length === 0 && regionResources.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  No verified match is available in the curated dataset for this
                  region. Confirm options with an official local source.
                </CardContent>
              </Card>
            ) : (
              (matchedResources.length > 0
                ? matchedResources
                : regionResources
              ).map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href="/resources">Browse all primary resources</Link>
            </Button>
          </section>

          <Separator />

          <section className="space-y-3" aria-labelledby="programs-heading">
            <h2 id="programs-heading" className="text-xl font-semibold">
              Matched programmes
            </h2>
            {programList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No verified published programmes for this region and category.
                AccessPath will not invent results.
              </p>
            ) : (
              programList.map((program) => (
                <Card key={program.id}>
                  <CardHeader className="space-y-2">
                    <Badge
                      variant={
                        program.verificationStatus === "verified"
                          ? "success"
                          : "warning"
                      }
                    >
                      {program.verificationStatus.replaceAll("_", " ")}
                    </Badge>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/programs/${program.id}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {program.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>{program.purpose}</p>
                    <p>{program.eligibilityDisclaimer}</p>
                    {program.availabilityStatus ? (
                      <p>
                        Availability:{" "}
                        {program.availabilityStatus.replaceAll("_", " ")}
                      </p>
                    ) : null}
                    <Button asChild size="sm" className="w-full">
                      <Link
                        href={`/referral/${intakeId}?programmeId=${program.id}`}
                      >
                        Review & consent
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </section>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Submit a request</CardTitle>
              <CardDescription>
                Explicit consent is required before any organisation receives
                your details. Sent ≠ accepted ≠ delivered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href={`/referral/${intakeId}`}>Choose a programme</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
