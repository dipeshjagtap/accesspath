import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarCheck2,
  ExternalLink,
  FileText,
  GraduationCap,
  HeartPulse,
  Info,
  MapPin,
  Route,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import {
  heroPrimaryAction,
  heroSecondaryAction,
  PageHero,
} from "@/components/page-hero";
import { VerificationBadge } from "@/components/verification-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { accountKindFor, canSubmitNeeds } from "@/modules/auth/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { getProgrammeById } from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

const isUuid = (value: string) => z.string().uuid().safeParse(value).success;

const CATEGORY_ICON: Record<string, LucideIcon> = {
  education_support: GraduationCap,
  essential_needs: ShoppingBasket,
  disability_health_support: HeartPulse,
};

const AVAILABILITY_LABEL: Record<string, string> = {
  accepting_requests: "Accepting requests",
  waitlist: "Waitlist",
  temporarily_unavailable: "Temporarily unavailable",
  closed: "Closed",
  unknown: "Availability unknown",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const program = isUuid(id) ? await getProgrammeById(id) : null;
  if (!program) {
    return { title: "Support programme not found" };
  }
  return {
    title: `${program.name} – support programme`,
    description: program.purpose,
  };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = isUuid(id) ? await getProgrammeById(id) : null;
  if (!program) notFound();

  const kind = await accountKindFor(await getCurrentUser());
  const showIntakeCta = canSubmitNeeds(kind);
  const CategoryIcon = CATEGORY_ICON[program.categorySlug] ?? Route;
  const docs =
    program.requiredDocuments.length > 0
      ? program.requiredDocuments
      : program.verifiedRequirements;

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={program.categoryName}
        icon={CategoryIcon}
        title={program.name}
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="text-coral size-4" aria-hidden />
              {program.organizationName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="text-coral size-4" aria-hidden />
              {program.regions.join(", ")}
            </span>
          </span>
        }
        actions={
          <>
            {showIntakeCta ? (
              <Link href="/intake" className={heroPrimaryAction}>
                Request this kind of support
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            ) : null}
            <Link href="/resources" className={heroSecondaryAction}>
              <ArrowLeft className="size-4" aria-hidden />
              Back to directory
            </Link>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <VerificationBadge status={program.verificationStatus} />
          <Badge
            variant="outline"
            className="border-white/30 bg-white/10 text-white"
          >
            {AVAILABILITY_LABEL[program.availabilityStatus] ??
              program.availabilityStatus.replaceAll("_", " ")}
          </Badge>
          {program.isFictionalDemo === "true" ? (
            <Badge
              variant="outline"
              className="border-white/30 bg-white/10 text-white"
            >
              Fictional demo
            </Badge>
          ) : null}
        </div>
      </PageHero>

      <div className="section-x py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-6">
            <section className="border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-xl font-semibold">
                What this programme offers
              </h2>
              <p className="mt-3 text-base leading-relaxed">
                {program.purpose}
              </p>
              {program.description ? (
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                  {program.description}
                </p>
              ) : null}

              {program.eligibilityDisclaimer ? (
                <p className="bg-secondary/60 mt-6 flex gap-3 rounded-xl px-4 py-3 text-sm leading-relaxed">
                  <Info
                    className="text-primary mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  {program.eligibilityDisclaimer}
                </p>
              ) : null}
            </section>

            {docs.length > 0 ? (
              <section className="border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
                <h2 className="font-display flex items-center gap-2 text-xl font-semibold">
                  <FileText className="text-primary size-5" aria-hidden />
                  What you may need
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  Confirm with the organisation. AccessPath does not decide
                  eligibility.
                </p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {docs.map((item) => (
                    <li
                      key={item}
                      className="border-border bg-background flex items-start gap-2 rounded-xl border px-4 py-3 text-sm"
                    >
                      <span
                        className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {program.applicationRoute ? (
              <section className="border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
                <h2 className="font-display text-xl font-semibold">
                  How to apply
                </h2>
                <p className="mt-3 text-sm leading-relaxed">
                  {program.applicationRoute}
                </p>
              </section>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-brand-deep rounded-2xl p-6 text-white">
              <h2 className="font-display text-lg font-semibold">
                Ready to ask for help?
              </h2>
              <p className="mt-2 text-sm text-white/75">
                Describe your need in your own words. You review a summary and
                give consent before anything is shared.
              </p>
              {showIntakeCta ? (
                <Link
                  href="/intake"
                  className="bg-coral mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white"
                >
                  Describe a need
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <p className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-xs text-white/80">
                  Organisation and admin accounts respond to requests rather
                  than create them.
                </p>
              )}
            </div>

            <div className="border-border bg-card space-y-4 rounded-2xl border p-6 text-sm shadow-sm">
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Organisation
                </p>
                <p className="font-semibold">{program.organizationName}</p>
                <VerificationBadge
                  status={program.organizationVerificationStatus}
                />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium">
                  Area
                </p>
                <p>{program.regions.join(", ")}</p>
              </div>
              {program.officialUrl ? (
                <div>
                  <p className="text-muted-foreground text-xs font-medium">
                    Official source
                  </p>
                  <a
                    href={program.officialUrl}
                    className="text-primary inline-flex items-center gap-1.5 font-semibold hover:underline"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open website
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                </div>
              ) : null}
              {program.lastVerifiedAt ? (
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <CalendarCheck2 className="size-3.5" aria-hidden />
                  Last verified{" "}
                  {new Date(program.lastVerifiedAt).toLocaleDateString(
                    "en-IN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              ) : null}
              {program.sourceNotes ? (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {program.sourceNotes}
                </p>
              ) : null}
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href="/resources">Browse all programmes</Link>
            </Button>
          </aside>
        </div>
      </div>
    </main>
  );
}
