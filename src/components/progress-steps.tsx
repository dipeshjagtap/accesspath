import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Needs" },
  { id: 2, label: "Review" },
  { id: 3, label: "Plan" },
] as const;

export function ProgressSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Journey progress" className="mb-8">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((step, index) => {
          const done = step.id < current;
          const active = step.id === current;
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                    active && "bg-primary text-primary-foreground",
                    done && "bg-secondary text-secondary-foreground",
                    !active && !done && "bg-muted text-muted-foreground",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {step.id}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    active ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 ? (
                <div
                  className={cn(
                    "h-px flex-1",
                    done ? "bg-primary/40" : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
