"use server";

import { redirect } from "next/navigation";

import {
  createIntake,
  updateConfirmedSummary,
} from "@/modules/intakes/service";
import {
  confirmedSummarySchema,
  intakeInputSchema,
} from "@/modules/intakes/types";
import { generatePlanForIntake } from "@/modules/plans/service";

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitIntakeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    displayName: emptyToUndefined(formData.get("displayName")),
    askingFor: String(formData.get("askingFor") || "self"),
    region: String(formData.get("region") || ""),
    travelRange: emptyToUndefined(formData.get("travelRange")),
    practicalNeeds: String(formData.get("practicalNeeds") || ""),
    supportCategory: "mobility_aid" as const,
    budgetConstraint: emptyToUndefined(formData.get("budgetConstraint")),
    preferredLanguage: String(formData.get("preferredLanguage") || "en"),
    preferredContactMethod: emptyToUndefined(
      formData.get("preferredContactMethod"),
    ),
    professionalRecommendationStatus: emptyToUndefined(
      formData.get("professionalRecommendationStatus"),
    ),
    accessNeeds: emptyToUndefined(formData.get("accessNeeds")),
  };

  const parsed = intakeInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const intake = await createIntake(parsed.data);
  redirect(`/intake/${intake.id}/review`);
}

export async function confirmSummaryAndGeneratePlanAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = confirmedSummarySchema.safeParse({
    intakeId: String(formData.get("intakeId") || ""),
    confirmedSummary: String(formData.get("confirmedSummary") || ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please edit the summary so it is clear and complete.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  await updateConfirmedSummary(
    parsed.data.intakeId,
    parsed.data.confirmedSummary,
  );
  await generatePlanForIntake(parsed.data.intakeId);
  redirect(`/plan/${parsed.data.intakeId}`);
}

function emptyToUndefined(value: FormDataEntryValue | null) {
  if (value == null) return undefined;
  const text = String(value).trim();
  return text.length > 0 ? text : undefined;
}
