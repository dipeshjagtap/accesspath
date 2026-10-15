import { describe, expect, it } from "vitest";

import {
  assertTransition,
  canTransition,
  CASE_TRANSITIONS,
} from "@/modules/cases/transitions";

describe("case status transitions", () => {
  it("allows submitted → under_review and declined", () => {
    expect(canTransition("submitted", "under_review")).toBe(true);
    expect(canTransition("submitted", "declined")).toBe(true);
  });

  it("does not treat submitted as accepted or delivered", () => {
    expect(canTransition("submitted", "accepted")).toBe(false);
    expect(canTransition("submitted", "assistance_delivered")).toBe(false);
  });

  it("does not allow accepted → assistance_delivered in one hop", () => {
    expect(canTransition("accepted", "assistance_delivered")).toBe(false);
    expect(canTransition("accepted", "in_progress")).toBe(true);
    expect(canTransition("in_progress", "assistance_delivered")).toBe(true);
  });

  it("throws on invalid transitions", () => {
    expect(() => assertTransition("closed", "submitted")).toThrow(
      /Invalid case status transition/,
    );
  });

  it("defines a transition map for every status", () => {
    const statuses = Object.keys(CASE_TRANSITIONS);
    expect(statuses.length).toBeGreaterThanOrEqual(12);
  });
});
