import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { intakes, type Intake } from "@/lib/db/schema";
import type { IntakeInput } from "@/modules/intakes/types";
import { getCategoryBySlug } from "@/modules/programmes/repository";

export function buildNeedsSummaryDraft(
  input: IntakeInput,
  categoryName: string,
): string {
  const who =
    input.askingFor === "someone_else"
      ? "helping another person"
      : "asking for themselves";
  const name = input.displayName?.trim()
    ? `${input.displayName.trim()} is `
    : "The person is ";
  const budget = input.budgetConstraint?.trim()
    ? ` Budget/affordability note: ${input.budgetConstraint.trim()}.`
    : "";
  const travel = input.travelRange?.trim()
    ? ` Preferred travel range: ${input.travelRange.trim()}.`
    : "";
  const professional = input.professionalRecommendationStatus
    ? ` Professional recommendation status: ${input.professionalRecommendationStatus.replaceAll("_", " ")}.`
    : "";
  const access = input.accessNeeds?.trim()
    ? ` Access needs when contacting providers: ${input.accessNeeds.trim()}.`
    : "";

  return (
    `${name}${who}. Exploring ${categoryName.toLowerCase()} support in ${input.region}. ` +
    `Practical needs (in their words): ${input.practicalNeeds.trim()}.` +
    `${travel}${budget}${professional}${access} ` +
    `AccessPath does not diagnose conditions, prescribe treatment, or guarantee eligibility.`
  );
}

export async function createIntake(
  input: IntakeInput,
  userId?: string | null,
): Promise<Intake> {
  const category = await getCategoryBySlug(input.supportCategorySlug);
  if (!category) {
    throw new Error("Unknown support category");
  }

  const db = getDb();
  const draft = buildNeedsSummaryDraft(input, category.name);

  const [row] = await db
    .insert(intakes)
    .values({
      userId: userId ?? null,
      categoryId: category.id,
      supportCategorySlug: category.slug,
      region: input.region,
      practicalNeeds: input.practicalNeeds,
      budgetConstraint: input.budgetConstraint || null,
      professionalRecommendationStatus:
        input.professionalRecommendationStatus ?? null,
      askingFor: input.askingFor,
      preferredContactMethod: input.preferredContactMethod || null,
      accessNeeds: input.accessNeeds || null,
      confirmedSummary: draft,
      sessionKey: crypto.randomUUID(),
    })
    .returning();

  if (!row) {
    throw new Error("Failed to create intake");
  }
  return row;
}

export async function getIntakeById(id: string): Promise<Intake | null> {
  const db = getDb();
  const rows = await db.select().from(intakes).where(eq(intakes.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function updateConfirmedSummary(
  intakeId: string,
  confirmedSummary: string,
): Promise<Intake> {
  const db = getDb();
  const [row] = await db
    .update(intakes)
    .set({ confirmedSummary })
    .where(eq(intakes.id, intakeId))
    .returning();

  if (!row) {
    throw new Error("Intake not found");
  }
  return row;
}

export async function listIntakesForUser(userId: string): Promise<Intake[]> {
  const db = getDb();
  return db.select().from(intakes).where(eq(intakes.userId, userId));
}
