"use client";

import { useActionState } from "react";

import {
  submitIntakeAction,
  type ActionState,
} from "@/app/actions/intake";
import { ProgressSteps } from "@/components/progress-steps";
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
import { DEMO_REGION_OPTIONS } from "@/lib/constants";

const initialState: ActionState = { ok: true };

export function IntakeForm() {
  const [state, formAction, pending] = useActionState(
    submitIntakeAction,
    initialState,
  );

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <ProgressSteps current={1} />
      <Card>
        <CardHeader>
          <CardTitle>Mobility-support intake</CardTitle>
          <CardDescription>
            Share only what helps with navigation. Skip anything marked optional.
            No account is required for this demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6" noValidate>
            {state.message ? (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {state.message}
              </p>
            ) : null}

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Who is this for?</legend>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                <label className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3">
                  <input
                    type="radio"
                    name="askingFor"
                    value="self"
                    defaultChecked
                  />
                  Myself
                </label>
                <label className="flex min-h-11 items-center gap-2 rounded-md border border-border px-3">
                  <input type="radio" name="askingFor" value="someone_else" />
                  Someone I support
                </label>
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="displayName">Preferred name (optional)</Label>
              <Input
                id="displayName"
                name="displayName"
                autoComplete="nickname"
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">City / region</Label>
              <select
                id="region"
                name="region"
                required
                defaultValue={DEMO_REGION_OPTIONS[0].value}
                className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {DEMO_REGION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.region ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.region.join(" ")}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="travelRange">Preferred travel range (optional)</Label>
              <Input
                id="travelRange"
                name="travelRange"
                placeholder="e.g. Within the city"
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="practicalNeeds">
                Practical activity or accessibility challenge
              </Label>
              <Textarea
                id="practicalNeeds"
                name="practicalNeeds"
                required
                maxLength={2000}
                placeholder="Describe the practical need in your own words. Do not include a diagnosis unless you choose to."
              />
              {state.fieldErrors?.practicalNeeds ? (
                <p className="text-sm text-destructive" role="alert">
                  {state.fieldErrors.practicalNeeds.join(" ")}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supportCategory">Support category</Label>
              <Input
                id="supportCategory"
                name="supportCategoryDisplay"
                value="Mobility aid"
                readOnly
                aria-readonly="true"
              />
              <input type="hidden" name="supportCategory" value="mobility_aid" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetConstraint">
                Budget or affordability note (optional)
              </Label>
              <Input
                id="budgetConstraint"
                name="budgetConstraint"
                maxLength={200}
                placeholder="e.g. Looking for lower-cost options"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalRecommendationStatus">
                Has a qualified professional already assessed or recommended a
                product? (optional)
              </Label>
              <select
                id="professionalRecommendationStatus"
                name="professionalRecommendationStatus"
                defaultValue=""
                className="flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Skip</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="unsure">Unsure</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessNeeds">
                Access needs when contacting a provider (optional)
              </Label>
              <Textarea
                id="accessNeeds"
                name="accessNeeds"
                maxLength={500}
                placeholder="e.g. Prefer phone calls; need step-free access"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactMethod">
                Preferred contact method if follow-up is requested later
                (optional)
              </Label>
              <Input
                id="preferredContactMethod"
                name="preferredContactMethod"
                maxLength={120}
                placeholder="e.g. Phone or email"
              />
            </div>

            <p className="text-sm text-muted-foreground">
              By continuing you confirm you have read the{" "}
              <a className="underline underline-offset-2" href="/privacy">
                privacy notice
              </a>
              . This demo uses fictional data patterns — avoid real identity or
              clinical documents.
            </p>

            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Saving…" : "Continue to review"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
