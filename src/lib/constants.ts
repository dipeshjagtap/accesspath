/** Seeded demo region — exact string must match resources.region in seed data. */
export const DEMO_REGION = "Pune, Maharashtra (demo)";

export const DEMO_REGION_OPTIONS = [
  {
    value: DEMO_REGION,
    label: "Pune, Maharashtra (demo — has verified resources)",
  },
  {
    value: "Other region (demo — no curated match)",
    label: "Other region (demo — no curated match)",
  },
] as const;

export const SUPPORT_CATEGORY_LABEL = "Mobility aid";
