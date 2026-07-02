import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(2).max(160),
});

export const flowSchema = z.object({
  title: z.string().min(2).max(120),
  questions: z.array(questionSchema).min(1).max(12),
  contract_text: z.string().min(20),
  deposit_amount: z.coerce.number().min(0).max(100000),
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
  event: z.enum(["intake_completed", "signed", "paid", "booked", "completed"]),
});
