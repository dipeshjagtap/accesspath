import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CircleCheck,
  FileText,
  Inbox,
  LayoutDashboard,
  MessagesSquare,
  Send,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConsentForm, type ShareableFieldId } from "@/components/consent-form";
import { PageHero, heroSecondaryAction } from "@/components/page-hero";
import { StaffAccountNotice } from "@/components/staff-account-notice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { accountKindFor, canSubmitNeeds } from "@/modules/auth/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { getIntakeById } from "@/modules/intakes/service";
import { matchPublishedProgrammes } from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consent to share your support request",
};

const AFTER_SENDING = [
  {
    icon: Inbox,
    title: "The organisation receives it",
    body: "Only the details you ticked, plus your consent record.",
  },
  {
    icon: MessagesSquare,
    title: "They review and reply",
    body: "They may accept, ask for more information, or decline.",
  },
  {
    icon: LayoutDashboard,
    title: "You follow progress",
    body: "Every status change appears on your dashboard.",
  },
] as const;

export default async function ReferralConsentPage({
  params,
  searchParams,
}: {
  params: Promise<{ intakeId: string }>;
  searchParams: Promise<{ programmeId?: string; parentCaseId?: string }>;
}) {
  const kind = await accountKindFor(await getCurrentUser());
  if (!canSubmitNeeds(kind)) {
    return <StaffAccountNotice kind={kind} />;
  }

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

  const previews: Record<ShareableFieldId, string | null> = {
    confirmed_summary: intake.confirmedSummary,
    region: intake.region,
    practical_needs: intake.practicalNeeds,
    budget_constraint: intake.budgetConstraint,
    access_needs: intake.accessNeeds,
    preferred_contact_method: intake.preferredContactMethod,
  };

  const programmeHref = (id: string) =>
    `/referral/${intake.id}?programmeId=${id}${
      parentCaseId ? `&parentCaseId=${parentCaseId}` : ""
    }`;

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="Final step · Your consent"
        icon={Send}
        title={
          parentCaseId
            ? "Send your request to another programme"
            : "Send your support request"
        }
        description="Pick a programme, check exactly what will be shared, then confirm. Nothing leaves AccessPath until you press send."
        actions={
          <Link href={`/plan/${intake.id}`} className={heroSecondaryAction}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to your plan
          </Link>
        }
      />

      <div className="section-x py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            {!selected ? (
              <div className="border-border bg-card space-y-4 rounded-2xl border border-dashed p-8 text-center">
                <Building2
                  className="text-muted-foreground mx-auto size-10"
                  aria-hidden
                />
                <h2 className="font-display text-xl font-semibold">
                  No verified programme is available yet
                </h2>
                <p className="text-muted-foreground mx-auto max-w-md text-sm">
                  There is no published programme from a verified organisation
                  for this support type and area. AccessPath never invents
                  listings. Your plan lists local help desks you can contact.
                </p>
                <Button asChild variant="outline">
                  <Link href={`/plan/${intake.id}`}>Back to your plan</Link>
                </Button>
              </div>
            ) : (
              <>
                <section
                  aria-labelledby="choose-heading"
                  className="border-border bg-card rounded-2xl border p-6 shadow-sm"
                >
                  <header className="mb-4 flex gap-3">
                    <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                      1
                    </span>
                    <div>
                      <h2
                        id="choose-heading"
                        className="font-display text-lg leading-7 font-semibold"
                      >
                        {matched.length > 1
                          ? "Choose a programme"
                          : "Your selected programme"}
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        {matched.length > 1
                          ? `${matched.length} verified programmes match your need. Pick the one you want to contact.`
                          : "This is the verified programme that matches your need."}
                      </p>
                    </div>
                  </header>
                  <ul className="grid gap-3 sm:pl-10 md:grid-cols-2">
                    {matched.map((programme) => {
                      const active = programme.id === selected.id;
                      return (
                        <li key={programme.id}>
                          <Link
                            href={programmeHref(programme.id)}
                            scroll={false}
                            aria-current={active ? "true" : undefined}
                            className={cn(
                              "bg-background relative flex h-full flex-col gap-2 rounded-xl border p-4 transition-colors",
                              active
                                ? "border-primary bg-secondary/60 ring-primary ring-1"
                                : "border-border hover:border-primary/50",
                            )}
                          >
                            {active ? (
                              <CircleCheck
                                className="text-primary absolute top-3 right-3 size-5"
                                aria-label="Selected"
                              />
                            ) : null}
                            <span className="text-brand-dark pr-7 font-semibold">
                              {programme.name}
                            </span>
                            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                              <Building2 className="size-3.5" aria-hidden />
                              {programme.organizationName}
                            </span>
                            <span className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                              {programme.purpose}
                            </span>
                            <Badge
                              variant="outline"
                              className="mt-auto w-fit capitalize"
                            >
                              {programme.availabilityStatus.replaceAll(
                                "_",
                                " ",
                              )}
                            </Badge>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                {selected.organizationId ? (
                  <ConsentForm
                    key={selected.id}
                    intakeId={intake.id}
                    organizationId={selected.organizationId}
                    organizationName={selected.organizationName}
                    assistanceProgramId={selected.id}
                    programmeName={selected.name}
                    parentCaseId={parentCaseId}
                    previews={previews}
                  />
                ) : null}
              </>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {selected ? (
              <div className="border-border bg-card rounded-2xl border p-6 text-sm shadow-sm">
                <Badge variant="success" className="gap-1">
                  <BadgeCheck className="size-3.5" aria-hidden />
                  Verified organisation
                </Badge>
                <h2 className="font-display mt-3 text-lg font-semibold">
                  {selected.organizationName}
                </h2>
                <p className="text-muted-foreground">{selected.name}</p>
                {selected.requiredDocuments.length > 0 ? (
                  <div className="mt-4">
                    <p className="flex items-center gap-2 font-semibold">
                      <FileText className="text-primary size-4" aria-hidden />
                      They may ask you for
                    </p>
                    <ul className="text-muted-foreground mt-2 space-y-1 pl-6">
                      {selected.requiredDocuments.map((doc) => (
                        <li key={doc} className="list-disc">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <Link
                  href={`/programs/${selected.id}`}
                  className="text-primary mt-4 inline-block text-sm font-semibold hover:underline"
                >
                  View full programme details
                </Link>
              </div>
            ) : null}

            <div className="bg-brand-deep rounded-2xl p-6 text-white">
              <h2 className="font-display text-lg font-semibold">
                What happens after you send
              </h2>
              <ol className="mt-4 space-y-4 text-sm">
                {AFTER_SENDING.map(({ icon: Icon, title, body }) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <Icon className="text-coral size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold">{title}</span>
                      <span className="text-white/70">{body}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="border-border bg-card text-muted-foreground flex gap-3 rounded-2xl border p-4 text-sm">
              <ShieldCheck
                className="text-primary mt-0.5 size-4 shrink-0"
                aria-hidden
              />
              Your consent is recorded with the date, the details shared and the
              reason, so there is always a clear record of what you agreed to.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
