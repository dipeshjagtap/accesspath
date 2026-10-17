"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/modules/auth/session";
import { confirmReceiptSchema } from "@/modules/cases/receipt";
import { confirmCaseReceipt } from "@/modules/cases/service";

export type ReceiptActionState = {
  ok: boolean;
  message?: string;
};

export async function confirmReceiptAction(
  _prev: ReceiptActionState,
  formData: FormData,
): Promise<ReceiptActionState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const note = String(formData.get("note") || "").trim();
  const parsed = confirmReceiptSchema.safeParse({
    caseId: String(formData.get("caseId") || ""),
    answer: String(formData.get("answer") || ""),
    note: note || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Please choose one answer." };
  }
  if (parsed.data.answer !== "received" && !parsed.data.note) {
    return {
      ok: false,
      message: "Please tell the organisation briefly what is missing.",
    };
  }

  try {
    await confirmCaseReceipt(parsed.data, user.id);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save",
    };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/cases/${parsed.data.caseId}`);
}
