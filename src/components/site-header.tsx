import { Lock, Menu, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { listMembershipsForUser } from "@/modules/auth/permissions";
import { describeRoles } from "@/modules/auth/roles";
import { getCurrentUser } from "@/modules/auth/session";
import { countCasesNeedingUserAttention } from "@/modules/cases/service";

const navLinkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const memberships = user ? await listMembershipsForUser(user.id) : [];
  const isOrg = memberships.length > 0;
  const isAdmin = user?.role === "admin";
  const primaryRole = user
    ? describeRoles(
        user.role,
        memberships.map((m) => ({
          memberRole: m.memberRole,
          organizationName: m.organization.name,
        })),
      )[0]
    : null;

  const canDescribeNeed = !isOrg && !isAdmin;
  const attentionCount =
    user && canDescribeNeed ? await countCasesNeedingUserAttention(user.id) : 0;

  const links = [
    { href: "/resources", label: "Programmes" },
    ...(user
      ? [
          ...(canDescribeNeed
            ? [
                {
                  href: "/dashboard",
                  label: "My requests",
                  count: attentionCount,
                },
              ]
            : []),
          ...(isOrg ? [{ href: "/org", label: "Organisation" }] : []),
          ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
        ]
      : [
          { href: "/#how-it-works", label: "How it works" },
          { href: "/#organisations", label: "For organisations" },
        ]),
    { href: "/privacy", label: "Privacy" },
  ];

  const linkContent = (link: { label: string; count?: number }) =>
    link.count ? (
      <span className="inline-flex items-center gap-1.5">
        {link.label}
        <span
          className="bg-coral inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
          aria-label={`${link.count} ${link.count === 1 ? "request needs" : "requests need"} your attention`}
        >
          {link.count}
        </span>
      </span>
    ) : (
      link.label
    );

  const roleBadge = primaryRole ? (
    <span
      className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
      title={
        primaryRole.organizationName
          ? `${primaryRole.label} at ${primaryRole.organizationName}`
          : primaryRole.label
      }
    >
      {primaryRole.label}
    </span>
  ) : null;

  const describeNeedButton = (
    <Link
      href="/intake"
      className="bg-coral inline-flex min-h-10 items-center rounded-full px-5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5"
    >
      Describe a need
    </Link>
  );

  const actions = user ? (
    <>
      <form action={logoutAction}>
        <button
          type="submit"
          className="hover:text-brand-dark min-h-10 rounded-full border border-white/40 px-4 text-sm font-semibold text-white transition-colors hover:bg-white"
        >
          Sign out
        </button>
      </form>
      {canDescribeNeed ? describeNeedButton : null}
    </>
  ) : (
    <>
      <Link href="/login" className={navLinkClass}>
        Sign in
      </Link>
      {describeNeedButton}
    </>
  );

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand-deep hidden text-xs text-white/80 sm:block">
        <div className="section-x flex w-full items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Verified organisations only
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5" aria-hidden="true" />
              Consent before sharing
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Hackathon demo · fictional data
          </span>
        </div>
      </div>

      <div className="bg-primary shadow-md shadow-black/5">
        <div className="section-x flex w-full items-center justify-between gap-3 py-3">
          <Link
            href="/"
            className="transition-opacity hover:opacity-90"
            aria-label="AccessPath AI home"
          >
            <Logo />
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 lg:flex"
          >
            {links.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {linkContent(link)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {roleBadge}
            {actions}
          </div>

          <details className="group relative lg:hidden">
            <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-md text-white hover:bg-white/10 [&::-webkit-details-marker]:hidden">
              <Menu className="size-6" aria-hidden="true" />
              <span className="sr-only">Open menu</span>
            </summary>
            <div className="bg-brand-dark absolute right-0 mt-2 w-64 space-y-1 rounded-xl p-3 shadow-2xl">
              {roleBadge ? <div className="px-3 pb-2">{roleBadge}</div> : null}
              <nav aria-label="Mobile" className="flex flex-col">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={navLinkClass}
                  >
                    {linkContent(link)}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-wrap items-center gap-2 border-t border-white/15 pt-3">
                {actions}
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
