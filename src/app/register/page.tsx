"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerAction, type AuthActionState } from "@/app/actions/auth";
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

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Register to track requests and consent history. Demo accounts are
            also available after seeding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.message ? (
              <p role="alert" className="text-sm text-destructive">
                {state.message}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" name="displayName" required maxLength={120} />
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
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Creating…" : "Register"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Already registered?{" "}
            <Link className="underline" href="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
