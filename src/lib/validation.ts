import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(2).max(160),
  type: z.enum(["text", "textarea", "select"]).optional().default("textarea"),
  options: z.array(z.string().min(1).max(80)).optional().default([]),
  conditional_on: z
    .object({
      question_id: z.string().min(1),
      equals: z.string().min(1),
    })
    .nullable()
    .optional(),
});

export const paymentMilestoneSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(80),
  amount: z.coerce.number().min(0).max(100000),
  due: z.enum(["onboarding", "midpoint", "final"]),
});

export const flowSchema = z.object({
  title: z.string().min(2).max(120),
  questions: z.array(questionSchema).min(1).max(12),
  contract_text: z.string().min(20),
  deposit_amount: z.coerce.number().min(0).max(100000),
  payment_schedule: z.array(paymentMilestoneSchema).min(1).max(3).optional(),
});

export const onboardingSchema = z.object({
  agency_name: z.string().min(2).max(120),
  questions: z.array(questionSchema).min(1).max(12),
  deposit_amount: z.coerce.number().min(0).max(100000),
  slot_datetime: z.string().min(1),
});

export const clientDetailsSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().default(""),
  answers: z.record(z.string(), z.string().max(3000)),
});

export const signatureSchema = z.object({
  signature_name: z.string().min(2).max(120),
});

export const bookingSchema = z.object({
  slot_id: z.string().uuid(),
});

export const notificationSchema = z.object({
  client_id: z.string().uuid(),
  event: z.enum(["link_sent", "intake_completed", "signed", "paid", "booked", "completed", "stalled"]),
});
