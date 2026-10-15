import type { Metadata } from "next";
import Link from "next/link";

import { ResourceCard } from "@/components/resource-card";
import { Button } from "@/components/ui/button";
import { dbConnectionHint } from "@/lib/db";
import {
  listPrimaryAssistancePrograms,
  listPrimaryResources,
} from "@/modules/resources/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verified resources",
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
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Verified resource directory
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Only curated records with verification status are shown here. Expired
          and unverified listings are excluded from this primary list. Hackathon
          entries are fictional demo data.
        </p>
        <Button asChild>
          <Link href="/intake">Start with your needs</Link>
        </Button>
      </header>

      {dbError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {dbError}
        </p>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2" aria-label="Providers and services">
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
              className="rounded-xl border border-border bg-card p-5"
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                {program.verificationStatus.replaceAll("_", " ")}
              </p>
              <h3 className="text-lg font-semibold">
                <Link
                  href={`/programs/${program.id}`}
                  className="underline-offset-2 hover:underline"
                >
                  {program.name}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {program.purpose}
              </p>
              <p className="mt-2 text-sm">{program.eligibilityDisclaimer}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
