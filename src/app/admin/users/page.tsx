import { Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/modules/auth/permissions";
import { describeRoles } from "@/modules/auth/roles";
import { listUsersWithRoles } from "@/modules/organizations/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin – accounts and roles",
};

export default async function AdminUsersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }

  const accounts = await listUsersWithRoles();
  const counts = {
    admins: accounts.filter((a) => a.role === "admin").length,
    orgMembers: accounts.filter((a) => a.memberships.length > 0).length,
    individuals: accounts.filter(
      (a) => a.role !== "admin" && a.memberships.length === 0,
    ).length,
  };

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="Admin workspace"
        icon={Users}
        title="Accounts and roles"
        description={`${accounts.length} accounts · ${counts.admins} platform admin(s) · ${counts.orgMembers} organisation member(s) · ${counts.individuals} individual(s)`}
      />
      <div className="section-x w-full flex-1 space-y-8 py-10">
        <div className="border-border overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Name
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Roles
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className="border-border border-t align-top"
                >
                  <td className="px-3 py-2">{account.displayName ?? "—"}</td>
                  <td className="text-muted-foreground px-3 py-2 break-all">
                    {account.email}
                  </td>
                  <td className="px-3 py-2">
                    <ul className="flex flex-wrap gap-1">
                      {describeRoles(
                        account.role,
                        account.memberships.map((m) => ({
                          memberRole: m.memberRole,
                          organizationName: m.organizationName,
                        })),
                      ).map((r) => (
                        <li key={`${r.label}-${r.organizationName ?? ""}`}>
                          <Badge
                            variant={
                              r.label === "Individual" ? "outline" : "default"
                            }
                          >
                            {r.organizationName
                              ? `${r.label} · ${r.organizationName}`
                              : r.label}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="text-muted-foreground px-3 py-2 whitespace-nowrap">
                    {account.createdAt.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-muted-foreground text-sm">
          Platform admin is granted from the command line only:{" "}
          <code>npm run user:set-role -- you@example.com admin</code>
        </p>

        <Button asChild variant="outline">
          <Link href="/admin">Back to admin</Link>
        </Button>
      </div>
    </main>
  );
}
