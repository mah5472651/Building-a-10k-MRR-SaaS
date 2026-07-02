import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";
import { requireCurrentAgency } from "@/lib/data";
import { notificationSchema } from "@/lib/validation";
import { eventSubject, sendTransactionalEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { agency } = await requireCurrentAgency();
  const parsed = notificationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", parsed.data.client_id)
    .eq("agency_id", agency.id)
    .single();

  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const result = await sendTransactionalEmail({
    to: agency.email,
    subject: eventSubject(parsed.data.event),
    html: `<p>${client.name ?? "A client"} triggered ${parsed.data.event}.</p>`,
  });

  await supabase.from("notification_events").insert({
    agency_id: agency.id,
    client_id: client.id,
    event: parsed.data.event,
    sent_at: result.skipped ? null : new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, ...result });
}
