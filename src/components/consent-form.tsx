"use client";

import { useActionState } from "react";

import {
  submitReferralConsentAction,
  type ReferralActionState,
} from "@/app/actions/referral";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
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
}: {
  intakeId: string;
  organizationId: string;
  organizationName: string;
}) {
  const [state, formAction] = useActionState(
    submitReferralConsentAction,
    initialState,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share a referral with consent</CardTitle>
        <CardDescription>
          Nothing is shared until you explicitly consent. You can ask for
          correction or deletion later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="intakeId" value={intakeId} />
          <input type="hidden" name="organizationId" value={organizationId} />
          <input type="hidden" name="consentVersion" value={CONSENT_VERSION} />

          {state.message ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {state.message}
            </p>
          ) : null}

          <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm leading-relaxed">
            <p className="font-medium text-foreground">Receiving organization</p>
            <p className="mt-1 text-muted-foreground">{organizationName}</p>
            <p className="mt-3 text-muted-foreground">
              Consent version: {CONSENT_VERSION}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Why share this information?</Label>
            <Textarea
              id="purpose"
              name="purpose"
              required
              defaultValue="Help coordinate mobility-support next steps and follow-up."
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Fields that will be shared</legend>
            {FIELD_OPTIONS.map((field) => (
              <label
                key={field.id}
                className="flex min-h-11 items-center gap-3 rounded-md border border-border px-3"
              >
                <input
                  type="checkbox"
                  name="fieldsShared"
                  value={field.id}
                  defaultChecked={
                    field.id === "confirmed_summary" || field.id === "region"
                  }
                />
                <span className="text-sm">{field.label}</span>
              </label>
            ))}
          </fieldset>

          <label className="flex min-h-11 items-start gap-3 rounded-md border border-border px-3 py-3">
            <input
              type="checkbox"
              name="allowContact"
              className="mt-1"
              required
            />
            <span className="text-sm leading-relaxed">
              I consent to share the selected fields with{" "}
              <strong>{organizationName}</strong> and allow them to contact me
              about this referral. I understand I can withdraw consent or request
              deletion later.
            </span>
          </label>

          <div className="flex flex-wrap gap-3">
            <SubmitButton
              idleLabel="Consent and create referral"
              pendingLabel="Recording consent…"
              size="lg"
            />
            <Button asChild variant="outline" size="lg">
              <a href={`/plan/${intakeId}`}>Cancel</a>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
