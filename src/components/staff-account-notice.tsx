import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import type { AccountKind } from "@/modules/auth/permissions";

/** Shown instead of the support-request flow to organisation and admin accounts. */
export function StaffAccountNotice({ kind }: { kind: AccountKind }) {
  const isAdmin = kind === "admin";
  const workspace = isAdmin
    ? { href: "/admin", label: "Go to admin workspace" }
    : { href: "/org", label: "Go to organisation workspace" };

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow={isAdmin ? "Platform admin account" : "Organisation account"}
        icon={Building2}
        title="Support requests come from individuals"
        description="You are signed in with a staff account, which is for responding to requests, not creating them."
      />
      <div className="section-x py-12">
        <div className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h2 className="font-display text-xl font-semibold">
            What you can do instead
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            {isAdmin ? (
              <li>Review organisations, programmes and accounts from the admin workspace.</li>
            ) : (
              <>
                <li>Review and update incoming requests from your organisation workspace.</li>
                <li>Publish or edit the programmes people can be matched with.</li>
              </>
            )}
            <li>
              If you need support yourself, sign out and use a personal account.
              This keeps your own information separate from your work account.
            </li>
          </ul>
          <Button asChild size="lg">
            <Link href={workspace.href}>
              {workspace.label}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
