import { NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { requireCurrentAgency } from "@/lib/data";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { agency } = await requireCurrentAgency();
  const { payment_event_id: paymentEventId } = await request.json();
  if (!paymentEventId) return NextResponse.json({ error: "Missing payment event." }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data: event } = await supabase
    .from("payment_events")
    .select("*,client:clients(unique_link_token)")
    .eq("id", String(paymentEventId))
    .eq("agency_id", agency.id)
    .single();

  if (!event) return NextResponse.json({ error: "Payment event not found." }, { status: 404 });

  const client = Array.isArray(event.client) ? event.client[0] : event.client;
  const retryUrl = client?.unique_link_token ? `${appUrl}/c/${client.unique_link_token}/deposit` : `${appUrl}/billing`;

  await createServiceSupabase()
    .from("payment_events")
    .update({ status: "open", failure_reason: "Retry link generated" })
    .eq("id", String(paymentEventId));

  return NextResponse.json({ ok: true, retryUrl });
}
