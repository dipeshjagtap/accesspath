import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  assistancePrograms,
  auditEvents,
  caseNotes,
  cases,
  intakes,
  organizations,
  type Case,
} from "@/lib/db/schema";
import {
  assertTransition,
  isClosedStatus,
  type CaseStatus,
} from "@/modules/cases/transitions";
import {
  AWAITING_RECEIPT_STATUSES,
  isAwaitingUserConfirmation,
  needsUserAttention,
  statusAfterReceipt,
  type ConfirmReceiptInput,
} from "@/modules/cases/receipt";
import {
  caseStatusValues,
  type UpdateCaseStatusInput,
} from "@/modules/cases/types";
import { matchPublishedProgrammes } from "@/modules/programmes/repository";
import type { PublicProgramme } from "@/modules/programmes/types";

export type CaseView = {
  caseRow: Case;
  intakeRegion: string;
  intakeSummary: string | null;
  intakeUserId: string | null;
  organizationName: string;
  programmeName: string;
  programmeId: string;
};

export async function listCasesForOrganization(
  organizationId: string,
): Promise<CaseView[]> {
  const db = getDb();
  return db
    .select({
      caseRow: cases,
      intakeRegion: intakes.region,
      intakeSummary: intakes.confirmedSummary,
      intakeUserId: intakes.userId,
      organizationName: organizations.name,
      programmeName: assistancePrograms.name,
      programmeId: assistancePrograms.id,
    })
    .from(cases)
    .innerJoin(intakes, eq(cases.intakeId, intakes.id))
    .innerJoin(organizations, eq(cases.organizationId, organizations.id))
    .innerJoin(
      assistancePrograms,
      eq(cases.assistanceProgramId, assistancePrograms.id),
    )
    .where(eq(cases.organizationId, organizationId))
    .orderBy(desc(cases.updatedAt));
}

export async function listCasesForUser(userId: string): Promise<CaseView[]> {
  const db = getDb();
  return db
    .select({
      caseRow: cases,
      intakeRegion: intakes.region,
      intakeSummary: intakes.confirmedSummary,
      intakeUserId: intakes.userId,
      organizationName: organizations.name,
      programmeName: assistancePrograms.name,
      programmeId: assistancePrograms.id,
    })
    .from(cases)
    .innerJoin(intakes, eq(cases.intakeId, intakes.id))
    .innerJoin(organizations, eq(cases.organizationId, organizations.id))
    .innerJoin(
      assistancePrograms,
      eq(cases.assistanceProgramId, assistancePrograms.id),
    )
    .where(eq(intakes.userId, userId))
    .orderBy(desc(cases.updatedAt));
}

