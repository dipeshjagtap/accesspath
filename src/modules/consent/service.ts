import { and, desc, eq, isNull } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  auditEvents,
  cases,
  consentEvents,
  type Case,
  type ConsentEvent,
} from "@/lib/db/schema";
import type { ReferralConsentInput } from "@/modules/consent/types";
import { getIntakeById } from "@/modules/intakes/service";
import { getOrganizationById } from "@/modules/organizations/repository";

export type ConsentEventRow = ConsentEvent;

export async function createReferralWithConsent(
  input: ReferralConsentInput,
): Promise<{ consent: ConsentEvent; caseRow: Case }> {
  const intake = await getIntakeById(input.intakeId);
  if (!intake) {
    throw new Error("Intake not found");
  }

  const organization = await getOrganizationById(input.organizationId);
  if (!organization) {
    throw new Error("Organization not found");
  }

  const db = getDb();

  const existing = await db
    .select()
    .from(consentEvents)
    .where(
      and(
        eq(consentEvents.intakeId, input.intakeId),
        eq(consentEvents.organizationId, input.organizationId),
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
          eq(cases.organizationId, input.organizationId),
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
      organizationId: input.organizationId,
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
      intakeId: input.intakeId,
      organizationId: input.organizationId,
      status: "new",
      nextAction: "Review referral and contact the person if permitted",
    })
    .returning();

  if (!caseRow) {
    throw new Error("Failed to create case");
  }

  await db.insert(auditEvents).values([
    {
      organizationId: input.organizationId,
      entityType: "consent_event",
      entityId: consent.id,
      action: "consent_granted",
      metadata: {
        purpose: input.purpose,
        fieldsShared: input.fieldsShared,
        consentVersion: input.consentVersion,
      },
    },
    {
      organizationId: input.organizationId,
      entityType: "case",
      entityId: caseRow.id,
      action: "case_created",
      metadata: {
        intakeId: input.intakeId,
        fromConsentId: consent.id,
      },
    },
  ]);

  return { consent, caseRow };
}

export async function getActiveConsentForIntake(
  intakeId: string,
): Promise<ConsentEvent | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(consentEvents)
    .where(
      and(eq(consentEvents.intakeId, intakeId), isNull(consentEvents.withdrawnAt)),
    )
    .orderBy(desc(consentEvents.consentedAt))
    .limit(1);
  return rows[0] ?? null;
}
