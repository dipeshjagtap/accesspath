"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getEnv } from "@/lib/env";
import { PARTNER_COOKIE } from "@/lib/partner-auth";

export type PartnerLoginState = {
  ok: boolean;
  message?: string;
};

export async function partnerLoginAction(
  _prev: PartnerLoginState,
  formData: FormData,
): Promise<PartnerLoginState> {
  const { DEMO_PARTNER_ACCESS_TOKEN } = getEnv();
  const token = String(formData.get("token") || "");

  if (!DEMO_PARTNER_ACCESS_TOKEN) {
    redirect("/partner");
  }

  if (token !== DEMO_PARTNER_ACCESS_TOKEN) {
    return { ok: false, message: "Invalid partner demo token." };
  }

  const jar = await cookies();
  jar.set(PARTNER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  redirect("/partner");
}
