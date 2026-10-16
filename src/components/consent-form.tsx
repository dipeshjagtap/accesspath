"use client";

import { useActionState } from "react";
import { CircleAlert, Lock } from "lucide-react";

import {
  submitReferralConsentAction,
  type ReferralActionState,
} from "@/app/actions/referral";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONSENT_VERSION } from "@/modules/consent/types";

const initialState: ReferralActionState = { ok: true };

const SHAREABLE_FIELDS = [
  { id: "confirmed_summary", label: "Your confirmed summary", defaultOn: true },
  { id: "region", label: "Your area", defaultOn: true },
  {
    id: "practical_needs",
    label: "What you need, in your words",
    defaultOn: true,
  },
  {
    id: "budget_constraint",
    label: "Budget or affordability",
    defaultOn: false,
  },
  { id: "access_needs", label: "Access needs for contact", defaultOn: false },
  {
    id: "preferred_contact_method",
    label: "How to contact you",
    defaultOn: false,
  },
] as const;

export type ShareableFieldId = (typeof SHAREABLE_FIELDS)[number]["id"];

const checkCard =
  "flex cursor-pointer gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-secondary/60 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring";

export function ConsentForm({
  intakeId,
  organizationId,
  organizationName,
  assistanceProgramId,
  programmeName,
  parentCaseId,
  previews,
}: {
  intakeId: string;
  organizationId: string;
  organizationName: string;
  assistanceProgramId: string;
  programmeName: string;
  parentCaseId?: string;
  previews: Record<ShareableFieldId, string | null>;
}) {
  const [state, formAction] = useActionState(
    submitReferralConsentAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm"
    >
      <input type="hidden" name="intakeId" value={intakeId} />
      <input type="hidden" name="organizationId" value={organizationId} />
      <input
        type="hidden"
        name="assistanceProgramId"
        value={assistanceProgramId}
      />
      <input type="hidden" name="consentVersion" value={CONSENT_VERSION} />
      {parentCaseId ? (
        <input type="hidden" name="parentCaseId" value={parentCaseId} />
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

      <Step
        number={2}
        title="Choose what to share"
        description={`Only the details you tick are sent to ${organizationName}. Details you did not provide can't be shared.`}
      >
        <fieldset>
          <legend className="sr-only">Details to share</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {SHAREABLE_FIELDS.map((field) => {
              const value = previews[field.id];
              return (
                <label key={field.id} className={checkCard}>
                  <input
                    type="checkbox"
                    name="fieldsShared"
                    value={field.id}
                    defaultChecked={field.defaultOn && Boolean(value)}
                    disabled={!value}
                    className="accent-primary mt-1 size-4 shrink-0"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {field.label}
                    </span>
                    <span className="text-muted-foreground mt-1 line-clamp-3 text-xs leading-relaxed">
                      {value ?? "Not provided"}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </Step>

      <Step
        number={3}
        title="Why are you sharing this?"
        description="This reason is recorded with your consent. The suggested wording is fine for most requests."
      >
        <div className="space-y-2">
          <Label htmlFor="purpose" className="sr-only">
            Reason for sharing
          </Label>
          <Textarea
            id="purpose"
            name="purpose"
            required
            rows={2}
            maxLength={500}
            className="min-h-16"
            defaultValue={
              parentCaseId
                ? "Request alternative support after the previous request was declined or stalled"
                : `Request support from ${programmeName}`
            }
          />
        </div>
      </Step>

      <Step
        number={4}
        title="Confirm and send"
        description="Sending a request does not mean it is accepted. The organisation reviews it and replies through your dashboard."
      >
        <label className="border-primary/30 bg-secondary/40 has-[:checked]:border-primary flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 text-sm leading-relaxed">
          <input
            type="checkbox"
            name="allowContact"
            required
            className="accent-primary mt-0.5 size-5 shrink-0"
          />
          <span>
            I agree to share the details I ticked with{" "}
            <strong>{organizationName}</strong> so they can review my request
            for <strong>{programmeName}</strong>. I understand AccessPath does
            not guarantee acceptance or delivery.
          </span>
        </label>
      </Step>

      <div className="border-border bg-muted/40 flex flex-col gap-3 border-t px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground flex items-center gap-2 text-xs">
          <Lock className="size-3.5" aria-hidden />
          Consent record {CONSENT_VERSION}
          {parentCaseId ? " · fresh consent for an alternative referral" : ""}
        </p>
        <SubmitButton
          size="lg"
          idleLabel={`Send request to ${organizationName}`}
          pendingLabel="Sending…"
          className="whitespace-normal"
        />
      </div>
    </form>
  );
}

function Step({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-border space-y-4 border-b px-6 py-6 last-of-type:border-b-0">
      <header className="flex gap-3">
        <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
          {number}
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
