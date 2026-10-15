import { setChecklistStatusAction } from "@/app/actions/checklist";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChecklistItem } from "@/lib/db/schema";

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  blocked: "Blocked",
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
      <p className="text-sm text-muted-foreground">
        No checklist items yet. Confirm your summary to generate next steps.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-xl border border-border bg-card/80 p-4"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{item.title}</h3>
            <Badge
              variant={
                item.status === "completed"
                  ? "success"
                  : item.status === "blocked"
                    ? "danger"
                    : item.status === "in_progress"
                      ? "warning"
                      : "secondary"
              }
            >
              {STATUS_LABEL[item.status] ?? item.status}
            </Badge>
            <Badge variant="outline">Owner: {item.ownerType}</Badge>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
          <form action={setChecklistStatusAction} className="flex flex-wrap gap-2">
            <input type="hidden" name="itemId" value={item.id} />
            <input type="hidden" name="intakeId" value={intakeId} />
            {(
              [
                ["not_started", "Not started"],
                ["in_progress", "In progress"],
                ["completed", "Completed"],
                ["blocked", "Blocked"],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="submit"
                name="status"
                value={value}
                size="sm"
                variant={item.status === value ? "default" : "outline"}
                aria-pressed={item.status === value}
              >
                {label}
              </Button>
            ))}
          </form>
        </li>
      ))}
    </ul>
  );
}
