"use client";

import { useActionState } from "react";
import { CircleAlert, Loader2, UserPlus } from "lucide-react";

import {
  addOrgMemberAction,
  changeOrgMemberRoleAction,
  removeOrgMemberAction,
  type OrgMemberActionState,
} from "@/app/actions/org-members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ORG_MEMBER_ROLES,
  ORG_ROLE_LABELS,
  type OrgMemberRole,
} from "@/modules/auth/roles";

const initial: OrgMemberActionState = { ok: true };

const selectClassName =
  "flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function StatusMessage({ state }: { state: OrgMemberActionState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={
        state.ok
          ? "bg-secondary/60 rounded-lg px-3 py-2 text-sm"
          : "bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg px-3 py-2 text-sm"
      }
    >
      {!state.ok ? (
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      ) : null}
      {state.message}
    </p>
  );
}

export function AddOrgMemberForm({
  organizationId,
}: {
  organizationId: string;
}) {
  const [state, formAction, pending] = useActionState(
    addOrgMemberAction,
    initial,
  );

  return (
    <form
      action={formAction}
      className="border-border bg-card space-y-5 rounded-2xl border p-6 shadow-sm"
    >
      <input type="hidden" name="organizationId" value={organizationId} />
      <header className="flex items-start gap-3">
        <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
          <UserPlus className="size-5" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold">Add a member</h2>
          <p className="text-muted-foreground text-sm">
            They must already have an AccessPath account registered as an
            individual.
          </p>
        </div>
      </header>
      <StatusMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_11rem]">
        <div className="space-y-2">
          <Label htmlFor="member-email">Account email</Label>
          <Input
            id="member-email"
            name="email"
            type="email"
            required
            placeholder="name@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="member-role">Role</Label>
          <select
            id="member-role"
            name="role"
            defaultValue="caseworker"
            className={selectClassName}
          >
            {ORG_MEMBER_ROLES.map((role) => (
              <option key={role} value={role}>
                {ORG_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Adding…
          </>
        ) : (
          "Add member"
        )}
      </Button>
    </form>
  );
}

export function OrgMemberRow({
  organizationId,
  membershipId,
  currentRole,
  isSelf,
}: {
  organizationId: string;
  membershipId: string;
  currentRole: OrgMemberRole;
  isSelf: boolean;
}) {
  const [roleState, roleAction, rolePending] = useActionState(
    changeOrgMemberRoleAction,
    initial,
  );
  const [removeState, removeAction, removePending] = useActionState(
    removeOrgMemberAction,
    initial,
  );

  return (
    <div className="border-border space-y-3 border-t pt-4">
      <div className="flex flex-wrap items-end gap-2">
        <form
          action={roleAction}
          className="flex min-w-0 flex-1 flex-wrap items-end gap-2"
        >
          <input type="hidden" name="organizationId" value={organizationId} />
          <input type="hidden" name="membershipId" value={membershipId} />
          <div className="min-w-[10rem] flex-1 space-y-1">
            <Label htmlFor={`role-${membershipId}`}>Change role</Label>
            <select
              id={`role-${membershipId}`}
              name="role"
              defaultValue={currentRole}
              className={selectClassName}
            >
              {ORG_MEMBER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ORG_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={rolePending}
          >
            {rolePending ? "Saving…" : "Save role"}
          </Button>
        </form>
        <form action={removeAction}>
          <input type="hidden" name="organizationId" value={organizationId} />
          <input type="hidden" name="membershipId" value={membershipId} />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            disabled={removePending}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {removePending ? "Removing…" : isSelf ? "Leave team" : "Remove"}
          </Button>
        </form>
      </div>
      <StatusMessage state={roleState} />
      <StatusMessage state={removeState} />
    </div>
  );
}
