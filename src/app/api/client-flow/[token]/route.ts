import { NextRequest, NextResponse } from "next/server";
import { getClientBundleByToken } from "@/lib/data";
import { clientDetailsSchema, signatureSchema, bookingSchema } from "@/lib/validation";
import { createServiceSupabase } from "@/lib/supabase";
import { sendTransactionalEmail, eventSubject } from "@/lib/email";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const bundle = await getClientBundleByToken(token);
  if (!bundle) return NextResponse.json({ error: "Invalid client link." }, { status: 404 });
  await createServiceSupabase()
    .from("clients")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", bundle.client.id);
  return NextResponse.json(bundle);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const body = await request.json();
  const action = String(body.action ?? "");
  const bundle = await getClientBundleByToken(token);
  if (!bundle) return NextResponse.json({ error: "Invalid client link." }, { status: 404 });

  const supabase = createServiceSupabase();

  if (action === "details") {
    const parsed = clientDetailsSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await supabase
      .from("clients")
      .update({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        answers: parsed.data.answers,
        status: "in_progress",
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bundle.client.id);
    await notifyAgency(bundle.agency.email, "intake_completed", parsed.data.name);
    return NextResponse.json({ ok: true, next: `/c/${token}/agreement` });
  }

  if (action === "signature") {
    const parsed = signatureSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    const userAgent = request.headers.get("user-agent") ?? "unknown";

    await supabase
      .from("clients")
      .update({
        signature_name: parsed.data.signature_name,
        signature_ip: ip,
        signature_user_agent: userAgent,
        contract_snapshot: bundle.flow.contract_text,
        signed_at: new Date().toISOString(),
        status: "in_progress",
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bundle.client.id);
    await notifyAgency(bundle.agency.email, "signed", parsed.data.signature_name);
    return NextResponse.json({ ok: true, next: `/c/${token}/deposit` });
  }

  if (action === "booking") {
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { data: slot } = await supabase
      .from("available_slots")
      .select("*")
      .eq("id", parsed.data.slot_id)
      .eq("agency_id", bundle.agency.id)
      .eq("is_booked", false)
      .single();

    if (!slot) return NextResponse.json({ error: "Slot is no longer available." }, { status: 409 });

    await supabase
      .from("available_slots")
      .update({ is_booked: true, client_id: bundle.client.id })
      .eq("id", slot.id);

    await supabase
      .from("clients")
      .update({
        scheduled_at: slot.datetime,
        meeting_time: slot.datetime,
        status: "completed",
        last_active_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bundle.client.id);

    await notifyAgency(bundle.agency.email, "booked", bundle.client.name ?? "A client");
    if (bundle.client.email) {
      await sendTransactionalEmail({
        to: bundle.client.email,
        subject: "Your kickoff is booked",
        html: `<p>${bundle.agency.name} has been notified. See you at kickoff.</p><p>${new Date(slot.datetime).toLocaleString()}</p>`,
      });
    }
    return NextResponse.json({ ok: true, next: `/c/${token}/confirmation` });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}

async function notifyAgency(to: string, event: string, clientName: string) {
  await sendTransactionalEmail({
    to,
    subject: eventSubject(event),
    html: `<p>${clientName} updated their Aeitron AI onboarding.</p>`,
  });
}
