import { and, desc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  auditEvents,
  cases,
  consentEvents,
  type Case,
  type ConsentEvent,
} from "@/lib/db/schema";
import { generateCaseReference } from "@/modules/cases/types";
import type { ReferralConsentInput } from "@/modules/consent/types";
import { getIntakeById } from "@/modules/intakes/service";
import { canReceiveLiveRequests } from "@/modules/programmes/repository";
import { getOrganizationById } from "@/modules/organizations/repository";

export type ConsentEventRow = ConsentEvent;

export async function createReferralWithConsent(
  input: ReferralConsentInput,
  actorUserId?: string | null,
): Promise<{ consent: ConsentEvent; caseRow: Case }> {
  const intake = await getIntakeById(input.intakeId);
  if (!intake) {
    throw new Error("Intake not found");
  }

  if (actorUserId && intake.userId && intake.userId !== actorUserId) {
    throw new Error("You can only submit requests for your own intakes");
  }

  const organization = await getOrganizationById(input.organizationId);
  if (!organization) {
    throw new Error("Organization not found");
  }

  const gate = await canReceiveLiveRequests(
    input.organizationId,
    input.assistanceProgramId,
  );
  if (!gate.ok) {
    throw new Error(gate.reason ?? "Organisation cannot receive requests");
  }

  const db = getDb();

  const existing = await db
    .select()
    .from(consentEvents)
    .where(
      and(
        eq(consentEvents.intakeId, input.intakeId),
        eq(consentEvents.assistanceProgramId, input.assistanceProgramId),
        isNull(consentEvents.withdrawnAt),
      ),
    )
    .limit(1);

  if (existing[0]) {
    const existingCase = await db
      .select()
      .from(cases)
      .where(
        and(
          eq(cases.intakeId, input.intakeId),
          eq(cases.assistanceProgramId, input.assistanceProgramId),
        ),
      )
      .orderBy(desc(cases.createdAt))
      .limit(1);
    if (existingCase[0]) {
      return { consent: existing[0], caseRow: existingCase[0] };
    }
  }

  const [consent] = await db
    .insert(consentEvents)
    .values({
      intakeId: input.intakeId,
      userId: actorUserId ?? intake.userId ?? null,
      organizationId: input.organizationId,
      assistanceProgramId: input.assistanceProgramId,
      purpose: input.purpose,
      fieldsShared: input.fieldsShared,
      consentVersion: input.consentVersion,
    })
    .returning();

  if (!consent) {
    throw new Error("Failed to record consent");
  }

  const [caseRow] = await db
    .insert(cases)
    .values({
      caseReference: generateCaseReference(),
      intakeId: input.intakeId,
      assistanceProgramId: input.assistanceProgramId,
      organizationId: input.organizationId,
      parentCaseId: input.parentCaseId ?? null,
      status: "submitted",
      nextAction: "Review request and contact the person if permitted",
      followUpDueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })
    .returning();

  if (!caseRow) {
    throw new Error("Failed to create case");
  }

  await db
    .update(consentEvents)
    .set({ caseId: caseRow.id })
    .where(eq(consentEvents.id, consent.id));

  await db.insert(auditEvents).values([
    {
      actorUserId: actorUserId ?? null,
      organizationId: input.organizationId,
      entityType: "consent_event",
      entityId: consent.id,
      action: input.parentCaseId
        ? "alternative_consent_granted"
        : "consent_granted",
      metadata: {
        purpose: input.purpose,
        fieldsShared: input.fieldsShared,
        consentVersion: input.consentVersion,
        assistanceProgramId: input.assistanceProgramId,
        parentCaseId: input.parentCaseId ?? null,
      },
    },
    {
      actorUserId: actorUserId ?? null,
      organizationId: input.organizationId,
      entityType: "case",
      entityId: caseRow.id,
      action: input.parentCaseId ? "alternative_case_created" : "case_created",
      metadata: {
        intakeId: input.intakeId,
        fromConsentId: consent.id,
        assistanceProgramId: input.assistanceProgramId,
        parentCaseId: input.parentCaseId ?? null,
        caseReference: caseRow.caseReference,
      },
    },
  ]);

  return { consent, caseRow };
}

export async function getConsentForCase(
  caseId: string,
): Promise<ConsentEvent | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(consentEvents)
    .where(eq(consentEvents.caseId, caseId))
    .orderBy(desc(consentEvents.consentedAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getActiveConsentForIntake(
  intakeId: string,
): Promise<ConsentEvent | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(consentEvents)
    .where(
      and(
        eq(consentEvents.intakeId, intakeId),
        isNull(consentEvents.withdrawnAt),
      ),
    )
    .orderBy(desc(consentEvents.consentedAt))
    .limit(1);
  return rows[0] ?? null;
}
