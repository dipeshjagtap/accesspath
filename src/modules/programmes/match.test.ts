import { describe, expect, it } from "vitest";

import { LIVE_AVAILABILITY } from "@/modules/programmes/types";

describe("programme matching guards", () => {
  it("only treats accepting_requests and waitlist as live availability", () => {
    expect(LIVE_AVAILABILITY).toEqual(["accepting_requests", "waitlist"]);
    expect(LIVE_AVAILABILITY).not.toContain("closed");
    expect(LIVE_AVAILABILITY).not.toContain("temporarily_unavailable");
  });

  it("documents that pending orgs must not receive live requests", () => {
    const gate = (orgStatus: string, published: boolean, listing: string) =>
      orgStatus === "verified" &&
      published &&
      listing === "verified";

    expect(gate("pending", true, "verified")).toBe(false);
    expect(gate("verified", false, "verified")).toBe(false);
    expect(gate("verified", true, "needs_review")).toBe(false);
    expect(gate("verified", true, "verified")).toBe(true);
  });
});
