"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import {
  ArrowRight,
  CircleAlert,
  ClipboardCheck,
  GraduationCap,
  HeartPulse,
  LifeBuoy,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  ShoppingBasket,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

import { submitIntakeAction, type ActionState } from "@/app/actions/intake";
import { ProgressSteps } from "@/components/progress-steps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEMO_REGION_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const initialState: ActionState = { ok: true };

const PRACTICAL_NEEDS_MAX = 2000;

export type CategoryOption = {
  slug: string;
  name: string;
  description: string;
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  education_support: GraduationCap,
  essential_needs: ShoppingBasket,
  disability_health_support: HeartPulse,
};

const ASKING_FOR_OPTIONS = [
  {
    value: "self",
    label: "Myself",
    hint: "I am looking for support for me",
    icon: User,
  },
  {
    value: "someone_else",
    label: "Someone I support",
    hint: "A family member, friend or client",
    icon: Users,
  },
] as const;

const RECOMMENDATION_OPTIONS = [
  { value: "", label: "Skip" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Unsure" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

const CONTACT_OPTIONS = [
  { value: "", label: "No preference" },
  { value: "Phone call", label: "Phone call" },
  { value: "Email", label: "Email" },
  { value: "Text / WhatsApp", label: "Text / WhatsApp" },
  { value: "In person", label: "In person" },
] as const;

/** Selectable card wrapping a native radio, so keyboard and screen-reader behaviour stay native. */
const choiceCard =
  "relative flex cursor-pointer rounded-xl border border-border bg-background transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-secondary/70 has-[:checked]:shadow-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2";

const choiceChip =
  "inline-flex min-h-10 cursor-pointer items-center rounded-full border border-border bg-background px-4 text-sm transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2";

export function IntakeForm({
  categories,
  signedIn,
}: {
  categories: CategoryOption[];
  signedIn: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    submitIntakeAction,
    initialState,
  );
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  const [needsLength, setNeedsLength] = useState(0);

  const defaultCategory =
    values.supportCategorySlug ??
    categories.find((c) => c.slug === "disability_health_support")?.slug ??
    categories[0]?.slug;

  return (
    <div className="section-x py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <ProgressSteps current={1} />

          <form
            action={formAction}
            noValidate
            className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
          >
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
              title="Who is this for?"
              description="This only changes how the summary is worded."
            >
              <fieldset>
                <legend className="sr-only">Who is this for?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ASKING_FOR_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={cn(choiceCard, "gap-3 p-4")}
                    >
                      <input
                        type="radio"
                        name="askingFor"
                        value={option.value}
                        defaultChecked={
                          (values.askingFor ?? "self") === option.value
                        }
                        className="sr-only"
                      />
                      <IconTile icon={option.icon} />
                      <span>
                        <span className="block font-semibold">
                          {option.label}
                        </span>
                        <span className="text-muted-foreground block text-sm">
                          {option.hint}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field
                id="displayName"
                label="Preferred name"
                optional
                hint="How organisations should address you or the person you support."
              >
                <Input
                  id="displayName"
                  name="displayName"
                  autoComplete="nickname"
                  maxLength={120}
                  defaultValue={values.displayName}
                  placeholder="e.g. Priya"
                />
              </Field>
            </FormSection>

            <FormSection
              step={2}
              title="What kind of support do you need?"
              description="We only match you with published programmes from verified organisations."
            >
              <fieldset>
                <legend className="sr-only">Support category</legend>
                <div className="grid gap-3 md:grid-cols-3">
                  {categories.map((category) => (
                    <label
                      key={category.slug}
                      className={cn(choiceCard, "flex-col gap-3 p-4")}
                    >
                      <input
                        type="radio"
                        name="supportCategorySlug"
                        value={category.slug}
                        defaultChecked={defaultCategory === category.slug}
                        className="sr-only"
                      />
                      <IconTile
                        icon={CATEGORY_ICONS[category.slug] ?? LifeBuoy}
                      />
                      <span>
                        <span className="block font-semibold">
                          {category.name}
                        </span>
                        <span className="text-muted-foreground mt-1 block text-xs leading-relaxed">
                          {category.description}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field
                id="practicalNeeds"
                label="Describe the practical support need"
                hint="Use your own words. You do not need to share a diagnosis."
                error={errors.practicalNeeds?.[0]}
                aside={
                  <span
                    className={cn(
                      "text-muted-foreground text-xs tabular-nums",
                      needsLength > PRACTICAL_NEEDS_MAX * 0.9 &&
                        "text-destructive",
                    )}
                  >
                    {needsLength}/{PRACTICAL_NEEDS_MAX}
                  </span>
                }
              >
                <Textarea
                  id="practicalNeeds"
                  name="practicalNeeds"
                  required
                  rows={6}
                  maxLength={PRACTICAL_NEEDS_MAX}
                  defaultValue={values.practicalNeeds}
                  onChange={(event) =>
                    setNeedsLength(event.target.value.length)
                  }
                  aria-invalid={errors.practicalNeeds ? true : undefined}
                  aria-describedby="practicalNeeds-hint practicalNeeds-error"
                  placeholder="e.g. My father uses a walker and needs help getting to weekly physiotherapy appointments across the city."
                />
              </Field>
            </FormSection>

            <FormSection
              step={3}
              title="Where should we look?"
              description="Matching uses your region to find programmes that serve your area."
            >
              <fieldset>
                <legend className="mb-3 text-sm font-medium">
                  City / region
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {DEMO_REGION_OPTIONS.map((option, index) => (
                    <label
                      key={option.value}
                      className={cn(choiceCard, "items-center gap-3 p-4")}
                    >
                      <input
                        type="radio"
                        name="region"
                        value={option.value}
                        defaultChecked={
                          values.region
                            ? values.region === option.value
                            : index === 0
                        }
                        className="sr-only"
                      />
                      <IconTile icon={MapPin} />
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError id="region-error" message={errors.region?.[0]} />
              </fieldset>

              <Field id="travelRange" label="How far can you travel?" optional>
                <Input
                  id="travelRange"
                  name="travelRange"
                  maxLength={120}
                  defaultValue={values.travelRange}
                  placeholder="e.g. Within the city, or up to 10 km"
                />
              </Field>
            </FormSection>

            <FormSection
              step={4}
              title="Anything else that helps?"
              description="All optional. Share only what you are comfortable with."
            >
              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  id="budgetConstraint"
                  label="Budget or affordability"
                  optional
                >
                  <Input
                    id="budgetConstraint"
                    name="budgetConstraint"
                    maxLength={200}
                    defaultValue={values.budgetConstraint}
                    placeholder="e.g. Looking for free or low-cost options"
                  />
                </Field>

                <Field
                  id="accessNeeds"
                  label="Access needs when contacting you"
                  optional
                >
                  <Input
                    id="accessNeeds"
                    name="accessNeeds"
                    maxLength={500}
                    defaultValue={values.accessNeeds}
                    placeholder="e.g. Step-free access, sign language"
                  />
                </Field>
              </div>

              <ChipGroup
                legend="Has a qualified professional already recommended support?"
                name="professionalRecommendationStatus"
                options={RECOMMENDATION_OPTIONS}
                selected={values.professionalRecommendationStatus ?? ""}
              />

              <ChipGroup
                legend="Preferred contact method"
                name="preferredContactMethod"
                options={CONTACT_OPTIONS}
                selected={values.preferredContactMethod ?? ""}
              />
            </FormSection>

            <div className="border-border bg-muted/40 flex flex-col gap-4 border-t px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground max-w-md text-xs leading-relaxed">
                By continuing you confirm you have read the{" "}
                <Link className="underline underline-offset-2" href="/privacy">
                  privacy notice
                </Link>
                . This demo uses fictional data, so avoid real identity or
                clinical documents.
              </p>
              <Button
                type="submit"
                size="lg"
                disabled={pending}
                className="shrink-0"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  <>
                    Continue to review
                    <ArrowRight className="size-4" aria-hidden />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="bg-brand-deep rounded-2xl p-6 text-white">
            <h2 className="font-display text-lg font-semibold">
              What happens next
            </h2>
            <ol className="mt-4 space-y-4 text-sm">
              {[
                [
                  "Review your summary",
                  "We turn your answers into a short plain-language summary you can edit.",
                ],
                [
                  "Get a support plan",
                  "See matching programmes from verified organisations near you.",
                ],
                [
                  "You decide what is shared",
                  "Nothing goes to an organisation until you give consent.",
                ],
              ].map(([title, body], index) => (
                <li key={title} className="flex gap-3">
                  <span className="bg-coral flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {index + 1}
                  </span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="text-white/70">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="border-border bg-card space-y-3 rounded-2xl border p-6 text-sm">
            <InfoRow
              icon={Lock}
              text="Your answers are only visible to you until you consent to share."
            />
            <InfoRow
              icon={ShieldCheck}
              text="Only verified organisations appear in your matches."
            />
            <InfoRow
              icon={ClipboardCheck}
              text="Takes about 3 minutes. Optional questions can be skipped."
            />
          </div>

          {!signedIn ? (
            <p className="border-primary/40 bg-secondary/50 rounded-2xl border border-dashed p-4 text-sm">
              <Link
                href="/login"
                className="text-primary font-semibold underline-offset-2 hover:underline"
              >
                Sign in
              </Link>{" "}
              so this request is saved to your dashboard and you can track it.
            </p>
          ) : null}
        </aside>
      </div>
    </div>
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
  children: ReactNode;
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
      <div className="space-y-6 sm:pl-10">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  optional,
  hint,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <Label htmlFor={id}>
          {label}
          {optional ? (
            <span className="text-muted-foreground ml-1.5 font-normal">
              (optional)
            </span>
          ) : null}
        </Label>
        {aside}
      </div>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      className="text-destructive mt-2 flex items-center gap-1.5 text-sm"
    >
      <CircleAlert className="size-4" aria-hidden />
      {message}
    </p>
  );
}

function ChipGroup({
  legend,
  name,
  options,
  selected,
}: {
  legend: string;
  name: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  selected: string;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium">
        {legend}
        <span className="text-muted-foreground ml-1.5 font-normal">
          (optional)
        </span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option.value} className={choiceChip}>
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={selected === option.value}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

function InfoRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <p className="flex gap-3">
      <Icon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
      <span className="text-muted-foreground">{text}</span>
    </p>
  );
}
