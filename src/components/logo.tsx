import { cn } from "@/lib/utils";

/** Three routes (education, essential needs, disability & health) meeting at one destination. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className={cn("size-9 shrink-0", className)}
    >
      <defs>
        <linearGradient id="ap-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14a08f" />
          <stop offset="1" stopColor="#064e47" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#ap-mark-bg)" />
      <path
        d="M11 39c0-11 13-12 13-22"
        fill="none"
        stroke="#9fe3d6"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M37 39c0-11-13-12-13-22"
        fill="none"
        stroke="#f6c453"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <path
        d="M24 39V17"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      <circle cx="24" cy="12.5" r="5.6" fill="#ffffff" />
      <circle cx="24" cy="12.5" r="3.8" fill="#f26b3a" />
    </svg>
  );
}

export function Logo({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span
        className={cn(
          "font-[family-name:var(--font-montserrat)] text-xl font-bold tracking-tight",
          tone === "light" ? "text-white" : "text-brand-dark",
        )}
      >
        AccessPath
        <span className="bg-coral ml-1 rounded-md px-1.5 py-0.5 align-middle text-xs font-bold text-white">
          AI
        </span>
      </span>
    </span>
  );
}
