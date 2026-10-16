import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Database,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Lock,
  MessageSquareText,
  Send,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import heroImage from "../../public/images/hero-programmes.jpg";
import individualsImage from "../../public/images/individuals-illustration.jpg";
import organisationsImage from "../../public/images/organisations-illustration.jpg";
import { homePathForUser } from "@/modules/auth/permissions";
import { getCurrentUser } from "@/modules/auth/session";
import { getPlatformStats } from "@/modules/programmes/repository";

const categories = [
  {
    icon: GraduationCap,
    title: "Education support",
    text: "Tutoring, learning materials, and school-related programmes.",
  },
  {
    icon: ShoppingBasket,
    title: "Essential needs",
    text: "Food, basic supplies, and short-term essential support.",
  },
  {
    icon: HeartPulse,
    title: "Disability & health",
    text: "Navigation to disability and health-related support services.",
  },
  {
    icon: HandHeart,
    title: "Human follow-through",
    text: "Real caseworkers review, accept, and deliver every request.",
  },
];

const steps = [
  {
    icon: MessageSquareText,
    title: "Describe your need",
    text: "Tell us in your own words, then confirm a plain-language summary.",
  },
  {
    icon: Sparkles,
    title: "See matched programmes",
    text: "Database-backed matches from verified organisations, explained by AI.",
  },
  {
    icon: Send,
    title: "Consent and send",
    text: "Choose exactly which details to share with one organisation.",
  },
  {
    icon: ClipboardCheck,
    title: "Track to outcome",
    text: "Follow status through delivery, or consent to an alternative.",
  },
];

const promises = [
  {
    icon: Stethoscope,
    title: "Never diagnoses",
    text: "We never diagnose a condition, prescribe treatment or devices, or decide official eligibility.",
  },
  {
    icon: Database,
    title: "Evidence over guessing",
    text: "Matching uses published programme records only. AI explains matches; it never invents organisations.",
  },
  {
    icon: Lock,
    title: "Consent before sharing",
    text: "A request sent is not acceptance, and acceptance is not delivery. Alternatives need fresh consent.",
  },
];

const faqs = [
  {
    q: "Is AccessPath free to use?",
    a: "Yes. Individuals and caregivers can describe a need, review matches, and track requests at no cost.",
  },
  {
    q: "How are organisations verified?",
    a: "A platform admin reviews registration evidence and contact channels before an organisation can receive live requests. Verification is not a government endorsement.",
  },
  {
    q: "What information is shared with an organisation?",
    a: "Only the fields you explicitly consent to share, with the one organisation you choose. Every consent is recorded in your history.",
  },
  {
    q: "Does the AI decide whether I am eligible?",
    a: "No. AI only explains why a published programme may be relevant. Eligibility is always decided by the organisation running the programme.",
  },
];

async function loadStats() {
  try {
    return await getPlatformStats();
  } catch {
    return null;
  }
}

