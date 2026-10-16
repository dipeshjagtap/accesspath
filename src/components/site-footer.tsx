import { HeartHandshake, Lock, ShieldCheck, Stethoscope } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { accountKindFor, canSubmitNeeds } from "@/modules/auth/permissions";
import { getCurrentUser } from "@/modules/auth/session";

const linkClass = "text-white/70 transition-colors hover:text-white";

export async function SiteFooter() {
  const user = await getCurrentUser();
  const canDescribeNeed = canSubmitNeeds(await accountKindFor(user));

  const columns = [
    {
      title: "Explore",
      links: [
        { href: "/", label: "Home" },
        { href: "/resources", label: "Programmes" },
        ...(canDescribeNeed
          ? [{ href: "/intake", label: "Describe a need" }]
          : []),
        { href: "/#how-it-works", label: "How it works" },
      ],
    },
    {
      title: "Organisations",
      links: [
        { href: "/#organisations", label: "Why join" },
        { href: "/org", label: "Organisation workspace" },
        ...(user
          ? []
          : [{ href: "/register", label: "Register an organisation" }]),
      ],
    },
    {
      title: "Account",
      links: user
        ? [
            { href: "/dashboard", label: "My requests" },
            { href: "/privacy", label: "Privacy notice" },
          ]
        : [
            { href: "/login", label: "Sign in" },
            { href: "/register", label: "Create account" },
            { href: "/privacy", label: "Privacy notice" },
          ],
    },
  ];

  return (
    <footer className="bg-brand-deep mt-auto text-sm text-white">
      <div className="section-x grid w-full gap-10 py-14 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs leading-relaxed text-white/70">
            From unmet need to delivered support. Discover verified programmes,
            share only what you consent to, and track every step.
          </p>
          <ul className="space-y-2 text-white/80">
            <li className="flex items-center gap-2">
              <ShieldCheck className="text-coral size-4" aria-hidden="true" />
              Verified organisations only
            </li>
            <li className="flex items-center gap-2">
              <Lock className="text-coral size-4" aria-hidden="true" />
              Consent before any sharing
            </li>
            <li className="flex items-center gap-2">
              <HeartHandshake
                className="text-coral size-4"
                aria-hidden="true"
              />
              Human caseworkers, not bots
            </li>
          </ul>
        </div>

        {columns.map((column) => (
          <nav
            key={column.title}
            aria-label={column.title}
            className="space-y-4"
          >
            <h2 className="text-base font-semibold">{column.title}</h2>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="section-x flex w-full flex-col gap-2 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} AccessPath AI · Hackathon demo with
            fictional data.
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Stethoscope className="size-3.5" aria-hidden="true" />
            Does not diagnose, prescribe, or determine eligibility.
          </p>
        </div>
      </div>
    </footer>
  );
}
