"use client";

import { useActionState } from "react";

import {
  submitReferralConsentAction,
  type ReferralActionState,
} from "@/app/actions/referral";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONSENT_VERSION } from "@/modules/consent/types";

const initialState: ReferralActionState = { ok: true };

const FIELD_OPTIONS = [
  { id: "confirmed_summary", label: "Confirmed needs summary" },
  { id: "region", label: "Region" },
  { id: "practical_needs", label: "Practical needs description" },
  { id: "budget_constraint", label: "Budget / affordability note" },
  { id: "access_needs", label: "Access needs for contact" },
  { id: "preferred_contact_method", label: "Preferred contact method" },
] as const;

export function ConsentForm({
  intakeId,
  organizationId,
  organizationName,
  assistanceProgramId,
  programmeName,
  parentCaseId,
}: {
  intakeId: string;
  organizationId: string;
  organizationName: string;
  assistanceProgramId: string;
  programmeName: string;
  parentCaseId?: string;
}) {
  const [state, formAction] = useActionState(
    submitReferralConsentAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {parentCaseId
            ? "Consent to an alternative referral"
            : "Submit a request with consent"}
        </CardTitle>
        <CardDescription>
          Nothing is shared until you explicitly consent. A request being sent
          is not the same as acceptance or delivered assistance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
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
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {state.message}
            </p>
          ) : null}

          <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm leading-relaxed">
            <p className="font-medium text-foreground">Programme</p>
            <p className="mt-1 text-muted-foreground">{programmeName}</p>
            <p className="mt-3 font-medium text-foreground">Organisation</p>
            <p className="mt-1 text-muted-foreground">{organizationName}</p>
            <p className="mt-3 text-muted-foreground">
              Consent version: {CONSENT_VERSION}
              {parentCaseId ? " · Fresh consent for alternative referral" : ""}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Why share this information?</Label>
            <Textarea
              id="purpose"
              name="purpose"
              required
              maxLength={500}
              defaultValue={
                parentCaseId
                  ? "Request alternative support after the previous request was declined or stalled"
                  : "Request support through a published programme"
              }
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">
              Fields that will be shared
            </legend>
            {FIELD_OPTIONS.map((field) => (
              <label
                key={field.id}
                className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3"
              >
                <input
                  type="checkbox"
                  name="fieldsShared"
                  value={field.id}
                  defaultChecked={
                    field.id === "confirmed_summary" ||
                    field.id === "region" ||
                    field.id === "practical_needs"
                  }
                />
                {field.label}
              </label>
            ))}
          </fieldset>

          <label className="flex min-h-11 items-start gap-2 rounded-md border border-border px-3 py-3 text-sm">
            <input
              type="checkbox"
              name="allowContact"
              className="mt-1"
              required
            />
            <span>
              I consent to sharing the selected fields with{" "}
              <strong>{organizationName}</strong> for the stated purpose. I
              understand AccessPath does not guarantee acceptance or delivery.
            </span>
          </label>

          <SubmitButton idleLabel="Submit request" pendingLabel="Submitting…" />
        </form>
      </CardContent>
    </Card>
  );
}
