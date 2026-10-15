import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAnyOrgMember } from "@/modules/auth/permissions";
import { listProgrammesForOrganization } from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Programmes",
};

export default async function OrgProgrammesPage() {
  let membership;
  try {
    membership = await requireAnyOrgMember(["org_admin", "caseworker", "viewer"]);
  } catch {
    redirect("/login");
  }

  const programmes = await listProgrammesForOrganization(
    membership.organization.id,
  );

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Programmes</h1>
          <p className="text-muted-foreground">
            Only published programmes from verified organisations can receive
            live requests.
          </p>
        </div>
        {membership.memberRole === "org_admin" ? (
          <Button asChild>
            <Link href="/org/programmes/new">New programme</Link>
          </Button>
        ) : null}
      </header>

      <ul className="space-y-3">
        {programmes.map((programme) => (
          <li key={programme.id}>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">{programme.name}</CardTitle>
                  <Badge variant="outline">{programme.categoryName}</Badge>
                  {programme.publishedAt ? (
                    <Badge>Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </div>
                <CardDescription>
                  {programme.availabilityStatus.replaceAll("_", " ")} · listing{" "}
                  {programme.verificationStatus.replaceAll("_", " ")}
                </CardDescription>
              </CardHeader>
            </Card>
          </li>
        ))}
      </ul>

      <Button asChild variant="outline">
        <Link href="/org">Back</Link>
      </Button>
    </main>
  );
}
