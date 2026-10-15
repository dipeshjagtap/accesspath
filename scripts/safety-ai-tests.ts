/**
 * Lightweight AI safety checks for grounded planning (PRD §10).
 * Uses deterministic fallback path so tests run without ADC.
 */
import { config } from "dotenv";

config({ path: ".env.local" });

import { buildDeterministicFallbackPlan } from "../src/modules/ai/client";
import { navigationPlanSchema } from "../src/modules/plans/types";
import type {
  PublicAssistanceProgram,
  PublicResource,
} from "../src/modules/resources/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const verifiedResource: PublicResource = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Demo Clinic",
  resourceType: "rehabilitation_service",
  description: "Fictional clinic",
  region: "Pune, Maharashtra (demo)",
  categories: ["mobility_aid"],
  publicContactDetails: "demo",
  officialUrl: "https://example.com/demo",
  accessNotes: "Ask about assessment",
  verificationStatus: "verified",
  lastVerifiedAt: new Date(),
  sourceNotes: "demo",
  accessibilityInfo: null,
  sponsorshipDisclosure: null,
  isFictionalDemo: "true",
};

const expiredResource: PublicResource = {
  ...verifiedResource,
  id: "22222222-2222-2222-2222-222222222222",
  name: "Expired Demo",
  verificationStatus: "expired",
};

const program: PublicAssistanceProgram = {
  id: "33333333-3333-3333-3333-333333333333",
  name: "Demo Scheme",
  officialUrl: "https://example.com/scheme",
  regions: ["Pune, Maharashtra (demo)"],
  purpose: "Demo purpose",
  verifiedRequirements: ["Proof of residence (demo)"],
  applicationRoute: "Official channel only",
  verificationStatus: "verified",
  lastVerifiedAt: new Date(),
  sourceNotes: "demo",
  eligibilityDisclaimer:
    "Potentially relevant — confirm eligibility with the official program.",
  isFictionalDemo: "true",
};

function testEmptyRegion() {
  const plan = buildDeterministicFallbackPlan({
    confirmedSummary: "Need mobility help",
    region: "Nowhere",
    resources: [],
    programs: [],
  });
  const parsed = navigationPlanSchema.parse(plan);
  assert(parsed.resource_ids.length === 0, "empty region should have no resources");
  assert(
    parsed.unknowns.some((item) => item.toLowerCase().includes("no verified")),
    "should surface no-match unknown",
  );
}

function testIgnoresExpired() {
  const plan = buildDeterministicFallbackPlan({
    confirmedSummary: "Need mobility help",
    region: "Pune, Maharashtra (demo)",
    resources: [verifiedResource, expiredResource],
    programs: [program],
  });
  assert(
    plan.resource_ids.includes(verifiedResource.id),
    "verified resource should be included",
  );
  assert(
    !plan.resource_ids.includes(expiredResource.id),
    "expired resource must not be recommended",
  );
  assert(plan.safety_note.toLowerCase().includes("does not diagnose"), "safety note");
}

function testNoInventedIds() {
  const plan = buildDeterministicFallbackPlan({
    confirmedSummary: "Need mobility help",
    region: "Pune, Maharashtra (demo)",
    resources: [verifiedResource],
    programs: [program],
  });
  for (const id of plan.resource_ids) {
    assert(id === verifiedResource.id, "resource id must be curated");
  }
  for (const id of plan.source_ids) {
    assert(
      id === verifiedResource.id || id === program.id,
      "source id must be curated",
    );
  }
}

testEmptyRegion();
testIgnoresExpired();
testNoInventedIds();
console.log(JSON.stringify({ ok: true, tests: 3 }, null, 2));
