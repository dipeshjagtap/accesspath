import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  MapPin,
  Pencil,
  Plus,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  heroPrimaryAction,
  heroSecondaryAction,
  PageHero,
} from "@/components/page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireAnyOrgMember } from "@/modules/auth/permissions";
import { listProgrammesForOrganization } from "@/modules/programmes/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage your support programmes",
};

const AVAILABILITY_LABEL: Record<string, string> = {
  accepting_requests: "Accepting requests",
  waitlist: "Waitlist",
  temporarily_unavailable: "Temporarily unavailable",
  closed: "Closed",
  unknown: "Unknown",
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
  const canEdit = membership.memberRole === "org_admin";
  const published = programmes.filter((p) => p.publishedAt).length;

  return (
    <main className="flex flex-1 flex-col">
      <PageHero
        eyebrow="Organisation workspace"
        icon={ClipboardList}
        title="Your programmes"
        description={
          programmes.length === 0
            ? "Publish a programme so people in your area can request support."
            : `${published} published · ${programmes.length} total. Only published programmes from verified organisations can receive live requests.`
        }
        actions={
          <>
            {canEdit ? (
              <Link href="/org/programmes/new" className={heroPrimaryAction}>
                <Plus className="size-4" aria-hidden />
                New programme
              </Link>
            ) : null}
            <Link href="/org" className={heroSecondaryAction}>
              <ArrowLeft className="size-4" aria-hidden />
              Back to organisation
            </Link>
          </>
        }
      />

      <div className="section-x py-10">
        <div className="mx-auto w-full max-w-6xl">
          {programmes.length === 0 ? (
            <div className="border-border bg-card space-y-4 rounded-2xl border border-dashed p-10 text-center">
              <ClipboardList
                className="text-muted-foreground mx-auto size-10"
                aria-hidden
              />
              <h2 className="font-display text-xl font-semibold">
                No programmes yet
              </h2>
              <p className="text-muted-foreground mx-auto max-w-md text-sm">
                Create a listing for the support you offer. It starts under
                review until a platform admin verifies it.
              </p>
              {canEdit ? (
                <Button asChild>
                  <Link href="/org/programmes/new">
                    Create your first programme
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {programmes.map((programme) => (
                <li
                  key={programme.id}
                  className="border-border bg-card flex flex-col rounded-2xl border p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {programme.publishedAt ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                    <Badge variant="outline">{programme.categoryName}</Badge>
                    <Badge variant="outline">
                      {AVAILABILITY_LABEL[programme.availabilityStatus] ??
                        programme.availabilityStatus.replaceAll("_", " ")}
                    </Badge>
                  </div>
                  <h3 className="text-brand-dark mt-3 text-lg font-bold">
                    {programme.name}
                  </h3>
                  <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
                    {programme.purpose}
                  </p>
                  <p className="text-muted-foreground mt-3 inline-flex items-center gap-1.5 text-xs">
                    <MapPin className="text-coral size-3.5" aria-hidden />
                    {programme.regions.join(", ")}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs capitalize">
                    Listing: {programme.verificationStatus.replaceAll("_", " ")}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/programs/${programme.id}`}>
                        View public page
                      </Link>
                    </Button>
                    {canEdit ? (
                      <Button asChild size="sm">
                        <Link href={`/org/programmes/${programme.id}/edit`}>
                          <Pencil className="size-3.5" aria-hidden />
                          Edit
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
