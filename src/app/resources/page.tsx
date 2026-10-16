import { ArrowRight, ClipboardCheck, Search, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ResourceCard } from "@/components/resource-card";
import { heroPrimaryAction, PageHero } from "@/components/page-hero";
import { dbConnectionHint } from "@/lib/db";
import {
  listPrimaryAssistancePrograms,
  listPrimaryResources,
} from "@/modules/resources/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verified support programmes directory",
  description:
    "Browse published education, essential-needs, and disability and health support programmes from organisations reviewed by AccessPath admins.",
};

export default async function ResourcesPage() {
  let resources: Awaited<ReturnType<typeof listPrimaryResources>> = [];
  let programs: Awaited<ReturnType<typeof listPrimaryAssistancePrograms>> = [];
  let dbError: string | null = null;

  try {
    [resources, programs] = await Promise.all([
      listPrimaryResources(),
      listPrimaryAssistancePrograms(),
    ]);
  } catch (error) {
    dbError = dbConnectionHint(error);
  }

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="Verified directory"
        icon={ShieldCheck}
        title="Verified resource directory"
        description="Only curated records with a current verification status appear here. Expired and unverified listings are excluded. Hackathon entries are fictional demo data."
        actions={
          <Link href="/intake" className={heroPrimaryAction}>
            <Search className="size-4" aria-hidden="true" />
            Start with your needs
          </Link>
        }
      />
      <div className="section-x w-full flex-1 space-y-10 py-10">
        {dbError ? (
          <p
            role="alert"
            className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border px-4 py-3 text-sm"
          >
            {dbError}
          </p>
        ) : null}

        <section
          className="grid gap-4 md:grid-cols-2"
          aria-label="Providers and services"
        >
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </section>

        <section className="space-y-4" aria-labelledby="programs-dir-heading">
          <h2 id="programs-dir-heading" className="text-2xl font-semibold">
            Assistance programs
          </h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {programs.map((program) => (
              <li
                key={program.id}
                className="lift border-border bg-card group relative flex gap-4 rounded-2xl border p-5 shadow-sm"
              >
                <span className="bg-secondary text-primary group-hover:bg-primary flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors group-hover:text-white">
                  <ClipboardCheck className="size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-primary mb-1 text-xs font-semibold tracking-wide uppercase">
                    {program.verificationStatus.replaceAll("_", " ")}
                  </p>
                  <h3 className="text-brand-dark text-lg font-bold">
                    <Link
                      href={`/programs/${program.id}`}
                      className="after:absolute after:inset-0 after:rounded-2xl"
                    >
                      {program.name}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {program.purpose}
                  </p>
                  <p className="mt-2 text-sm">
                    {program.eligibilityDisclaimer}
                  </p>
                  <span className="text-coral mt-3 inline-flex items-center gap-1 text-sm font-semibold">
                    View details
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
