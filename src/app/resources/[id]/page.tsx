import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

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

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 py-10 section-x">
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href="/resources">← Back to directory</Link>
      </Button>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <VerificationBadge status={resource.verificationStatus} />
            <Badge variant="outline">
              {resource.resourceType.replaceAll("_", " ")}
            </Badge>
            {resource.isFictionalDemo === "true" ? (
              <Badge variant="secondary">Fictional demo</Badge>
            ) : null}
          </div>
          <CardTitle className="text-3xl">{resource.name}</CardTitle>
          <CardDescription>{resource.region}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-relaxed">
          {!isPrimary ? (
            <p
              role="status"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive"
            >
              This record is not a confirmed recommendation. Status:{" "}
              {resource.verificationStatus.replaceAll("_", " ")}.
            </p>
          ) : null}

          <section>
            <h2 className="mb-1 font-semibold">About</h2>
            <p>{resource.description}</p>
          </section>

          {resource.categories.length > 0 ? (
            <section>
              <h2 className="mb-2 font-semibold">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {resource.categories.map((category) => (
                  <Badge key={category} variant="outline">
                    {category.replaceAll("_", " ")}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}

          {resource.publicContactDetails ? (
            <section>
              <h2 className="mb-1 font-semibold">Public contact</h2>
              <p>{resource.publicContactDetails}</p>
            </section>
          ) : null}

          {resource.officialUrl ? (
            <section>
              <h2 className="mb-1 font-semibold">Official / source link</h2>
              <a
                href={resource.officialUrl}
                className="underline underline-offset-2"
                rel="noreferrer"
                target="_blank"
              >
                {resource.officialUrl}
              </a>
            </section>
          ) : null}

          {resource.accessNotes ? (
            <section>
              <h2 className="mb-1 font-semibold">Access notes</h2>
              <p>{resource.accessNotes}</p>
            </section>
          ) : null}

          {resource.accessibilityInfo ? (
            <section>
              <h2 className="mb-1 font-semibold">Accessibility information</h2>
              <p>{resource.accessibilityInfo}</p>
            </section>
          ) : null}

          <section>
            <h2 className="mb-1 font-semibold">Source & verification</h2>
            <p>{resource.sourceNotes}</p>
            {resource.lastVerifiedAt ? (
              <p className="mt-1 text-muted-foreground">
                Last verified:{" "}
                {new Date(resource.lastVerifiedAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            ) : null}
            {resource.sponsorshipDisclosure ? (
              <p className="mt-1 text-muted-foreground">
                Disclosure: {resource.sponsorshipDisclosure}
              </p>
            ) : null}
          </section>
        </CardContent>
      </Card>
    </main>
  );
}
