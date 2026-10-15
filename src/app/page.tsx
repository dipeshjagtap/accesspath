import Link from "next/link";

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

export default function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-10 sm:px-6 sm:py-14">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            AccessPath AI
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold text-balance sm:text-5xl">
            From unmet need to delivered support
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
            Get a clear next-step plan for mobility support using verified
            provider and assistance records — not guesses, diagnoses, or
            prescriptions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/intake">Start mobility-support journey</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/resources">Browse verified resources</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">No account needed for the demo</Badge>
            <Badge variant="outline">Fictional demo data</Badge>
          </div>
        </div>

        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle>Who it helps</CardTitle>
            <CardDescription>
              People exploring mobility aids, caregivers, and partner
              organizations coordinating follow-up.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              AccessPath organizes practical next steps, verified contacts, and
              a checklist you can track.
            </p>
            <p>
              After your plan, you can optionally consent to share a referral
              with a demo partner organization and track follow-up.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Important boundaries">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Does not diagnose</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We never diagnose a condition or prescribe a device. Qualified
            professionals assess clinical suitability.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evidence over guessing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Provider and program facts come from curated records with source and
            verification status. Information can change.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Privacy by design</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            We collect only what is needed for navigation. Sharing with a partner
            organization always requires your explicit consent.
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How the journey works</h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {[
            "Describe practical needs — no diagnosis required.",
            "Review and edit a plain-language summary.",
            "Get verified resources and a trackable checklist.",
          ].map((step, index) => (
            <li
              key={step}
              className="rounded-xl border border-border bg-card/70 p-4 text-sm leading-relaxed"
            >
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-primary">
                Step {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <Separator />

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Read how personal information is used before you begin. This hackathon
          build uses fictional people and curated demo resources only.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/privacy">Privacy notice</Link>
          </Button>
          <Button asChild>
            <Link href="/intake">Begin</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
