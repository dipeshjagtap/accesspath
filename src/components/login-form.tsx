"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, type AuthActionState } from "@/app/actions/auth";
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

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-brand-dark text-2xl font-bold">
          Sign in
        </CardTitle>
        <CardDescription>
          Use a demo account from the seed script, or your registered email.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <form action={formAction} className="space-y-4">
          {state.message ? (
            <p role="alert" className="text-destructive text-sm">
              {state.message}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
              toggleLabel="Show password"
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-full"
            disabled={pending}
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-muted-foreground mt-4 text-sm">
          No account?{" "}
          <Link className="underline" href="/register">
            Register
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
