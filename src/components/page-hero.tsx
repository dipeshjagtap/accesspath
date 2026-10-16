import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Teal banner at the top of inner pages; matches the landing-page hero. */
export function PageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("brand-band relative overflow-hidden", className)}>
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-30" />
      {Icon ? (
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -bottom-10 hidden size-56 text-white/[0.07] sm:block"
          strokeWidth={1.25}
        />
      ) : null}
      <div className="section-x relative w-full space-y-4 py-12 sm:py-14">
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white ring-1 ring-white/20">
            {Icon ? (
              <Icon className="text-coral size-3.5" aria-hidden="true" />
            ) : null}
            {eyebrow}
          </span>
        ) : null}
        <h1 className="max-w-3xl text-3xl font-bold text-balance sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <div className="max-w-2xl text-base leading-relaxed text-white/80">
            {description}
          </div>
        ) : null}
        {children}
        {actions ? (
          <div className="flex flex-wrap gap-3 pt-2">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}

export const heroPrimaryAction =
  "inline-flex min-h-11 items-center gap-2 rounded-full bg-coral px-6 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5";

export const heroSecondaryAction =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-brand-dark";
