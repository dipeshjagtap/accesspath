import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarCheck2,
  CircleAlert,
  ExternalLink,
  Info,
  Mail,
  MapPin,
  Phone,
  Tags,
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
import { getResourceById } from "@/modules/resources/repository";

export const dynamic = "force-dynamic";

const isUuid = (value: string) => z.string().uuid().safeParse(value).success;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = isUuid(id) ? await getResourceById(id) : null;
  if (!resource) {
    return { title: "Support resource not found" };
  }
  return {
    title: `${resource.name} – support resource in ${resource.region}`,
    description: resource.description,
  };
}

function splitContact(details: string | null) {
  if (!details)
    return {
      phone: null as string | null,
      email: null as string | null,
      rest: null as string | null,
    };
  const phoneMatch = details.match(/Phone:\s*([^•\n]+)/i);
  const emailMatch = details.match(/Email:\s*(\S+)/i);
  return {
    phone: phoneMatch?.[1]?.trim() ?? null,
    email: emailMatch?.[1]?.trim() ?? null,
    rest: !phoneMatch && !emailMatch ? details : null,
  };
}

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = isUuid(id) ? await getResourceById(id) : null;
  if (!resource) notFound();

  const isPrimary =
    resource.verificationStatus === "verified" ||
    resource.verificationStatus === "needs_review";
  const kind = await accountKindFor(await getCurrentUser());
  const showIntakeCta = canSubmitNeeds(kind);
  const contact = splitContact(resource.publicContactDetails);

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={resource.resourceType.replaceAll("_", " ")}
        icon={Building2}
        title={resource.name}
        description={
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="text-coral size-4" aria-hidden />
            {resource.region}
          </span>
        }
        actions={
          <>
            {showIntakeCta ? (
              <Link href="/intake" className={heroPrimaryAction}>
                Describe a need
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
          <VerificationBadge status={resource.verificationStatus} />
          <Badge
            variant="outline"
            className="border-white/30 bg-white/10 text-white capitalize"
          >
            {resource.resourceType.replaceAll("_", " ")}
          </Badge>
          {resource.isFictionalDemo === "true" ? (
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
            {!isPrimary ? (
              <p
                role="status"
                className="border-destructive/30 bg-destructive/5 text-destructive flex gap-3 rounded-2xl border px-4 py-3 text-sm"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
                This record is not a confirmed recommendation. Status:{" "}
                {resource.verificationStatus.replaceAll("_", " ")}.
              </p>
            ) : null}

            <section className="border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
              <h2 className="font-display text-xl font-semibold">About</h2>
              <p className="mt-3 text-base leading-relaxed">
                {resource.description}
              </p>
              {isPrimary ? (
                <p className="bg-secondary/60 mt-5 flex gap-3 rounded-xl px-4 py-3 text-sm leading-relaxed">
                  <Info
                    className="text-primary mt-0.5 size-4 shrink-0"
                    aria-hidden
                  />
                  This is a curated help desk / navigation resource. Confirm
                  details with them before you travel or share personal
                  information.
                </p>
              ) : null}
            </section>

            {resource.categories.length > 0 ? (
              <section className="border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
                <h2 className="font-display flex items-center gap-2 text-xl font-semibold">
                  <Tags className="text-primary size-5" aria-hidden />
                  Categories
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {resource.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="capitalize"
                    >
                      {category.replaceAll("_", " ")}
                    </Badge>
                  ))}
                </div>
              </section>
            ) : null}

            {resource.accessNotes || resource.accessibilityInfo ? (
              <section className="border-border bg-card rounded-2xl border p-6 shadow-sm sm:p-8">
                <h2 className="font-display text-xl font-semibold">
                  How to get in touch
                </h2>
                {resource.accessNotes ? (
                  <p className="mt-3 text-sm leading-relaxed">
                    {resource.accessNotes}
                  </p>
                ) : null}
                {resource.accessibilityInfo ? (
                  <p className="text-muted-foreground mt-4 flex gap-2 text-sm leading-relaxed">
                    <Accessibility
                      className="text-primary mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                    {resource.accessibilityInfo}
                  </p>
                ) : null}
              </section>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-brand-deep rounded-2xl p-6 text-white">
              <h2 className="font-display text-lg font-semibold">
                Need support nearby?
              </h2>
              <p className="mt-2 text-sm text-white/75">
                Describe what you need. We match you with verified programmes —
                nothing is shared until you consent.
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
                  Area
                </p>
                <p className="inline-flex items-center gap-1.5 font-semibold">
                  <MapPin className="text-coral size-3.5" aria-hidden />
                  {resource.region}
                </p>
              </div>

              {contact.phone || contact.email || contact.rest ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs font-medium">
                    Public contact
                  </p>
                  {contact.phone ? (
                    <p className="flex items-start gap-2">
                      <Phone
                        className="text-primary mt-0.5 size-3.5 shrink-0"
                        aria-hidden
                      />
                      {contact.phone}
                    </p>
                  ) : null}
                  {contact.email ? (
                    <p className="flex items-start gap-2 break-all">
                      <Mail
                        className="text-primary mt-0.5 size-3.5 shrink-0"
                        aria-hidden
                      />
                      {contact.email}
                    </p>
                  ) : null}
                  {contact.rest ? <p>{contact.rest}</p> : null}
                </div>
              ) : null}

              {resource.officialUrl ? (
                <div>
                  <p className="text-muted-foreground text-xs font-medium">
                    Official source
                  </p>
                  <a
                    href={resource.officialUrl}
                    className="text-primary inline-flex items-center gap-1.5 font-semibold hover:underline"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open website
                    <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                </div>
              ) : null}

              {resource.lastVerifiedAt ? (
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <CalendarCheck2 className="size-3.5" aria-hidden />
                  Last verified{" "}
                  {new Date(resource.lastVerifiedAt).toLocaleDateString(
                    "en-IN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              ) : null}

              {resource.sourceNotes ? (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {resource.sourceNotes}
                </p>
              ) : null}

              {resource.sponsorshipDisclosure ? (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Disclosure: {resource.sponsorshipDisclosure}
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
