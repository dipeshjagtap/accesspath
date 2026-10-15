import { describe, expect, it } from "vitest";

import { AuthError } from "@/modules/auth/permissions";

describe("AuthError", () => {
  it("distinguishes unauthenticated from forbidden", () => {
    const unauth = new AuthError("sign in", "unauthenticated");
    const forbidden = new AuthError("no access", "forbidden");
    expect(unauth.code).toBe("unauthenticated");
    expect(forbidden.code).toBe("forbidden");
  });
});
