import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  auditEvents,
  cases,
  intakes,
  organizations,
  type Case,
} from "@/lib/db/schema";
import {
  caseStatusValues,
  type UpdateCaseStatusInput,
} from "@/modules/cases/types";

export type PartnerCaseView = {
  caseRow: Case;
  intakeRegion: string;
  intakeSummary: string | null;
  organizationName: string;
};

export async function listCasesForOrganization(
  organizationId: string,
): Promise<PartnerCaseView[]> {
  const db = getDb();
  const rows = await db
    .select({
      caseRow: cases,
      intakeRegion: intakes.region,
      intakeSummary: intakes.confirmedSummary,
      organizationName: organizations.name,
    })
    .from(cases)
    .innerJoin(intakes, eq(cases.intakeId, intakes.id))
    .innerJoin(organizations, eq(cases.organizationId, organizations.id))
    .where(eq(cases.organizationId, organizationId))
    .orderBy(desc(cases.updatedAt));

  return rows;
}

export async function getCaseForOrganization(
  caseId: string,
  organizationId: string,
): Promise<PartnerCaseView | null> {
  const db = getDb();
  const rows = await db
    .select({
      caseRow: cases,
      intakeRegion: intakes.region,
      intakeSummary: intakes.confirmedSummary,
      organizationName: organizations.name,
    })
    .from(cases)
    .innerJoin(intakes, eq(cases.intakeId, intakes.id))
    .innerJoin(organizations, eq(cases.organizationId, organizations.id))
    .where(and(eq(cases.id, caseId), eq(cases.organizationId, organizationId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateCaseStatus(
  input: UpdateCaseStatusInput,
  actor: { organizationId: string; userId?: string },
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

  const closed =
    input.status === "closed_completed" ||
    input.status === "closed_not_completed";

  const db = getDb();
  const [updated] = await db
    .update(cases)
    .set({
      status: input.status,
      nextAction: input.nextAction ?? existing.caseRow.nextAction,
      outcome: input.outcome ?? existing.caseRow.outcome,
      updatedAt: new Date(),
      closedAt: closed ? new Date() : null,
    })
    .where(eq(cases.id, input.caseId))
    .returning();

  if (!updated) {
    throw new Error("Failed to update case");
  }

  await db.insert(auditEvents).values({
    actorUserId: actor.userId ?? null,
    organizationId: actor.organizationId,
    entityType: "case",
    entityId: updated.id,
    action: "status_changed",
    metadata: {
      from: existing.caseRow.status,
      to: updated.status,
      nextAction: updated.nextAction,
      outcome: updated.outcome,
    },
  });

  return updated;
}
