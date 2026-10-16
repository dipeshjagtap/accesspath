import { ClipboardList, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { heroPrimaryAction, PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAnyOrgMember } from "@/modules/auth/permissions";
import { listProgrammesForOrganization } from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage your support programmes",
};

export default async function OrgProgrammesPage() {
  let membership;
  try {
    membership = await requireAnyOrgMember([
      "org_admin",
      "caseworker",
      "viewer",
    ]);
  } catch {
    redirect("/login");
  }

  const programmes = await listProgrammesForOrganization(
    membership.organization.id,
  );

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="Organisation workspace"
        icon={ClipboardList}
        title="Programmes"
        description="Only published programmes from verified organisations can receive live requests."
        actions={
          membership.memberRole === "org_admin" ? (
            <Link href="/org/programmes/new" className={heroPrimaryAction}>
              <Plus className="size-4" aria-hidden="true" />
              New programme
            </Link>
          ) : undefined
        }
      />
      <div className="section-x w-full flex-1 space-y-8 py-10">
        <ul className="space-y-3">
          {programmes.map((programme) => (
            <li key={programme.id}>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">
                      {programme.name}
                    </CardTitle>
                    <Badge variant="outline">{programme.categoryName}</Badge>
                    {programme.publishedAt ? (
                      <Badge>Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                  <CardDescription>
                    {programme.availabilityStatus.replaceAll("_", " ")} ·
                    listing {programme.verificationStatus.replaceAll("_", " ")}
                  </CardDescription>
                </CardHeader>
                {membership.memberRole === "org_admin" ? (
                  <CardContent>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/org/programmes/${programme.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </CardContent>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>

        <Button asChild variant="outline">
          <Link href="/org">Back</Link>
        </Button>
      </div>
    </main>
  );
}