export async function getCaseForOrganization(
  caseId: string,
  organizationId: string,
): Promise<CaseView | null> {
  const db = getDb();
  const rows = await db
    .select({
      caseRow: cases,
      intakeRegion: intakes.region,
      intakeSummary: intakes.confirmedSummary,
      intakeUserId: intakes.userId,
      organizationName: organizations.name,
      programmeName: assistancePrograms.name,
      programmeId: assistancePrograms.id,
    })
    .from(cases)
    .innerJoin(intakes, eq(cases.intakeId, intakes.id))
    .innerJoin(organizations, eq(cases.organizationId, organizations.id))
    .innerJoin(
      assistancePrograms,
      eq(cases.assistanceProgramId, assistancePrograms.id),
    )
    .where(and(eq(cases.id, caseId), eq(cases.organizationId, organizationId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCaseForUser(
  caseId: string,
  userId: string,
): Promise<CaseView | null> {
  const db = getDb();
  const rows = await db
    .select({
      caseRow: cases,
      intakeRegion: intakes.region,
      intakeSummary: intakes.confirmedSummary,
      intakeUserId: intakes.userId,
      organizationName: organizations.name,
      programmeName: assistancePrograms.name,
      programmeId: assistancePrograms.id,
    })
    .from(cases)
    .innerJoin(intakes, eq(cases.intakeId, intakes.id))
    .innerJoin(organizations, eq(cases.organizationId, organizations.id))
    .innerJoin(
      assistancePrograms,
      eq(cases.assistanceProgramId, assistancePrograms.id),
    )
    .where(and(eq(cases.id, caseId), eq(intakes.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCaseById(caseId: string): Promise<CaseView | null> {
  const db = getDb();
  const rows = await db
    .select({
      caseRow: cases,
      intakeRegion: intakes.region,
      intakeSummary: intakes.confirmedSummary,
      intakeUserId: intakes.userId,
      organizationName: organizations.name,
      programmeName: assistancePrograms.name,
      programmeId: assistancePrograms.id,
    })
    .from(cases)
    .innerJoin(intakes, eq(cases.intakeId, intakes.id))
    .innerJoin(organizations, eq(cases.organizationId, organizations.id))
    .innerJoin(
      assistancePrograms,
      eq(cases.assistanceProgramId, assistancePrograms.id),
    )
    .where(eq(cases.id, caseId))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateCaseStatus(
  input: UpdateCaseStatusInput,
  actor: { organizationId: string; userId: string },
): Promise<Case> {
  if (!caseStatusValues.includes(input.status)) {
    throw new Error("Invalid case status");
  }

  const existing = await getCaseForOrganization(
    input.caseId,
    actor.organizationId,
  );
  if (!existing) {
    throw new Error("Case not found for this organization");
  }

  assertTransition(
    existing.caseRow.status as CaseStatus,
    input.status as CaseStatus,
  );

  const closed = isClosedStatus(input.status as CaseStatus);
  const statusChanged = existing.caseRow.status !== input.status;
  const hasUserNote = Boolean(input.userVisibleNote?.trim());
  // A fresh delivery claim needs a fresh answer from the person.
  const resetReceipt =
    statusChanged &&
    AWAITING_RECEIPT_STATUSES.includes(input.status as CaseStatus);
  const now = new Date();

  const db = getDb();
  const [updated] = await db
    .update(cases)
    .set({
      status: input.status,
      statusReason: input.statusReason ?? existing.caseRow.statusReason,
      nextAction: input.nextAction ?? existing.caseRow.nextAction,
      outcome: input.outcome ?? existing.caseRow.outcome,
      outcomeConfirmedBy:
        input.outcomeConfirmedBy ?? existing.caseRow.outcomeConfirmedBy,
      assignedToUserId:
        input.assignedToUserId === undefined
          ? existing.caseRow.assignedToUserId
          : input.assignedToUserId,
      followUpDueAt:
        input.followUpDueAt === undefined
          ? existing.caseRow.followUpDueAt
          : input.followUpDueAt
            ? new Date(input.followUpDueAt)
            : null,
      updatedAt: now,
      closedAt: closed ? now : null,
      lastUserNotifiedAt:
        statusChanged || hasUserNote
          ? now
          : existing.caseRow.lastUserNotifiedAt,
      ...(resetReceipt
        ? {
            userConfirmation: null,
            userConfirmationNote: null,
            userConfirmedAt: null,
          }
        : {}),
    })
    .where(eq(cases.id, input.caseId))
    .returning();

  if (!updated) {
    throw new Error("Failed to update case");
  }

  await db.insert(auditEvents).values({
    actorUserId: actor.userId,
    organizationId: actor.organizationId,
    entityType: "case",
    entityId: updated.id,
    action: "status_changed",
    metadata: {
      from: existing.caseRow.status,
      to: updated.status,
      statusReason: updated.statusReason,
      nextAction: updated.nextAction,
      outcome: updated.outcome,
      outcomeConfirmedBy: updated.outcomeConfirmedBy,
    },
  });

  if (input.userVisibleNote?.trim()) {
    await db.insert(caseNotes).values({
      caseId: updated.id,
      authorUserId: actor.userId,
      note: input.userVisibleNote.trim(),
      visibility: "user_visible",
    });
  }

  return updated;
}

/**
 * The person confirms (or disputes) that support actually reached them.
 * Only allowed after the organisation has recorded a delivery.
 */
export async function confirmCaseReceipt(
  input: ConfirmReceiptInput,
  userId: string,
): Promise<Case> {
  const existing = await getCaseForUser(input.caseId, userId);
  if (!existing) {
    throw new Error("Request not found");
  }
  if (!isAwaitingUserConfirmation(existing.caseRow)) {
    throw new Error("This request is not waiting for your confirmation.");
  }

  const from = existing.caseRow.status as CaseStatus;
  const to = statusAfterReceipt(input.answer, from);
  const now = new Date();
  const note = input.note?.trim() || null;

  const db = getDb();
  const [updated] = await db
    .update(cases)
    .set({
      status: to,
      userConfirmation: input.answer,
      userConfirmationNote: note,
      userConfirmedAt: now,
      userSeenAt: now,
      updatedAt: now,
      closedAt: input.answer === "received" ? now : null,
    })
    .where(eq(cases.id, input.caseId))
    .returning();

  if (!updated) {
    throw new Error("Failed to record your confirmation");
  }

  await db.insert(auditEvents).values({
    actorUserId: userId,
    organizationId: updated.organizationId,
    entityType: "case",
    entityId: updated.id,
    action: "user_confirmed_receipt",
    metadata: { answer: input.answer, note, from, to },
  });

  return updated;
}

export async function markCaseSeenByUser(caseId: string, userId: string) {
  const view = await getCaseForUser(caseId, userId);
  if (!view) return;
  await getDb()
    .update(cases)
    .set({ userSeenAt: new Date() })
    .where(eq(cases.id, caseId));
}

export async function countCasesNeedingUserAttention(
  userId: string,
): Promise<number> {
  const rows = await listCasesForUser(userId);
  return rows.filter((row) => needsUserAttention(row.caseRow)).length;
}

export async function listUserVisibleNotes(caseId: string) {
  const db = getDb();
  return db
    .select()
    .from(caseNotes)
    .where(
      and(
        eq(caseNotes.caseId, caseId),
        eq(caseNotes.visibility, "user_visible"),
      ),
    )
    .orderBy(desc(caseNotes.createdAt));
}

export async function listAuditForCase(caseId: string) {
  const db = getDb();
  return db
    .select()
    .from(auditEvents)
    .where(
      and(eq(auditEvents.entityType, "case"), eq(auditEvents.entityId, caseId)),
    )
    .orderBy(desc(auditEvents.createdAt));
}

/**
 * Suggest alternative published programmes when a case is declined/stalled.
 */
export async function suggestAlternativeProgrammes(
  caseId: string,
): Promise<PublicProgramme[]> {
  const view = await getCaseById(caseId);
  if (!view) {
    return [];
  }

  const intake = await getDb()
    .select()
    .from(intakes)
    .where(eq(intakes.id, view.caseRow.intakeId))
    .limit(1);

  const intakeRow = intake[0];
  if (!intakeRow) {
    return [];
  }

  return matchPublishedProgrammes({
    region: intakeRow.region,
    categoryId: intakeRow.categoryId ?? undefined,
    categorySlug: intakeRow.supportCategorySlug,
    excludeProgramIds: [view.caseRow.assistanceProgramId],
  });
}

export function isCaseOverdue(caseRow: Case, overdueDays = 7): boolean {
  if (caseRow.closedAt) {
    return false;
  }
  if (caseRow.followUpDueAt) {
    return caseRow.followUpDueAt.getTime() < Date.now();
  }
  const ageMs = Date.now() - caseRow.updatedAt.getTime();
  return ageMs > overdueDays * 24 * 60 * 60 * 1000;
}
