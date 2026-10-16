import { Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AddOrgMemberForm, OrgMemberRow } from "@/components/org-member-forms";
import { PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAnyOrgMember } from "@/modules/auth/permissions";
import { ORG_ROLE_LABELS } from "@/modules/auth/roles";
import { listOrgMembers } from "@/modules/organizations/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organisation members and roles",
};

export default async function OrgMembersPage() {
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

  const members = await listOrgMembers(membership.organization.id);
  const canManage = membership.memberRole === "org_admin";

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="Organisation workspace"
        icon={Users}
        title={`Members of ${membership.organization.name}`}
        description="Organisation admins manage programmes and members. Caseworkers handle incoming requests. Viewers have read-only access."
      />
      <div className="section-x w-full flex-1 space-y-8 py-10">
        {canManage ? (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Add a member</h2>
            <AddOrgMemberForm organizationId={membership.organization.id} />
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Members ({members.length})</h2>
          <ul className="space-y-3">
            {members.map(({ user, role, membershipId }) => (
              <li key={membershipId}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">
                        {user.displayName ?? user.email}
                      </CardTitle>
                      <Badge>{ORG_ROLE_LABELS[role]}</Badge>
                      {user.id === membership.user.id ? (
                        <Badge variant="outline">You</Badge>
                      ) : null}
                    </div>
                    <CardDescription>{user.email}</CardDescription>
                  </CardHeader>
                  {canManage ? (
                    <CardContent>
                      <OrgMemberRow
                        organizationId={membership.organization.id}
                        membershipId={membershipId}
                        currentRole={role}
                        isSelf={user.id === membership.user.id}
                      />
                    </CardContent>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <Button asChild variant="outline">
          <Link href="/org">Back to organisation</Link>
        </Button>
      </div>
    </main>
  );
}
