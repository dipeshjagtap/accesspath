import type { NavigationPlan } from "@/modules/plans/types";
import type {
  PublicAssistanceProgram,
  PublicResource,
} from "@/modules/resources/types";

export type ChecklistDraftItem = {
  title: string;
  description: string;
  sourceResourceId: string | null;
  ownerType: "user" | "caregiver" | "caseworker";
};

/**
 * Deterministic checklist from curated resources + plan steps.
 * Never invents providers, prices, or eligibility rules.
 */
export function buildDeterministicChecklist(params: {
  plan: NavigationPlan;
  resources: PublicResource[];
  programs: PublicAssistanceProgram[];
  askingFor?: string | null;
}): ChecklistDraftItem[] {
  const ownerType: ChecklistDraftItem["ownerType"] =
    params.askingFor === "someone_else" ? "caregiver" : "user";

  const items: ChecklistDraftItem[] = [];
  const byId = new Map(params.resources.map((r) => [r.id, r]));

  items.push({
    title: "Review your confirmed needs summary",
    description:
      "Make sure the summary still matches what you want help with before contacting anyone.",
    sourceResourceId: null,
    ownerType,
  });

  for (const id of params.plan.resource_ids) {
    const resource = byId.get(id);
    if (!resource || resource.verificationStatus !== "verified") continue;
    items.push({
      title: `Contact ${resource.name}`,
      description:
        resource.accessNotes?.trim() ||
        `Use the verified contact details for this ${resource.resourceType.replaceAll("_", " ")}. Confirm hours and what to bring.`,
      sourceResourceId: resource.id,
      ownerType,
    });
  }

  items.push({
    title: "Ask the organisation to confirm current eligibility and availability",
    description:
      "AccessPath does not decide eligibility or guarantee service. Confirm details with the organisation before relying on them.",
    sourceResourceId: null,
    ownerType,
  });

  for (const program of params.programs) {
    if (program.verificationStatus !== "verified") {
      continue;
    }
    const docs =
      program.requiredDocuments.length > 0
        ? ` Documents noted in the curated record: ${program.requiredDocuments.join("; ")}.`
        : program.verifiedRequirements.length > 0
          ? ` Verified notes from the curated record: ${program.verifiedRequirements.join("; ")}.`
          : "";
    items.push({
      title: `Review programme: ${program.name}`,
      description:
        `${program.eligibilityDisclaimer}${docs} Availability in catalogue: ${program.availabilityStatus.replaceAll("_", " ")}.`,
      sourceResourceId: null,
      ownerType,
    });
  }

  if (params.programs.length === 0 && params.resources.length === 0) {
    items.push({
      title: "No verified match found in this demo region",
      description:
        "AccessPath will not invent organisations or programmes. Try another category/region, or check back when more verified listings are published.",
      sourceResourceId: null,
      ownerType,
    });
  }

  return items;
}
