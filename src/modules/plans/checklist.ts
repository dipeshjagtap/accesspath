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
    title: "Ask whether a professional assessment is needed",
    description:
      "Before choosing a mobility aid, ask a qualified professional whether an assessment or fitting is required. AccessPath does not prescribe devices.",
    sourceResourceId: null,
    ownerType,
  });

  items.push({
    title: "Confirm availability, fitting, maintenance, and total cost",
    description:
      "Ask the provider or supplier directly. AccessPath does not store or invent prices.",
    sourceResourceId: null,
    ownerType,
  });

  for (const program of params.programs) {
    if (
      program.verificationStatus !== "verified" &&
      program.verificationStatus !== "needs_review"
    ) {
      continue;
    }
    const docs =
      program.verifiedRequirements.length > 0
        ? ` Verified document notes from the curated record: ${program.verifiedRequirements.join("; ")}.`
        : "";
    items.push({
      title: `Check official rules for ${program.name}`,
      description:
        `${program.eligibilityDisclaimer}${docs} Application route: ${program.applicationRoute ?? "See the official program source."}`,
      sourceResourceId: null,
      ownerType,
    });
  }

  if (params.plan.resource_ids.length === 0) {
    items.push({
      title: "No verified local match — contact an official source",
      description:
        "The curated dataset has no verified provider for this region. Ask a local disability-support organization or clinic for guidance, and treat any unverified listings with caution.",
      sourceResourceId: null,
      ownerType,
    });
  }

  return items;
}
