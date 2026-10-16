import { describe, expect, it } from "vitest";

import { describeRoles } from "@/modules/auth/roles";

describe("describeRoles", () => {
  it("labels a plain account as an individual", () => {
    expect(describeRoles("user", [])).toEqual([{ label: "Individual" }]);
  });

  it("lists platform admin before organisation roles", () => {
    expect(
      describeRoles("admin", [
        { memberRole: "caseworker", organizationName: "Sahara" },
      ]),
    ).toEqual([
      { label: "Platform admin" },
      { label: "Caseworker", organizationName: "Sahara" },
    ]);
  });

  it("returns one label per organisation membership", () => {
    const labels = describeRoles("user", [
      { memberRole: "org_admin", organizationName: "Sahara" },
      { memberRole: "viewer", organizationName: "Nirmal" },
    ]);
    expect(labels.map((l) => l.label)).toEqual([
      "Organisation admin",
      "Viewer",
    ]);
  });
});
