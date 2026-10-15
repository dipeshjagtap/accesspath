import { redirect } from "next/navigation";

export default async function PartnerCaseRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/org/cases/${id}`);
}
