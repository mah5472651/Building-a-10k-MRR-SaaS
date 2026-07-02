import { Resend } from "resend";

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    return { skipped: true };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Aeitron AI <notifications@aeitron.local>",
    ...input,
  });
  return { skipped: false };
}

export function eventSubject(event: string) {
  const subjects: Record<string, string> = {
    intake_completed: "A client completed their intake",
    signed: "A client signed their agreement",
    paid: "A client paid their deposit",
    booked: "A client booked kickoff",
    completed: "Client onboarding is complete",
  };
  return subjects[event] ?? "Aeitron AI notification";
}
