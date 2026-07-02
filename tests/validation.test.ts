import { describe, expect, it } from "vitest";
import { clientDetailsSchema, signatureSchema, bookingSchema } from "@/lib/validation";

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
});
