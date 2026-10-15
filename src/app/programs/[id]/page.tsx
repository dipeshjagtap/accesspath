import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { VerificationBadge } from "@/components/verification-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAssistanceProgramById } from "@/modules/resources/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Assistance program",
};

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getAssistanceProgramById(id);
  if (!program) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href="/resources">← Back to directory</Link>
      </Button>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <VerificationBadge status={program.verificationStatus} />
            {program.isFictionalDemo === "true" ? (
              <Badge variant="secondary">Fictional demo</Badge>
            ) : null}
          </div>
          <CardTitle className="text-3xl">{program.name}</CardTitle>
          <CardDescription>
            Potentially relevant — confirm with the official program
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-relaxed">
          <p className="rounded-md bg-secondary/50 px-3 py-2">
            {program.eligibilityDisclaimer}
          </p>

          <section>
            <h2 className="mb-1 font-semibold">Purpose</h2>
            <p>{program.purpose}</p>
          </section>

          <section>
            <h2 className="mb-1 font-semibold">Regions</h2>
            <p>{program.regions.join(", ")}</p>
          </section>

          {program.verifiedRequirements.length > 0 ? (
            <section>
              <h2 className="mb-1 font-semibold">
                Verified document / requirement notes
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                {program.verifiedRequirements.map((req) => (
                  <li key={req}>{req}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {program.applicationRoute ? (
            <section>
              <h2 className="mb-1 font-semibold">Application route</h2>
              <p>{program.applicationRoute}</p>
            </section>
          ) : null}

          {program.officialUrl ? (
            <section>
              <h2 className="mb-1 font-semibold">Official source</h2>
              <a
                href={program.officialUrl}
                className="underline underline-offset-2"
                rel="noreferrer"
                target="_blank"
              >
                {program.officialUrl}
              </a>
            </section>
          ) : null}

          <section>
            <h2 className="mb-1 font-semibold">Source notes</h2>
            <p>{program.sourceNotes}</p>
            {program.lastVerifiedAt ? (
              <p className="mt-1 text-muted-foreground">
                Last verified:{" "}
                {new Date(program.lastVerifiedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            ) : null}
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
