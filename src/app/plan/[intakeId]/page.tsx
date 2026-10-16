import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardList,
  FileText,
  Info,
  ListChecks,
  MessageCircleQuestion,
  PencilLine,
  Route,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ChecklistPanel } from "@/components/checklist-panel";
import {
  PageHero,
  heroPrimaryAction,
  heroSecondaryAction,
} from "@/components/page-hero";
import { ProgressSteps } from "@/components/progress-steps";
import { ResourceCard } from "@/components/resource-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/modules/auth/session";
import { getIntakeById } from "@/modules/intakes/service";
import { getLatestPlanForIntake } from "@/modules/plans/service";
import { getCategoryBySlug } from "@/modules/programmes/repository";
import {
  getAssistanceProgramById,
  getResourceById,
  listAssistanceProgramsForRegion,
  listVerifiedResourcesForRegion,
} from "@/modules/resources/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your support plan and matched programmes",
};

const ASKING_FOR_LABEL: Record<string, string> = {
  self: "You",
  someone_else: "Someone you support",
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

  const [matchedResources, regionResources, programs, category, user] =
    await Promise.all([
      Promise.all(planJson.resource_ids.map((id) => getResourceById(id))).then(
        (rows) => rows.filter((r): r is NonNullable<typeof r> => r != null),
      ),
      listVerifiedResourcesForRegion(intake.region),
      listAssistanceProgramsForRegion(intake.region),
      getCategoryBySlug(intake.supportCategorySlug),
      getCurrentUser(),
    ]);

  const linkedPrograms = (
    await Promise.all(
      planJson.source_ids.map(async (id) => {
        if (matchedResources.some((r) => r.id === id)) return null;
        return getAssistanceProgramById(id);
      }),
    )
  ).filter((p): p is NonNullable<typeof p> => p != null);

  const programList = linkedPrograms.length > 0 ? linkedPrograms : programs;
  const helpDesks =
    matchedResources.length > 0 ? matchedResources : regionResources;
  const categoryName = category?.name ?? "support";
  const usedFallback = plan.reviewStatus === "failed_fallback";

  const facts: Array<[string, string | null]> = [
    ["Support for", ASKING_FOR_LABEL[intake.askingFor ?? "self"] ?? null],
    ["Type of support", category?.name ?? null],
    ["Area", intake.region],
    ["Budget", intake.budgetConstraint],
    ["Contact by", intake.preferredContactMethod],
    ["Access needs", intake.accessNeeds],
  ];

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="Step 3 of 3 · Your plan"
        icon={Route}
        title="Your support plan is ready"
        description={
          programList.length > 0 ? (
            <>
              We found{" "}
              <strong className="text-white">
                {programList.length} verified{" "}
                {programList.length === 1 ? "programme" : "programmes"}
              </strong>{" "}
              for {categoryName.toLowerCase()} in {intake.region}. Read the
              steps below, then choose who to contact. Nothing is shared until
              you give consent.
            </>
          ) : (
            <>
              We could not find a verified programme for{" "}
              {categoryName.toLowerCase()} in {intake.region} yet. The steps
              below still help you find support locally.
            </>
          )
        }
        actions={
          <>
            {programList.length > 0 ? (
              <a href="#programmes" className={heroPrimaryAction}>
                See matching programmes
                <ArrowRight className="size-4" aria-hidden />
              </a>
            ) : null}
            {user ? (
              <Link href="/dashboard" className={heroSecondaryAction}>
                View all my requests
              </Link>
            ) : null}
          </>
        }
      />

      <div className="section-x py-10">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <ProgressSteps current={3} />

          <nav aria-label="On this page" className="grid gap-3 sm:grid-cols-3">
            {(
              [
                [
                  "#programmes",
                  Building2,
                  "1. Choose a programme",
                  "Verified organisations that match your need",
                ],
                [
                  "#next-steps",
                  ListChecks,
                  "2. Follow the next steps",
                  "What to do and what to ask",
                ],
                [
                  "#checklist",
                  ClipboardList,
                  "3. Track your progress",
                  "Tick off each step as you go",
                ],
              ] as const
            ).map(([href, Icon, title, body]) => (
              <a
                key={href}
                href={href}
                className="lift border-border bg-card flex items-start gap-3 rounded-2xl border p-4"
              >
                <IconTile icon={Icon} />
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="text-muted-foreground text-sm">{body}</span>
                </span>
              </a>
            ))}
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-10">
              <PlanSection
                id="programmes"
                icon={Building2}
                title="Programmes that can help"
                description="Published by verified organisations in your area. Sending a request does not guarantee a place. The organisation reviews it first."
              >
                {programList.length === 0 ? (
                  <EmptyNote>
                    No verified programme matches this area and support type
                    yet. AccessPath never invents results. Try the local help
                    desks listed on this page.
                  </EmptyNote>
                ) : (
                  <div className="grid gap-4">
                    {programList.map((program) => (
                      <article
                        key={program.id}
                        className="border-border bg-card rounded-2xl border p-5 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {program.verificationStatus === "verified" ? (
                            <Badge variant="success" className="gap-1">
                              <BadgeCheck className="size-3.5" aria-hidden />
                              Verified organisation
                            </Badge>
                          ) : (
                            <Badge variant="warning">Being reviewed</Badge>
                          )}
                          {program.availabilityStatus ? (
                            <Badge variant="outline" className="capitalize">
                              {program.availabilityStatus.replaceAll("_", " ")}
                            </Badge>
                          ) : null}
                        </div>
                        <h3 className="text-brand-dark mt-3 text-xl font-bold">
                          {program.name}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed">
                          {program.purpose}
                        </p>
                        {program.eligibilityDisclaimer ? (
                          <p className="bg-muted/60 text-muted-foreground mt-3 rounded-lg px-3 py-2 text-xs leading-relaxed">
                            <span className="text-foreground font-semibold">
                              Who can apply:{" "}
                            </span>
                            {program.eligibilityDisclaimer}
                          </p>
                        ) : null}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button asChild>
                            <Link
                              href={`/referral/${intakeId}?programmeId=${program.id}`}
                            >
                              Request support
                              <ArrowRight className="size-4" aria-hidden />
                            </Link>
                          </Button>
                          <Button asChild variant="outline">
                            <Link href={`/programs/${program.id}`}>
                              View details
                            </Link>
                          </Button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </PlanSection>

              <PlanSection
                id="next-steps"
                icon={ListChecks}
                title="What to do next"
                description="Plain-language guidance based on your summary."
              >
                <ol className="space-y-3">
                  {planJson.suggested_next_steps.map((step, index) => (
                    <li
                      key={step}
                      className="border-border bg-card flex gap-3 rounded-xl border p-4 text-sm leading-relaxed"
                    >
                      <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="pt-1">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="grid gap-4 md:grid-cols-2">
                  <TipCard
                    icon={MessageCircleQuestion}
                    title="Questions to ask the organisation"
                    items={planJson.questions_for_provider}
                  />
                  <TipCard
                    icon={TriangleAlert}
                    title="Things we could not confirm"
                    items={planJson.unknowns}
                    tone="warning"
                  />
                </div>
              </PlanSection>

              <PlanSection
                id="checklist"
                icon={ClipboardList}
                title="Track your progress"
                description="Mark each step as you go. Your progress is saved to this plan."
              >
                <ChecklistPanel items={checklist} intakeId={intakeId} />
              </PlanSection>
            </div>

            <aside className="space-y-6">
              <section
                id="summary"
                aria-labelledby="summary-heading"
                className="border-border bg-card rounded-2xl border p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2
                    id="summary-heading"
                    className="font-display text-lg font-semibold"
                  >
                    Your request at a glance
                  </h2>
                  <Link
                    href={`/intake/${intakeId}/review`}
                    className="text-primary inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                  >
                    <PencilLine className="size-3.5" aria-hidden />
                    Edit
                  </Link>
                </div>
                <dl className="divide-border mt-4 divide-y text-sm">
                  {facts
                    .filter((fact): fact is [string, string] =>
                      Boolean(fact[1]),
                    )
                    .map(([label, value]) => (
                      <div
                        key={label}
                        className="grid grid-cols-[110px_1fr] gap-3 py-2"
                      >
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="font-medium">{value}</dd>
                      </div>
                    ))}
                </dl>
                <details className="group bg-muted/50 mt-4 rounded-lg p-3 text-sm">
                  <summary className="text-primary flex cursor-pointer list-none items-center gap-2 font-semibold">
                    <FileText className="size-4" aria-hidden />
                    Read the full summary you confirmed
                  </summary>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    {planJson.needs_summary}
                  </p>
                </details>
              </section>

              <p className="flex gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                {planJson.safety_note}
              </p>

              <section aria-labelledby="desks-heading" className="space-y-3">
                <div>
                  <h2
                    id="desks-heading"
                    className="font-display text-lg font-semibold"
                  >
                    Local help desks
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Verified places that can guide you in person.
                  </p>
                </div>
                {helpDesks.length === 0 ? (
                  <EmptyNote>
                    No verified help desk is listed for this area yet. Check
                    with an official local source.
                  </EmptyNote>
                ) : (
                  helpDesks.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))
                )}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/resources">Browse all programmes</Link>
                </Button>
              </section>

              <p className="text-muted-foreground text-xs leading-relaxed">
                {usedFallback
                  ? "This plan was put together with rule-based matching because the AI assistant was unavailable."
                  : "This plan was drafted by an AI assistant using only verified records."}{" "}
                Contacts and programme details always come from verified
                records, never from the AI.
              </p>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

function PlanSection({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="scroll-mt-24 space-y-4"
    >
      <header className="flex items-start gap-3">
        <IconTile icon={icon} />
        <div>
          <h2
            id={`${id}-heading`}
            className="font-display text-2xl font-semibold"
          >
            {title}
          </h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function TipCard({
  icon: Icon,
  title,
  items,
  tone = "default",
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  tone?: "default" | "warning";
}) {
  if (items.length === 0) return null;
  return (
    <div
      className={
        tone === "warning"
          ? "rounded-2xl border border-amber-300/60 bg-amber-50/70 p-5"
          : "border-border bg-secondary/40 rounded-2xl border p-5"
      }
    >
      <h3 className="flex items-center gap-2 font-semibold">
        <Icon
          className={
            tone === "warning" ? "size-4 text-amber-700" : "text-primary size-4"
          }
          aria-hidden
        />
        {title}
      </h3>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span
              aria-hidden
              className={
                tone === "warning"
                  ? "mt-2 size-1.5 shrink-0 rounded-full bg-amber-600"
                  : "bg-primary mt-2 size-1.5 shrink-0 rounded-full"
              }
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-border bg-card text-muted-foreground rounded-2xl border border-dashed p-5 text-sm">
      {children}
    </p>
  );
}
