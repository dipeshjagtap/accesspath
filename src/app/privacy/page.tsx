import { ArrowRight, Ban, EyeOff, Lock, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = {
  title: "Privacy notice – how your details are used",
  description:
    "What AccessPath collects, why, and how nothing is shared with an organisation without your explicit consent.",
};

const points = [
  {
    icon: EyeOff,
    title: "Minimum information",
    text: "We collect only what is needed to suggest next steps: region, practical needs, and optional constraints you choose to share.",
  },
  {
    icon: Ban,
    title: "No diagnosis, no selling",
    text: "We do not ask for a diagnosis by default, and we never sell personal data or use case details for advertising.",
  },
  {
    icon: Lock,
    title: "Consent before sharing",
    text: "Nothing is shared with an organisation unless you give explicit consent later in the journey. You can ask for correction or deletion of demo data.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="Privacy notice (demo)"
        icon={ShieldCheck}
        title="Your details stay yours"
        description="Read this before sharing personal details in the intake."
      />
      <div className="section-x w-full flex-1 space-y-8 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {points.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="lift border-border bg-card rounded-2xl border p-6 shadow-sm"
            >
              <span className="bg-primary flex size-12 items-center justify-center rounded-xl text-white">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h2 className="text-brand-dark mt-4 text-lg font-bold">
                {title}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {text}
              </p>
            </article>
          ))}
        </div>

        <p className="border-coral/30 bg-coral/5 rounded-2xl border px-5 py-4 text-sm leading-relaxed">
          This hackathon build uses <strong>fictional demo data</strong>. Do not
          enter real health records, identity numbers, or exact home addresses.
        </p>

        <Link
          href="/intake"
          className="bg-primary hover:bg-brand-dark inline-flex min-h-12 items-center gap-2 rounded-full px-7 font-semibold text-white transition-colors"
        >
          I understand — continue to intake
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
