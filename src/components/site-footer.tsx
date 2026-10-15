import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-card/60">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          AccessPath AI does not diagnose, prescribe, or determine eligibility.
          Hackathon demo uses fictional data.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          <Link className="underline-offset-2 hover:underline" href="/privacy">
            Privacy
          </Link>
          <Link className="underline-offset-2 hover:underline" href="/resources">
            Resources
          </Link>
          <Link className="underline-offset-2 hover:underline" href="/org">
            Organisation
          </Link>
          <Link className="underline-offset-2 hover:underline" href="/login">
            Sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
