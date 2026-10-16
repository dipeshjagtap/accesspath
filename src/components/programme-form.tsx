"use client";

import { useActionState } from "react";

import { upsertProgrammeAction, type OrgActionState } from "@/app/actions/org";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: OrgActionState = { ok: true };

export type ProgrammeFormValues = {
  id: string;
  name: string;
  categoryId: string | null;
  purpose: string;
  description: string;
  regions: string[];
  requiredDocuments: string[];
  availabilityStatus: string;
  officialUrl: string | null;
  evidenceUrl: string | null;
  isPublished: boolean;
};

export function ProgrammeForm({
  organizationId,
  categories,
  defaultRegion,
  programme,
}: {
  organizationId: string;
  categories: Array<{ id: string; name: string }>;
  defaultRegion: string;
  programme?: ProgrammeFormValues;
}) {
  const [state, formAction, pending] = useActionState(
    upsertProgrammeAction,
    initial,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {programme ? "Edit programme" : "Publish a support programme"}
        </CardTitle>
        <CardDescription>
          {programme
            ? "Saving changes sends the listing back to needs_review until an admin verifies it again."
            : "All demo listings should stay clearly fictional. New programmes start as needs_review until an admin verifies them."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="organizationId" value={organizationId} />
          {programme ? (
            <input type="hidden" name="programmeId" value={programme.id} />
          ) : null}
          {state.message ? (
            <p role="alert" className="text-sm text-destructive">
              {state.message}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              maxLength={200}
              defaultValue={programme?.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={programme?.categoryId ?? undefined}
              className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              name="purpose"
              required
              maxLength={1000}
              defaultValue={programme?.purpose}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              required
              defaultValue={programme?.description}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regions">Regions (comma-separated)</Label>
            <Input
              id="regions"
              name="regions"
              required
              defaultValue={programme?.regions.join(", ") ?? defaultRegion}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requiredDocuments">
              Required documents (one per line)
            </Label>
            <Textarea
              id="requiredDocuments"
              name="requiredDocuments"
              defaultValue={programme?.requiredDocuments.join("\n")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availabilityStatus">Availability</Label>
            <select
              id="availabilityStatus"
              name="availabilityStatus"
              defaultValue={programme?.availabilityStatus ?? "accepting_requests"}
              className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="accepting_requests">Accepting requests</option>
              <option value="waitlist">Waitlist</option>
              <option value="temporarily_unavailable">
                Temporarily unavailable
              </option>
              <option value="closed">Closed</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="officialUrl">Official URL (optional)</Label>
            <Input
              id="officialUrl"
              name="officialUrl"
              type="url"
              defaultValue={programme?.officialUrl ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evidenceUrl">Evidence URL (optional)</Label>
            <Input
              id="evidenceUrl"
              name="evidenceUrl"
              type="url"
              defaultValue={programme?.evidenceUrl ?? ""}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="publish"
              defaultChecked={programme?.isPublished ?? true}
            />
            Mark as published (still requires verified org + listing review for
            live matching)
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : programme ? "Save changes" : "Save programme"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
