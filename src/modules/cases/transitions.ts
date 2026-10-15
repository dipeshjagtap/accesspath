import type { caseStatusEnum } from "@/lib/db/schema";

export type CaseStatus = (typeof caseStatusEnum.enumValues)[number];

/**
 * Allowed status transitions (PRD v2).
 * Submitted ≠ accepted ≠ delivered.
 */
export const CASE_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  submitted: ["under_review", "declined", "closed"],
  under_review: [
    "information_requested",
    "accepted",
    "declined",
    "referred_elsewhere",
    "closed",
  ],
  information_requested: ["under_review", "accepted", "declined", "closed"],
  accepted: ["in_progress", "declined", "referred_elsewhere", "closed"],
  declined: ["referred_elsewhere", "closed"],
  in_progress: [
    "assistance_delivered",
    "partially_delivered",
    "not_delivered",
    "unresolved",
    "referred_elsewhere",
    "closed",
  ],
  referred_elsewhere: ["closed"],
  assistance_delivered: ["closed"],
  partially_delivered: ["closed", "in_progress"],
  not_delivered: ["closed", "referred_elsewhere"],
  unresolved: ["closed", "in_progress", "referred_elsewhere"],
  closed: [],
};

export const TERMINAL_OUTCOME_STATUSES: CaseStatus[] = [
  "assistance_delivered",
  "partially_delivered",
  "not_delivered",
  "unresolved",
  "closed",
];

export const RECOVERY_TRIGGER_STATUSES: CaseStatus[] = [
  "declined",
  "referred_elsewhere",
  "not_delivered",
  "unresolved",
];

export function canTransition(from: CaseStatus, to: CaseStatus): boolean {
  if (from === to) {
    return true;
  }
  return CASE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: CaseStatus, to: CaseStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid case status transition: ${from} → ${to}`);
  }
}

export function isClosedStatus(status: CaseStatus): boolean {
  return (
    status === "closed" ||
    status === "assistance_delivered" ||
    status === "not_delivered"
  );
}
