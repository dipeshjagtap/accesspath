import { describe, expect, it } from "vitest";

import {
  hasUnreadUpdate,
  isAwaitingUserConfirmation,
  needsUserAttention,
  statusAfterReceipt,
} from "@/modules/cases/receipt";
import { canTransition } from "@/modules/cases/transitions";

const base = {
  status: "in_progress",
  userConfirmation: null,
  lastUserNotifiedAt: null,
  userSeenAt: null,
} as const;

describe("user receipt confirmation", () => {
  it("asks for confirmation only after the org records delivery", () => {
    expect(isAwaitingUserConfirmation({ ...base })).toBe(false);
    expect(
      isAwaitingUserConfirmation({ ...base, status: "assistance_delivered" }),
    ).toBe(true);
    expect(
      isAwaitingUserConfirmation({ ...base, status: "partially_delivered" }),
    ).toBe(true);
  });

  it("stops asking once the person has answered", () => {
    expect(
      isAwaitingUserConfirmation({
        ...base,
        status: "assistance_delivered",
        userConfirmation: "received",
      }),
    ).toBe(false);
  });

  it("keeps the status when received, reopens when partly or not received", () => {
    expect(statusAfterReceipt("received", "assistance_delivered")).toBe(
      "assistance_delivered",
    );
    expect(statusAfterReceipt("partly_received", "assistance_delivered")).toBe(
      "partially_delivered",
    );
    expect(statusAfterReceipt("not_received", "assistance_delivered")).toBe(
      "unresolved",
    );
  });

  it("lets the organisation resume work after a disputed delivery", () => {
    expect(canTransition("partially_delivered", "in_progress")).toBe(true);
    expect(canTransition("unresolved", "in_progress")).toBe(true);
  });
});

describe("in-app update tracking", () => {
  const t1 = new Date("2026-10-17T10:00:00Z");
  const t2 = new Date("2026-10-17T11:00:00Z");

  it("flags updates the person has not opened yet", () => {
    expect(hasUnreadUpdate({ ...base })).toBe(false);
    expect(hasUnreadUpdate({ ...base, lastUserNotifiedAt: t1 })).toBe(true);
    expect(
      hasUnreadUpdate({ ...base, lastUserNotifiedAt: t2, userSeenAt: t1 }),
    ).toBe(true);
    expect(
      hasUnreadUpdate({ ...base, lastUserNotifiedAt: t1, userSeenAt: t2 }),
    ).toBe(false);
  });

  it("needs attention when unread or awaiting confirmation", () => {
    expect(
      needsUserAttention({
        ...base,
        status: "assistance_delivered",
        lastUserNotifiedAt: t1,
        userSeenAt: t2,
      }),
    ).toBe(true);
    expect(needsUserAttention({ ...base })).toBe(false);
  });
});
