import { Ban, CircleCheck, CircleDashed, CircleDot } from "lucide-react";

import { setChecklistStatusAction } from "@/app/actions/checklist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChecklistItem } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

const STATUSES = [
  ["not_started", "Not started"],
  ["in_progress", "In progress"],
  ["completed", "Done"],
  ["blocked", "Stuck"],
] as const;

const STATUS_LABEL: Record<string, string> = Object.fromEntries(STATUSES);

const STATUS_ICON = {
  not_started: CircleDashed,
  in_progress: CircleDot,
  completed: CircleCheck,
  blocked: Ban,
} as const;

const OWNER_LABEL: Record<string, string> = {
  user: "You",
  caregiver: "Carer or family",
  caseworker: "Caseworker",
};

export function ChecklistPanel({
  items,
  intakeId,
}: {
  items: ChecklistItem[];
  intakeId: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No checklist items yet. Confirm your summary to generate next steps.
      </p>
    );
  }

  const done = items.filter((item) => item.status === "completed").length;

  return (
    <div className="space-y-4">
      <div className="border-border bg-card rounded-2xl border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            {done} of {items.length} steps done
          </span>
          <span className="text-muted-foreground">
            {Math.round((done / items.length) * 100)}%
          </span>
        </div>
        <div
          className="bg-muted mt-2 h-2 overflow-hidden rounded-full"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-valuenow={done}
          aria-label="Checklist progress"
        >
          <div
            className="bg-primary h-full rounded-full transition-all"
            style={{ width: `${(done / items.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((item) => {
          const Icon =
            STATUS_ICON[item.status as keyof typeof STATUS_ICON] ??
            CircleDashed;
          return (
            <li
              key={item.id}
              className={cn(
                "border-border bg-card rounded-2xl border p-4",
                item.status === "completed" && "bg-secondary/40",
              )}
            >
              <div className="flex gap-3">
                <Icon
                  className={cn(
                    "mt-0.5 size-5 shrink-0",
                    item.status === "completed" && "text-primary",
                    item.status === "in_progress" && "text-amber-600",
                    item.status === "blocked" && "text-destructive",
                    item.status === "not_started" && "text-muted-foreground",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={cn(
                        "text-base font-semibold",
                        item.status === "completed" &&
                          "text-muted-foreground line-through decoration-1",
                      )}
                      id={`checklist-${item.id}`}
                    >
                      {item.title}
                    </h3>
                    <Badge variant="outline">
                      For: {OWNER_LABEL[item.ownerType] ?? item.ownerType}
                    </Badge>
                    <span className="sr-only">
                      Status: {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {item.description}
                  </p>
                  <form
                    action={setChecklistStatusAction}
                    className="mt-3 flex flex-wrap items-center gap-2"
                    aria-labelledby={`checklist-${item.id}`}
                  >
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="intakeId" value={intakeId} />
                    <span className="text-muted-foreground text-xs font-medium">
                      Mark as:
                    </span>
                    {STATUSES.map(([value, label]) => (
                      <Button
                        key={value}
                        type="submit"
                        name="status"
                        value={value}
                        size="sm"
                        variant={item.status === value ? "default" : "outline"}
                        aria-pressed={item.status === value}
                        aria-label={`${item.title}: mark as ${label}`}
                        className="h-8 rounded-full px-3 text-xs"
                      >
                        {label}
                      </Button>
                    ))}
                  </form>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
