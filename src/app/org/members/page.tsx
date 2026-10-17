import { ArrowLeft, Mail, Shield, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AddOrgMemberForm, OrgMemberRow } from "@/components/org-member-forms";
import { heroSecondaryAction, PageHero } from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { requireAnyOrgMember } from "@/modules/auth/permissions";
import { ORG_ROLE_LABELS } from "@/modules/auth/roles";
import { listOrgMembers } from "@/modules/organizations/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organisation members and roles",
};

const ROLE_HINT: Record<string, string> = {
  org_admin: "Manages programmes, members and cases",
  caseworker: "Handles incoming support requests",
  viewer: "Read-only access to the organisation workspace",
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
        title="Team members"
        description={`${membership.organization.name} · ${members.length} ${members.length === 1 ? "person" : "people"} with access.`}
        actions={
          <Link href="/org" className={heroSecondaryAction}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to organisation
          </Link>
        }
      />

      <div className="section-x py-10">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-8">
            {canManage ? (
              <AddOrgMemberForm organizationId={membership.organization.id} />
            ) : null}

            <section aria-labelledby="members-heading" className="space-y-4">
              <h2
                id="members-heading"
                className="font-display text-xl font-semibold"
              >
                People on this team ({members.length})
              </h2>
              <ul className="grid gap-3">
                {members.map(({ user, role, membershipId }) => {
                  const isSelf = user.id === membership.user.id;
                  return (
                    <li
                      key={membershipId}
                      className="border-border bg-card rounded-2xl border p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-brand-dark text-base font-semibold">
                              {user.displayName ?? user.email}
                            </h3>
                            <Badge>{ORG_ROLE_LABELS[role]}</Badge>
                            {isSelf ? (
                              <Badge variant="outline">You</Badge>
                            ) : null}
                          </div>
                          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                            <Mail className="size-3.5" aria-hidden />
                            {user.email}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {ROLE_HINT[role]}
                          </p>
                        </div>
                      </div>
                      {canManage ? (
                        <OrgMemberRow
                          organizationId={membership.organization.id}
                          membershipId={membershipId}
                          currentRole={role}
                          isSelf={isSelf}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-brand-deep rounded-2xl p-6 text-white">
              <h2 className="font-display flex items-center gap-2 text-lg font-semibold">
                <Shield className="text-coral size-5" aria-hidden />
                Roles at a glance
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {(
                  [
                    [
                      "Organisation admin",
                      "Full control of programmes, members and cases",
                    ],
                    ["Caseworker", "Update requests and message people"],
                    ["Viewer", "See the workspace, no changes"],
                  ] as const
                ).map(([title, body]) => (
                  <li key={title}>
                    <span className="block font-semibold">{title}</span>
                    <span className="text-white/70">{body}</span>
                  </li>
                ))}
              </ul>
            </div>
            {!canManage ? (
              <p className="border-border text-muted-foreground bg-card rounded-2xl border border-dashed p-4 text-sm">
                Only organisation admins can add or remove people. Ask an admin
                if you need a different role.
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
