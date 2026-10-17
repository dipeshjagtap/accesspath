"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { registerAction, type AuthActionState } from "@/app/actions/auth";
import { PasswordInput } from "@/components/password-input";
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

const initial: AuthActionState = { ok: true };

type AccountType = "individual" | "organization";

const ORGANIZATION_TYPE_OPTIONS = [
  ["ngo", "NGO"],
  ["hospital", "Hospital"],
  ["clinic", "Clinic"],
  ["public_agency", "Public agency"],
  ["service_provider", "Service provider"],
  ["rehabilitation_provider", "Rehabilitation provider"],
  ["disability_support", "Disability support"],
  ["foundation", "Foundation"],
  ["other", "Other"],
] as const;

const selectClassName =
  "flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial);
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [clientError, setClientError] = useState<string | null>(null);
  const isOrg = accountType === "organization";
  const errorMessage = clientError ?? state.message;

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-brand-dark text-2xl font-bold">
          Create an account
        </CardTitle>
        <CardDescription>
          Individuals register to track requests and consent history.
          Organisations register to publish programmes and handle requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form
          action={formAction}
          className="space-y-4"
          onSubmit={(event) => {
            const form = event.currentTarget;
            const password = new FormData(form).get("password");
            const confirm = new FormData(form).get("confirmPassword");
            if (String(password ?? "") !== String(confirm ?? "")) {
              event.preventDefault();
              setClientError(
                "Passwords do not match. Re-enter the same password in both fields.",
              );
              return;
            }
            setClientError(null);
          }}
        >
          {errorMessage ? (
            <p role="alert" className="text-destructive text-sm">
              {errorMessage}
            </p>
          ) : null}

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">I am registering as</legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["individual", "An individual"],
                  ["organization", "An organisation"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="border-input has-[:checked]:border-primary has-[:checked]:bg-primary/5 flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    name="accountType"
                    value={value}
                    checked={accountType === value}
                    onChange={() => setAccountType(value)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              Caseworkers: register as an individual, then ask your organisation
              admin to add you.
            </p>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="displayName">
              {isOrg ? "Your name" : "Display name"}
            </Label>
            <Input
              id="displayName"
              name="displayName"
              required
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password (8+ characters)</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              toggleLabel="Show password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Re-enter password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              minLength={8}
              toggleLabel="Show confirmation password"
            />
            <p className="text-muted-foreground text-xs">
              Type the same password again so we know it was entered correctly.
            </p>
          </div>

          {isOrg ? (
            <div className="border-border space-y-4 rounded-lg border p-3">
              <p className="text-sm font-medium">Organisation details</p>
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organisation name</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  required
                  minLength={2}
                  maxLength={200}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="organizationType">Organisation type</Label>
                <select
                  id="organizationType"
                  name="organizationType"
                  required
                  defaultValue="ngo"
                  className={selectClassName}
                >
                  {ORGANIZATION_TYPE_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  Public contact email (optional)
                </Label>
                <Input id="contactEmail" name="contactEmail" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationType">
                  Registration type (optional, e.g. NGO-DARPAN)
                </Label>
                <Input
                  id="registrationType"
                  name="registrationType"
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">
                  Registration number (optional)
                </Label>
                <Input
                  id="registrationNumber"
                  name="registrationNumber"
                  maxLength={120}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regionsServed">
                  Regions served (optional, comma-separated)
                </Label>
                <Input
                  id="regionsServed"
                  name="regionsServed"
                  maxLength={500}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                You become this organisation&apos;s admin. A platform admin
                reviews the organisation before its programmes are shown to
                users.
              </p>
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={pending}
          >
            {pending
              ? "Creating…"
              : isOrg
                ? "Register organisation"
                : "Register"}
          </Button>
        </form>
        <p className="text-muted-foreground mt-4 text-sm">
          Already registered?{" "}
          <Link className="underline" href="/login">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
