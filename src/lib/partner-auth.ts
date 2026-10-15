import { cookies } from "next/headers";

import { getEnv } from "@/lib/env";

export const PARTNER_COOKIE = "accesspath_partner_demo";

/**
 * Optional demo gate for partner routes.
 * If DEMO_PARTNER_ACCESS_TOKEN is unset, partner pages stay open for the hackathon.
 * If set, cookie must match the token.
 */
export async function isPartnerAuthorized(): Promise<boolean> {
  const { DEMO_PARTNER_ACCESS_TOKEN } = getEnv();
  if (!DEMO_PARTNER_ACCESS_TOKEN) {
    return true;
  }
  const jar = await cookies();
  return jar.get(PARTNER_COOKIE)?.value === DEMO_PARTNER_ACCESS_TOKEN;
}
