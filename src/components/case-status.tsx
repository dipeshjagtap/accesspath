import { Check, CircleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CASE_STAGES,
  CASE_STATUS_META,
  caseStageIndex,
  caseStatusLabel,
  type StatusTone,
} from "@/modules/cases/labels";
import type { CaseStatus } from "@/modules/cases/transitions";

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: "bg-muted text-foreground ring-border",
  info: "bg-sky-50 text-sky-800 ring-sky-200",
  success: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  warning: "bg-amber-50 text-amber-900 ring-amber-200",
  danger: "bg-red-50 text-red-800 ring-red-200",
};

export function CaseStatusPill({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const tone = CASE_STATUS_META[status as CaseStatus]?.tone ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1",
        TONE_CLASS[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {caseStatusLabel(status)}
    </span>
  );
}

/** Progress along the main path; statuses off that path render as an end-state notice. */
export function CaseStatusTracker({ status }: { status: string }) {
  const current = caseStageIndex(status);
  const meta = CASE_STATUS_META[status as CaseStatus];

  if (current === -1) {
    return (
      <div className="border-border bg-card flex items-start gap-3 rounded-2xl border p-5">
        <CircleAlert
          className="mt-0.5 size-5 shrink-0 text-amber-600"
          aria-hidden
        />
        <div>
          <p className="font-semibold">{caseStatusLabel(status)}</p>
          {meta ? (
            <p className="text-muted-foreground text-sm">{meta.description}</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="border-border bg-card rounded-2xl border p-5">
      <ol className="grid grid-cols-5 gap-2" aria-label="Request progress">
        {CASE_STAGES.map((stage, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={stage.label}
              aria-current={active ? "step" : undefined}
              className="flex flex-col gap-2"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full",
                  done || active ? "bg-primary" : "bg-muted",
                )}
              />
              <span className="flex items-center gap-1.5 text-xs">
                {done ? (
                  <Check className="text-primary size-3.5" aria-hidden />
                ) : null}
                <span
                  className={cn(
                    active
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  {active ? caseStatusLabel(status) : stage.label}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {meta ? (
        <p className="text-muted-foreground mt-4 text-sm">{meta.description}</p>
      ) : null}
    </div>
  );
}
