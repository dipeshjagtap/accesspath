import type { GroundedPlanRequest } from "@/modules/ai/types";

export const SYSTEM_PROMPT = `You are AccessPath, a multi-category support navigation assistant for India. You do not diagnose medical conditions, prescribe treatment or devices, or determine final eligibility for assistance programmes. Use only the supplied user-confirmed details and curated database programme/resource records for factual claims about organisations, programmes, costs, availability, and requirements. Never invent an organisation, programme, URL, registration status, eligibility rule, price, or document requirement. If information is missing or stale, clearly say so and suggest confirming with the organisation. Provide practical, respectful, accessible next steps. Distinguish user-reported information from verified facts. Do not share information with an organisation or initiate an external action. Return the requested structured JSON only.`;

export const PLAN_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    needs_summary: { type: "string" },
    suggested_next_steps: {
      type: "array",
      items: { type: "string" },
    },
    resource_ids: {
      type: "array",
      items: { type: "string" },
    },
    questions_for_provider: {
      type: "array",
      items: { type: "string" },
    },
    unknowns: {
      type: "array",
      items: { type: "string" },
    },
    safety_note: { type: "string" },
    source_ids: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "needs_summary",
    "suggested_next_steps",
    "resource_ids",
    "questions_for_provider",
    "unknowns",
    "safety_note",
    "source_ids",
  ],
} as const;

export function buildUserPrompt(request: GroundedPlanRequest): string {
  const resources = request.resources.map((resource) => ({
    id: resource.id,
    name: resource.name,
    resource_type: resource.resourceType,
    region: resource.region,
    description: resource.description,
    access_notes: resource.accessNotes,
    official_url: resource.officialUrl,
    verification_status: resource.verificationStatus,
    last_verified_at: resource.lastVerifiedAt,
    categories: resource.categories,
    is_fictional_demo: resource.isFictionalDemo,
  }));

  const programs = request.programs.map((program) => ({
    id: program.id,
    name: program.name,
    purpose: program.purpose,
    regions: program.regions,
    verified_requirements: program.verifiedRequirements,
    application_route: program.applicationRoute,
    official_url: program.officialUrl,
    verification_status: program.verificationStatus,
    eligibility_disclaimer: program.eligibilityDisclaimer,
    is_fictional_demo: program.isFictionalDemo,
  }));

  return [
    "Create a grounded navigation plan.",
    "",
    "Confirmed user summary:",
    request.confirmedSummary,
    "",
    `Region filter: ${request.region}`,
    "",
    "Allowed curated resources (JSON). You may only reference these IDs in resource_ids/source_ids:",
    JSON.stringify(resources, null, 2),
    "",
    "Allowed curated assistance programs (JSON). You may only reference these IDs in source_ids:",
    JSON.stringify(programs, null, 2),
    "",
    "Rules:",
    "- Only use resource and program IDs from the lists above.",
    "- If a list is empty, say no verified match is available.",
    "- Do not invent prices, eligibility decisions, or URLs.",
    "- Keep language plain and respectful.",
  ].join("\n");
}
