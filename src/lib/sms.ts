import { hasTwilioEnv } from "./env";

export async function sendSms(input: { to?: string | null; body: string }) {
  if (!input.to || !hasTwilioEnv()) return { skipped: true };

  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER!;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        authorization: `Basic ${credentials}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        From: from,
        To: input.to,
        Body: input.body,
      }),
    },
  );

  if (!response.ok) return { skipped: false, error: await response.text() };
  return { skipped: false };
}
