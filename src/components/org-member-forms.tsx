"use client";

import { useActionState } from "react";

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
  "flex min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

function StatusMessage({ state }: { state: OrgMemberActionState }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={
        state.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"
      }
    >
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
      className="space-y-3 rounded-lg border border-border p-4"
    >
      <input type="hidden" name="organizationId" value={organizationId} />
      <StatusMessage state={state} />
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <div className="space-y-2">
          <Label htmlFor="member-email">Account email</Label>
          <Input id="member-email" name="email" type="email" required />
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
      <p className="text-xs text-muted-foreground">
        The person must already have an AccessPath account (registered as an
        individual).
      </p>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Adding…" : "Add member"}
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
    <div className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <form action={roleAction} className="flex items-end gap-2">
          <input type="hidden" name="organizationId" value={organizationId} />
          <input type="hidden" name="membershipId" value={membershipId} />
          <div className="space-y-1">
            <Label htmlFor={`role-${membershipId}`} className="sr-only">
              Role
            </Label>
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
          <Button type="submit" size="sm" variant="outline" disabled={rolePending}>
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
            className="text-destructive"
          >
            {removePending ? "Removing…" : isSelf ? "Leave" : "Remove"}
          </Button>
        </form>
      </div>
      <StatusMessage state={roleState} />
      <StatusMessage state={removeState} />
    </div>
  );
}
