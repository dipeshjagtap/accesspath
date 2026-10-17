"use client";

import { useActionState } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import Link from "next/link";

import { upsertProgrammeAction, type OrgActionState } from "@/app/actions/org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: OrgActionState = { ok: true };

const selectClassName =
  "flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

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
  const isEdit = Boolean(programme);

  return (
    <form
      action={formAction}
      className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
    >
      <input type="hidden" name="organizationId" value={organizationId} />
      {programme ? (
        <input type="hidden" name="programmeId" value={programme.id} />
      ) : null}

      {state.message ? (
        <div
          role="alert"
          className="border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-3 border-b px-6 py-4 text-sm"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.message}
        </div>
      ) : null}

      <FormSection
        step={1}
        title="What is this programme?"
        description="A clear name and purpose help people decide whether to request support."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field id="name" label="Programme name" className="md:col-span-2">
            <Input
              id="name"
              name="name"
              required
              maxLength={200}
              defaultValue={programme?.name}
              placeholder="e.g. City mobility navigation clinic"
            />
          </Field>
          <Field id="categoryId" label="Support category">
            <select
              id="categoryId"
              name="categoryId"
              required
              defaultValue={programme?.categoryId ?? undefined}
              className={selectClassName}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="availabilityStatus" label="Availability">
            <select
              id="availabilityStatus"
              name="availabilityStatus"
              defaultValue={
                programme?.availabilityStatus ?? "accepting_requests"
              }
              className={selectClassName}
            >
              <option value="accepting_requests">Accepting requests</option>
              <option value="waitlist">Waitlist</option>
              <option value="temporarily_unavailable">
                Temporarily unavailable
              </option>
              <option value="closed">Closed</option>
              <option value="unknown">Unknown</option>
            </select>
          </Field>
          <Field id="purpose" label="Short purpose" className="md:col-span-2">
            <Input
              id="purpose"
              name="purpose"
              required
              maxLength={1000}
              defaultValue={programme?.purpose}
              placeholder="One sentence on who this helps and how"
            />
          </Field>
          <Field
            id="description"
            label="Full description"
            className="md:col-span-2"
          >
            <Textarea
              id="description"
              name="description"
              required
              rows={5}
              defaultValue={programme?.description}
              placeholder="Explain the support, how people apply, and any limits."
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        step={2}
        title="Where and what people need"
        description="Matching uses region. Documents stay optional until the person contacts you."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            id="regions"
            label="Regions served"
            hint="Comma-separated. Keep demo regions clearly labelled."
            className="md:col-span-2"
          >
            <Input
              id="regions"
              name="regions"
              required
              defaultValue={programme?.regions.join(", ") ?? defaultRegion}
            />
          </Field>
          <Field
            id="requiredDocuments"
            label="Documents you may ask for"
            hint="One per line. Optional."
            className="md:col-span-2"
          >
            <Textarea
              id="requiredDocuments"
              name="requiredDocuments"
              rows={4}
              defaultValue={programme?.requiredDocuments.join("\n")}
              placeholder={"Photo ID\nProof of address"}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        step={3}
        title="Links and publishing"
        description={
          isEdit
            ? "Saving sends the listing back to needs review until an admin verifies it again."
            : "New programmes start as needs review until a platform admin verifies them."
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field id="officialUrl" label="Official URL" optional>
            <Input
              id="officialUrl"
              name="officialUrl"
              type="url"
              defaultValue={programme?.officialUrl ?? ""}
              placeholder="https://"
            />
          </Field>
          <Field id="evidenceUrl" label="Evidence URL" optional>
            <Input
              id="evidenceUrl"
              name="evidenceUrl"
              type="url"
              defaultValue={programme?.evidenceUrl ?? ""}
              placeholder="https://"
            />
          </Field>
          <label className="border-border bg-background has-[:checked]:border-primary has-[:checked]:bg-secondary/50 flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm md:col-span-2">
            <input
              type="checkbox"
              name="publish"
              defaultChecked={programme?.isPublished ?? true}
              className="accent-primary mt-0.5 size-4"
            />
            <span>
              <span className="block font-semibold">Mark as published</span>
              <span className="text-muted-foreground">
                Still needs a verified organisation and listing review before
                live matching.
              </span>
            </span>
          </label>
        </div>
      </FormSection>

      <div className="border-border bg-muted/40 flex flex-col gap-3 border-t px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline">
          <Link href="/org/programmes">Cancel</Link>
        </Button>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Saving…
            </>
          ) : isEdit ? (
            "Save changes"
          ) : (
            "Save programme"
          )}
        </Button>
      </div>
    </form>
  );
}

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border space-y-5 border-b px-6 py-7 last-of-type:border-b-0">
      <header className="flex gap-3">
        <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
          {step}
        </span>
        <div>
          <h2 className="font-display text-lg leading-7 font-semibold">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </header>
      <div className="sm:pl-10">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  optional,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={id}>
        {label}
        {optional ? (
          <span className="text-muted-foreground ml-1.5 font-normal">
            (optional)
          </span>
        ) : null}
      </Label>
      {children}
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}
