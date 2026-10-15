"use server";

import { revalidatePath } from "next/cache";

import { updateChecklistItemStatus } from "@/modules/plans/service";

export async function setChecklistStatusAction(formData: FormData) {
  const itemId = String(formData.get("itemId") || "");
  const status = String(formData.get("status") || "");
  const intakeId = String(formData.get("intakeId") || "");

  if (
    !itemId ||
    !["not_started", "in_progress", "completed", "blocked"].includes(status)
  ) {
    throw new Error("Invalid checklist update");
  }

  await updateChecklistItemStatus(
    itemId,
    status as "not_started" | "in_progress" | "completed" | "blocked",
  );

  if (intakeId) {
    revalidatePath(`/plan/${intakeId}`);
  }
}
