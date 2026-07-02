import type { Agency, Client } from "@/types/handoff";

export async function sendAgencyWebhook(input: {
  agency: Pick<Agency, "outbound_webhook_url" | "id" | "name">;
  event: string;
  client: Partial<Client>;
}) {
  if (!input.agency.outbound_webhook_url) return { skipped: true };

  try {
    const response = await fetch(input.agency.outbound_webhook_url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        event: input.event,
        agency: { id: input.agency.id, name: input.agency.name },
        client: input.client,
        sent_at: new Date().toISOString(),
      }),
    });
    return { skipped: false, ok: response.ok };
  } catch {
    return { skipped: false, ok: false };
  }
}
