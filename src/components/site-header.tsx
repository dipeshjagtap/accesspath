import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-primary transition-opacity hover:opacity-80"
        >
          AccessPath AI
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-1 sm:gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/resources">Resources</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/partner">Partner</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/privacy">Privacy</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/intake">Start</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
