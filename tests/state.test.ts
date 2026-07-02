import { describe, expect, it } from "vitest";
import { completedStepCount, isSubscriptionUsable, nextClientPath } from "@/lib/state";

const baseClient = {
  name: null,
  signed_at: null,
  paid_at: null,
  scheduled_at: null,
};

describe("client state", () => {
  it("counts completed client steps", () => {
    expect(completedStepCount(baseClient)).toBe(0);
    expect(completedStepCount({ ...baseClient, name: "Ada" })).toBe(1);
    expect(
      completedStepCount({
        ...baseClient,
        name: "Ada",
        signed_at: "2026-07-02T00:00:00Z",
        paid_at: "2026-07-02T00:00:00Z",
        scheduled_at: "2026-07-03T00:00:00Z",
      }),
    ).toBe(4);
  });

  it("routes clients to the next incomplete step", () => {
    expect(nextClientPath("token", baseClient)).toBe("/c/token");
    expect(nextClientPath("token", { ...baseClient, name: "Ada" })).toBe("/c/token/agreement");
    expect(nextClientPath("token", { ...baseClient, name: "Ada", signed_at: "x" })).toBe("/c/token/deposit");
    expect(nextClientPath("token", { ...baseClient, name: "Ada", signed_at: "x", paid_at: "x" })).toBe(
      "/c/token/kickoff",
    );
  });
});

describe("subscription state", () => {
  it("allows active, trialing, and unexpired trials", () => {
    expect(isSubscriptionUsable("active", null)).toBe(true);
    expect(isSubscriptionUsable("trialing", null)).toBe(true);
    expect(isSubscriptionUsable("past_due", "2999-01-01T00:00:00Z")).toBe(true);
    expect(isSubscriptionUsable("canceled", "2000-01-01T00:00:00Z")).toBe(false);
  });
});
