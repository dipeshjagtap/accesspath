import type { CaseStatus } from "@/modules/cases/transitions";

export type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export const CASE_STATUS_META: Record<
  CaseStatus,
  { label: string; description: string; tone: StatusTone }
> = {
  submitted: {
    label: "New request",
    description: "Received and waiting for someone to review it.",
    tone: "info",
  },
  under_review: {
    label: "Under review",
    description: "You are checking whether the programme can help.",
    tone: "info",
  },
  information_requested: {
    label: "More information needed",
    description: "You have asked the person for more details.",
    tone: "warning",
  },
  accepted: {
    label: "Accepted",
    description: "The programme can help. Support has not started yet.",
    tone: "success",
  },
  declined: {
    label: "Declined",
    description: "The programme cannot help with this request.",
    tone: "danger",
  },
  in_progress: {
    label: "Support in progress",
    description: "Support is being arranged or delivered.",
    tone: "info",
  },
  referred_elsewhere: {
    label: "Referred elsewhere",
    description: "The person has been pointed to another provider.",
    tone: "warning",
  },
  assistance_delivered: {
    label: "Support delivered",
    description: "The support was fully delivered.",
    tone: "success",
  },
  partially_delivered: {
    label: "Partly delivered",
    description: "Some of the support was delivered.",
    tone: "warning",
  },
  not_delivered: {
    label: "Not delivered",
    description: "The support could not be delivered.",
    tone: "danger",
  },
  unresolved: {
    label: "Unresolved",
    description: "The request is stuck and needs a decision.",
    tone: "warning",
  },
  closed: {
    label: "Closed",
    description: "No further action will be taken.",
    tone: "neutral",
  },
};

export function caseStatusLabel(status: string): string {
  return (
    CASE_STATUS_META[status as CaseStatus]?.label ?? status.replaceAll("_", " ")
  );
}

/** Main happy path shown in the progress tracker; other statuses are end states. */
export const CASE_STAGES = [
  { label: "Received", statuses: ["submitted"] },
  {
    label: "Under review",
    statuses: ["under_review", "information_requested"],
  },
  { label: "Accepted", statuses: ["accepted"] },
  { label: "In progress", statuses: ["in_progress"] },
  {
    label: "Outcome",
    statuses: [
      "assistance_delivered",
      "partially_delivered",
      "not_delivered",
      "unresolved",
    ],
  },
] as const satisfies ReadonlyArray<{ label: string; statuses: CaseStatus[] }>;

export function caseStageIndex(status: string): number {
  return CASE_STAGES.findIndex((stage) =>
    (stage.statuses as readonly string[]).includes(status),
  );
}

export function formatCaseDate(date: Date): string {
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}
