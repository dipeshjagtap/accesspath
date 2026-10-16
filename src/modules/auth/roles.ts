export type PlatformRole = "user" | "admin";
export type OrgMemberRole = "org_admin" | "caseworker" | "viewer";

export const ORG_MEMBER_ROLES: readonly OrgMemberRole[] = [
  "org_admin",
  "caseworker",
  "viewer",
];

export const ORG_ROLE_LABELS: Record<OrgMemberRole, string> = {
  org_admin: "Organisation admin",
  caseworker: "Caseworker",
  viewer: "Viewer",
};

export type RoleLabel = {
  label: string;
  organizationName?: string;
};

/**
 * Every role a user holds: platform admin first, then one entry per
 * organisation membership. Users with neither are "Individual".
 */
export function describeRoles(
  platformRole: PlatformRole,
  memberships: Array<{ memberRole: OrgMemberRole; organizationName: string }>,
): RoleLabel[] {
  const labels: RoleLabel[] = [];
  if (platformRole === "admin") {
    labels.push({ label: "Platform admin" });
  }
  for (const m of memberships) {
    labels.push({
      label: ORG_ROLE_LABELS[m.memberRole],
      organizationName: m.organizationName,
    });
  }
  if (labels.length === 0) {
    labels.push({ label: "Individual" });
  }
  return labels;
}
