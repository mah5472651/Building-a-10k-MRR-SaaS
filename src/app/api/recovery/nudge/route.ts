import { NextRequest, NextResponse } from "next/server";
import { requireCurrentAgency } from "@/lib/data";
import { sendTransactionalEmail } from "@/lib/email";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { agency } = await requireCurrentAgency();
  const { payment_event_id: paymentEventId } = await request.json();

  if (!paymentEventId) {
    return NextResponse.json({ error: "Missing payment event." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: event } = await supabase
    .from("payment_events")
    .select("*,client:clients(name,email)")
    .eq("id", String(paymentEventId))
    .eq("agency_id", agency.id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Payment event not found." }, { status: 404 });
  }

  const client = Array.isArray(event.client) ? event.client[0] : event.client;
  if (!client?.email) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await sendTransactionalEmail({
    to: client.email,
    subject: `${agency.name}: payment retry link`,
    html: `
      <p>Hi ${client.name ?? "there"},</p>
      <p>Your onboarding deposit payment did not go through. Please reopen your Aeitron AI handoff link and retry the deposit step.</p>
      <p>If you need help, reply to this email and ${agency.name} will follow up.</p>
    `,
  });

  await createServiceSupabase()
    .from("payment_events")
    .update({ status: "open", failure_reason: "Recovery email sent" })
    .eq("id", String(paymentEventId))
    .eq("agency_id", agency.id);

  return NextResponse.json({ ok: true, skipped: false });
}
