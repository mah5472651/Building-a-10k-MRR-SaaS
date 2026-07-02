import { createServiceSupabase } from "./supabase";

export async function recordNotificationEvent(input: {
  agencyId: string;
  clientId?: string | null;
  event: string;
  sentAt?: string | null;
}) {
  await createServiceSupabase().from("notification_events").insert({
    agency_id: input.agencyId,
    client_id: input.clientId ?? null,
    event: input.event,
    sent_at: input.sentAt ?? null,
  });
}
