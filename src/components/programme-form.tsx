"use client";

import { useActionState, useId, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  ClipboardList,
  Link2,
  Loader2,
  MapPin,
} from "lucide-react";
import Link from "next/link";

import { upsertProgrammeAction, type OrgActionState } from "@/app/actions/org";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const initial: OrgActionState = { ok: true };

const selectClassName =
  "flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const STEPS = [
  {
    id: 1 as const,
    title: "The programme",
    question: "What support do you offer?",
    description: "Name it clearly so people recognise whether it fits them.",
    icon: ClipboardList,
  },
  {
    id: 2 as const,
    title: "Where & documents",
    question: "Where do you serve, and what might people need?",
    description: "Matching uses region. Documents stay optional until contact.",
    icon: MapPin,
  },
  {
    id: 3 as const,
    title: "Publish",
    question: "Ready to publish this listing?",
    description: "Add links if you have them, then save for review.",
    icon: Link2,
  },
];

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

type StepId = (typeof STEPS)[number]["id"];

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
  const formId = useId();
  const [step, setStep] = useState<StepId>(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(
    upsertProgrammeAction,
    initial,
  );
  const isEdit = Boolean(programme);
  const current = STEPS[step - 1]!;

  function goNext() {
    const root = document.getElementById(formId);
    if (!(root instanceof HTMLFormElement)) return;

    const fields =
      step === 1
        ? (["name", "categoryId", "purpose", "description"] as const)
        : step === 2
          ? (["regions"] as const)
          : ([] as const);

    for (const name of fields) {
      const el = root.elements.namedItem(name);
      const input =
        el instanceof RadioNodeList
          ? (el[0] as HTMLInputElement | undefined)
          : (el as
              | HTMLInputElement
              | HTMLTextAreaElement
              | HTMLSelectElement
              | null);
      if (!input) continue;
      const value = "value" in input ? String(input.value).trim() : "";
      if (!value) {
        input.focus();
        setStepError(
          "Please fill in the highlighted fields before continuing.",
        );
        input.reportValidity?.();
        return;
      }
    }

    setStepError(null);
    setStep((step + 1) as StepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStepError(null);
    setStep((step - 1) as StepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <nav aria-label="Programme steps" className="space-y-2">
          {STEPS.map((item) => {
            const done = item.id < step;
            const active = item.id === step;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id < step) {
                    setStepError(null);
                    setStep(item.id);
                  }
                }}
                disabled={item.id > step}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                  active && "border-primary bg-secondary/70 shadow-sm",
                  done &&
                    !active &&
                    "border-border bg-card hover:border-primary/40",
                  item.id > step && "border-border/60 bg-muted/30 opacity-60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    active && "bg-primary text-primary-foreground",
                    done && !active && "bg-emerald-100 text-emerald-800",
                    item.id > step && "bg-muted text-muted-foreground",
                  )}
                >
                  {done && !active ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    item.id
                  )}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-semibold">
                    <Icon
                      className="text-primary size-3.5 shrink-0"
                      aria-hidden
                    />
                    {item.title}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-xs leading-snug">
                    {item.question}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
        <p className="text-muted-foreground mt-4 hidden text-xs leading-relaxed lg:block">
          Step {step} of {STEPS.length}. Your answers stay on this page until
          you save.
        </p>
      </aside>

      <form
        id={formId}
        action={formAction}
        noValidate
        className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
      >
        <input type="hidden" name="organizationId" value={organizationId} />
        {programme ? (
          <input type="hidden" name="programmeId" value={programme.id} />
        ) : null}

        <header className="border-border bg-brand-deep relative overflow-hidden border-b px-6 py-8 text-white sm:px-8">
          <div className="dot-grid pointer-events-none absolute inset-0 opacity-25" />
          <div className="relative">
            <p className="text-xs font-semibold tracking-wide text-white/70 uppercase">
              Step {step} of {STEPS.length}
            </p>
            <h2 className="font-display mt-2 text-2xl font-bold sm:text-3xl">
              {current.question}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/75">
              {current.description}
            </p>
            <div
              className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={STEPS.length}
              aria-valuenow={step}
              aria-label="Form progress"
            >
              <div
                className="bg-coral h-full rounded-full transition-all duration-300"
                style={{ width: `${(step / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        </header>

        {(state.message || stepError) && (
          <div
            role="alert"
            className="border-destructive/20 bg-destructive/5 text-destructive flex items-start gap-3 border-b px-6 py-4 text-sm"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {state.message ?? stepError}
          </div>
        )}

        <div
          className={cn("space-y-5 px-6 py-7 sm:px-8", step !== 1 && "hidden")}
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="name" label="Programme name" className="md:col-span-2">
              <Input
                id="name"
                name="name"
                required={step === 1}
                maxLength={200}
                defaultValue={programme?.name}
                placeholder="e.g. City mobility navigation clinic"
              />
            </Field>
            <Field id="categoryId" label="Support category">
              <select
                id="categoryId"
                name="categoryId"
                required={step === 1}
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
                required={step === 1}
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
                required={step === 1}
                rows={6}
                defaultValue={programme?.description}
                placeholder="Explain the support, how people apply, and any limits."
              />
            </Field>
          </div>
        </div>

        <div
          className={cn("space-y-5 px-6 py-7 sm:px-8", step !== 2 && "hidden")}
        >
          <Field
            id="regions"
            label="Regions served"
            hint="Comma-separated. Keep demo regions clearly labelled."
          >
            <Input
              id="regions"
              name="regions"
              required={step === 2}
              defaultValue={programme?.regions.join(", ") ?? defaultRegion}
            />
          </Field>
          <Field
            id="requiredDocuments"
            label="Documents you may ask for"
            hint="One per line. Optional — people see these before they consent."
          >
            <Textarea
              id="requiredDocuments"
              name="requiredDocuments"
              rows={5}
              defaultValue={programme?.requiredDocuments.join("\n")}
              placeholder={"Photo ID\nProof of address"}
            />
          </Field>
        </div>

        <div
          className={cn("space-y-5 px-6 py-7 sm:px-8", step !== 3 && "hidden")}
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
          </div>
          <label className="border-border bg-background has-[:checked]:border-primary has-[:checked]:bg-secondary/50 flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-sm">
            <input
              type="checkbox"
              name="publish"
              defaultChecked={programme?.isPublished ?? true}
              className="accent-primary mt-0.5 size-4"
            />
            <span>
              <span className="block font-semibold">Mark as published</span>
              <span className="text-muted-foreground">
                {isEdit
                  ? "Saving sends the listing back to needs review until an admin verifies it again."
                  : "Still needs a verified organisation and listing review before live matching."}
              </span>
            </span>
          </label>
          <div className="bg-secondary/50 rounded-xl px-4 py-3 text-sm leading-relaxed">
            <p className="font-semibold">Before you save</p>
            <p className="text-muted-foreground mt-1">
              Keep demo listings clearly fictional. People only see published
              programmes from verified organisations.
            </p>
          </div>
        </div>

        <div className="border-border bg-muted/40 flex flex-col-reverse gap-3 border-t px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          {step === 1 ? (
            <Button asChild variant="outline">
              <Link href="/org/programmes">Cancel</Link>
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={goBack}>
              <ArrowLeft className="size-4" aria-hidden />
              Back
            </Button>
          )}

          {step < STEPS.length ? (
            <Button type="button" size="lg" onClick={goNext}>
              Continue
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                <>
                  Save programme
                  <Check className="size-4" aria-hidden />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
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
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
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