export default async function LandingPage() {
  const [user, stats] = await Promise.all([getCurrentUser(), loadStats()]);
  const homePath = user ? await homePathForUser(user) : null;
  const isStaff = homePath === "/org" || homePath === "/admin";

  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="brand-band relative overflow-hidden pb-40">
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="section-x relative grid w-full items-center gap-12 pt-14 lg:grid-cols-2 lg:pt-20">
          <div className="space-y-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white ring-1 ring-white/20">
              <BadgeCheck className="text-coral size-4" aria-hidden="true" />
              From unmet need to delivered support
            </span>
            <h1 className="text-4xl leading-tight font-bold text-balance sm:text-5xl lg:text-[3.25rem]">
              Find verified support for{" "}
              <span className="text-[#ffd9c9]">
                education, essential needs &amp; disability care
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-pretty text-white/80">
              Describe what you need in your own words. AccessPath finds
              published programmes from verified organisations across education,
              essential needs, and disability and health support, then helps you
              track every step.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={isStaff && homePath ? homePath : "/intake"}
                className="bg-coral inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-base font-semibold text-white shadow-xl shadow-black/15 transition-transform hover:-translate-y-0.5"
              >
                {isStaff ? "Go to my workspace" : "Describe a support need"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={!isStaff && homePath ? homePath : "/resources"}
                className="hover:text-brand-dark inline-flex min-h-12 items-center rounded-full border border-white/40 px-7 text-base font-semibold text-white transition-colors hover:bg-white"
              >
                {!isStaff && homePath ? "Go to my workspace" : "Browse programmes"}
              </Link>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
              {[
                "Free for individuals",
                "No diagnosis",
                "You control sharing",
              ].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    className="size-4 text-[#9fe3d6]"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-white/10 blur-2xl" />
            <Image
              src={heroImage}
              alt="Three support scenes joined by one path: a tutor helping a schoolgirl with books, a volunteer handing a family a grocery basket, and a health worker supporting an older woman with a cane."
              className="relative rounded-[2rem] shadow-2xl ring-8 ring-white/10"
              sizes="(min-width: 1024px) 560px, 100vw"
              preload
              placeholder="blur"
            />
            <div className="float-slow text-foreground absolute bottom-10 -left-4 hidden items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl sm:flex">
              <span className="bg-secondary text-primary flex size-10 items-center justify-center rounded-full">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-bold">
                  Verified provider
                </span>
                <span className="text-muted-foreground block text-xs">
                  Registration evidence reviewed
                </span>
              </span>
            </div>
            <div
              className="float-slow text-foreground absolute -top-5 right-6 hidden items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl sm:flex"
              style={{ animationDelay: "1.5s" }}
            >
              <Lock className="text-coral size-4" aria-hidden="true" />
              <span className="text-sm font-bold">Consent recorded</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category cards overlapping the hero */}
      <section
        aria-label="Support categories"
        className="section-x relative z-10 -mt-24 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {categories.map(({ icon: Icon, title, text }) => (
          <Link
            key={title}
            href="/resources"
            className="lift group bg-primary shadow-brand-dark/20 hover:bg-brand-dark flex flex-col items-center rounded-2xl px-6 py-9 text-center text-white shadow-xl"
          >
            <span className="group-hover:bg-coral mb-5 flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 transition-colors">
              <Icon className="size-8" aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/75">{text}</p>
          </Link>
        ))}
      </section>

      {/* For individuals */}
      <section className="section-x grid w-full items-center gap-12 py-24 lg:grid-cols-2">
        <div className="relative">
          <div className="bg-coral/15 absolute -top-6 -left-6 size-32 rounded-full" />
          <div className="bg-secondary absolute -right-6 -bottom-6 size-40 rounded-full" />
          <Image
            src={individualsImage}
            alt="A mother and her teenage son review a support checklist on a tablet with help from a friendly AI assistant."
            className="relative rounded-3xl shadow-xl"
            sizes="(min-width: 1024px) 560px, 100vw"
            placeholder="blur"
          />
        </div>
        <div className="space-y-6">
          <p className="section-eyebrow">For individuals &amp; caregivers</p>
          <h2 className="text-brand-dark text-3xl font-bold sm:text-4xl">
            Support that starts with your words, not a form
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Explain your situation the way you would to a friend. We turn it
            into a clear summary you confirm, then show programmes you can
            actually reach, with honest reasons why each may fit.
          </p>
          <ul className="space-y-3">
            {[
              "Plain-language summaries you review before anything happens",
              "Only published programmes from verified organisations",
              "A personal checklist of documents and next steps",
              "Status updates from real caseworkers through to delivery",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2
                  className="text-primary mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link
            href={isStaff && homePath ? homePath : "/intake"}
            className="bg-primary hover:bg-brand-dark inline-flex min-h-12 items-center gap-2 rounded-full px-7 font-semibold text-white transition-colors"
          >
            {isStaff ? "Go to my workspace" : "Start now"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Stats */}
      {stats ? (
        <section className="brand-band relative overflow-hidden">
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />
          <dl className="section-x relative grid w-full gap-8 py-14 text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ClipboardCheck,
                value: stats.programmes,
                label: "Published programmes",
              },
              {
                icon: Building2,
                value: stats.verifiedOrgs,
                label: "Verified organisations",
              },
              {
                icon: Users,
                value: stats.categories,
                label: "Support categories",
              },
              { icon: Lock, value: "100%", label: "Consent-based sharing" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="text-coral size-8" aria-hidden="true" />
                <dt className="order-last text-sm text-white/75">{label}</dt>
                <dd className="font-[family-name:var(--font-montserrat)] text-4xl font-bold">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {/* How it works */}
      <section
        id="how-it-works"
        className="section-x w-full scroll-mt-28 py-24"
      >
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p className="section-eyebrow">How it works</p>
          <h2 className="text-brand-dark text-3xl font-bold sm:text-4xl">
            Four steps from need to delivered help
          </h2>
          <p className="text-muted-foreground">
            You stay in control the whole way. Nothing is shared until you say
            so.
          </p>
        </div>
        <ol className="relative mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="border-primary/30 absolute top-10 right-[12%] left-[12%] hidden border-t-2 border-dashed lg:block"
          />
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li
              key={title}
              className="relative flex flex-col items-center text-center"
            >
              <span className="text-primary ring-border relative flex size-20 items-center justify-center rounded-full bg-white shadow-lg ring-1">
                <Icon className="size-8" aria-hidden="true" />
                <span className="bg-coral absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full text-xs font-bold text-white">
                  {index + 1}
                </span>
              </span>
              <h3 className="text-brand-dark mt-5 text-lg font-bold">
                {title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Promises */}
      <section className="bg-secondary/60">
        <div className="section-x w-full py-24">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            <p className="section-eyebrow">Our promises</p>
            <h2 className="text-brand-dark text-3xl font-bold sm:text-4xl">
              Safety boundaries built in, not bolted on
            </h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {promises.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="lift border-border bg-card rounded-2xl border p-8 shadow-sm"
              >
                <span className="bg-primary flex size-14 items-center justify-center rounded-xl text-white">
                  <Icon className="size-7" aria-hidden="true" />
                </span>
                <h3 className="text-brand-dark mt-6 text-xl font-bold">
                  {title}
                </h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* For organisations */}
      <section
        id="organisations"
        className="section-x grid w-full scroll-mt-28 items-center gap-12 py-24 lg:grid-cols-2"
      >
        <div className="order-2 space-y-6 lg:order-1">
          <p className="section-eyebrow">For organisations</p>
          <h2 className="text-brand-dark text-3xl font-bold sm:text-4xl">
            Reach the people your programmes were built for
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            NGOs, clinics, and service providers publish programmes once and
            receive consented, well-described requests. Your team manages cases
            together with clear roles.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: BadgeCheck,
                title: "Get verified",
                text: "Admins review your registration evidence.",
              },
              {
                icon: ClipboardCheck,
                title: "Publish programmes",
                text: "Describe eligibility, documents, and regions.",
              },
              {
                icon: Users,
                title: "Invite your team",
                text: "Organisation admins, caseworkers, and viewers.",
              },
              {
                icon: HandHeart,
                title: "Record outcomes",
                text: "Track every request through to delivery.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="bg-card ring-border flex gap-3 rounded-xl p-4 shadow-sm ring-1"
              >
                <Icon
                  className="text-coral mt-0.5 size-6 shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-brand-dark font-bold">{title}</h3>
                  <p className="text-muted-foreground text-sm">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href={user ? "/org" : "/register"}
            className="bg-coral inline-flex min-h-12 items-center gap-2 rounded-full px-7 font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            {user
              ? "Open organisation workspace"
              : "Register your organisation"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="relative order-1 lg:order-2">
          <div className="bg-coral/15 absolute -top-6 -right-6 size-36 rounded-full" />
          <Image
            src={organisationsImage}
            alt="An NGO team collaborates around a table, reviewing verified cases on a wall dashboard."
            className="relative rounded-3xl shadow-xl"
            sizes="(min-width: 1024px) 560px, 100vw"
            placeholder="blur"
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="section-x w-full pb-24">
        <div className="space-y-4 text-center">
          <p className="section-eyebrow">Questions</p>
          <h2 className="text-brand-dark text-3xl font-bold sm:text-4xl">
            Frequently asked
          </h2>
        </div>
        <div className="mt-10 grid items-start gap-3 lg:grid-cols-2">
          {faqs.map(({ q, a }) => (
            <details
              key={q}
              className="group border-border bg-card open:ring-primary/20 rounded-xl border p-5 shadow-sm open:ring-2"
            >
              <summary className="text-brand-dark flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {q}
                <span className="bg-secondary text-primary flex size-7 shrink-0 items-center justify-center rounded-full transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-muted-foreground mt-3 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-x w-full pb-24">
        <div className="brand-band relative overflow-hidden rounded-3xl px-8 py-14 text-center shadow-2xl sm:px-14">
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative mx-auto max-w-2xl space-y-5">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to find support that fits?
            </h2>
            <p className="text-white/80">
              It takes a few minutes to describe your need. Nothing is shared
              until you give consent.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={isStaff && homePath ? homePath : "/intake"}
                className="bg-coral inline-flex min-h-12 items-center gap-2 rounded-full px-7 font-semibold text-white shadow-xl shadow-black/15 transition-transform hover:-translate-y-0.5"
              >
                {isStaff ? "Go to my workspace" : "Describe a support need"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              {homePath ? null : (
                <Link
                  href="/register"
                  className="hover:text-brand-dark inline-flex min-h-12 items-center rounded-full border border-white/40 px-7 font-semibold text-white transition-colors hover:bg-white"
                >
                  Create an account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
