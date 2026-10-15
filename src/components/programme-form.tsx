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

export function ProgrammeForm({
  organizationId,
  categories,
  defaultRegion,
}: {
  organizationId: string;
  categories: Array<{ id: string; name: string }>;
  defaultRegion: string;
}) {
  const [state, formAction, pending] = useActionState(
    upsertProgrammeAction,
    initial,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publish a support programme</CardTitle>
        <CardDescription>
          All demo listings should stay clearly fictional. New programmes start
          as needs_review until an admin verifies them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="organizationId" value={organizationId} />
          {state.message ? (
            <p role="alert" className="text-sm text-destructive">
              {state.message}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              required
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
            <Input id="purpose" name="purpose" required maxLength={1000} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regions">Regions (comma-separated)</Label>
            <Input
              id="regions"
              name="regions"
              required
              defaultValue={defaultRegion}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requiredDocuments">
              Required documents (one per line)
            </Label>
            <Textarea id="requiredDocuments" name="requiredDocuments" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="availabilityStatus">Availability</Label>
            <select
              id="availabilityStatus"
              name="availabilityStatus"
              defaultValue="accepting_requests"
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
            <Input id="officialUrl" name="officialUrl" type="url" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="evidenceUrl">Evidence URL (optional)</Label>
            <Input id="evidenceUrl" name="evidenceUrl" type="url" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="publish" defaultChecked />
            Mark as published (still requires verified org + listing review for
            live matching)
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save programme"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
