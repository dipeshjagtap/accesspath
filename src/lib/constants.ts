/** Seeded demo region — exact string must match programme.regions in seed data. */
export const DEMO_REGION = "Pune, Maharashtra (demo)";

export const DEMO_REGION_OPTIONS = [
  {
    value: DEMO_REGION,
    label: "Pune, Maharashtra (demo — has verified programmes)",
  },
  {
    value: "Other region (demo — no curated match)",
    label: "Other region (demo — no curated match)",
  },
] as const;

/** Demo account passwords — fictional; documented for local/hackathon demos only. */
export const DEMO_PASSWORDS = {
  user: "DemoUser123!",
  orgAdmin: "DemoOrgAdmin123!",
  caseworker: "DemoCaseworker123!",
  admin: "DemoAdmin123!",
} as const;
