import { redirect } from "next/navigation";

/** Legacy partner routes redirect to organisation workspace. */
export default function PartnerRedirectPage() {
  redirect("/org");
}
