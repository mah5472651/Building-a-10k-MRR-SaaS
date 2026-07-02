import { describe, expect, it } from "vitest";
import { clientDetailsSchema, signatureSchema, bookingSchema, notificationSchema } from "@/lib/validation";

describe("validation", () => {
  it("accepts valid client details", () => {
    const parsed = clientDetailsSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "",
      answers: { goals: "Launch cleanly" },
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects unsigned agreements", () => {
    expect(signatureSchema.safeParse({ signature_name: "" }).success).toBe(false);
  });

  it("requires UUID slots", () => {
    expect(bookingSchema.safeParse({ slot_id: "not-a-slot" }).success).toBe(false);
  });

  it("accepts realtime notification events", () => {
    const parsed = notificationSchema.safeParse({
      client_id: "00000000-0000-4000-8000-000000000000",
      event: "link_sent",
    });
    expect(parsed.success).toBe(true);
  });
});
