import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { listMembershipsForUser } from "@/modules/auth/permissions";
import { getCurrentUser } from "@/modules/auth/session";

export async function SiteHeader() {
  const user = await getCurrentUser();
  const memberships = user ? await listMembershipsForUser(user.id) : [];
  const isOrg = memberships.length > 0;
  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-primary transition-opacity hover:opacity-80"
        >
          AccessPath AI
        </Link>
        <nav
          aria-label="Primary"
          className="flex max-w-full flex-wrap items-center justify-end gap-1 sm:gap-2"
        >
          <Button asChild variant="ghost" size="sm">
            <Link href="/resources">Programmes</Link>
          </Button>
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">My requests</Link>
              </Button>
              {isOrg ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/org">Organisation</Link>
                </Button>
              ) : null}
              {isAdmin ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">Admin</Link>
                </Button>
              ) : null}
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/intake">Start</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
