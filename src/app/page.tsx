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
            Discover published support programmes across education, essential
            needs, and disability/health navigation — match from the database,
            consent before sharing, and track outcomes. AI explains matches; it
            never invents organisations.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/intake">Describe a support need</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Multi-category demo</Badge>
            <Badge variant="outline">Fictional verified providers only</Badge>
          </div>
        </div>

        <Card className="bg-card/90">
          <CardHeader>
            <CardTitle>What AccessPath does</CardTitle>
            <CardDescription>
              Guided discovery, consent-based requests, and case coordination.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              People describe a need; the app returns database-backed programmes
              from verified organisations and explains why they may be relevant.
            </p>
            <p>
              Organisations manage programmes and requests. Admins review
              identity evidence before live requests are allowed.
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
            We never diagnose a condition, prescribe treatment or devices, or
            decide official eligibility.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evidence over guessing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Matching uses published programme records only. Unverified orgs
            cannot receive live requests.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consent before sharing</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            A request sent is not acceptance. Acceptance is not delivered
            assistance. Alternatives need fresh consent.
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How the journey works</h2>
        <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {[
            "Describe your need and confirm a plain-language summary.",
            "Review matched programmes from the database with AI explanations.",
            "Consent to share selected fields with one organisation.",
            "Track status through outcome — or consent to an alternative.",
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
          This hackathon build uses clearly labelled fictional demo
          organisations and programmes. Read the privacy notice before you
          begin.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/privacy">Privacy notice</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
