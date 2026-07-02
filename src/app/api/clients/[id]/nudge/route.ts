import { NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { requireCurrentAgency } from "@/lib/data";
import { sendTransactionalEmail } from "@/lib/email";
import { recordNotificationEvent } from "@/lib/notifications";
import { createServerSupabase } from "@/lib/supabase";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { agency } = await requireCurrentAgency();
  const supabase = await createServerSupabase();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("agency_id", agency.id)
    .single();

  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  if (!client.email) {
    await recordNotificationEvent({ agencyId: agency.id, clientId: client.id, event: "nudge_skipped_no_email" });
    return NextResponse.json({ ok: true, skipped: true });
  }

  const url = `${appUrl}/c/${client.unique_link_token}`;
  const result = await sendTransactionalEmail({
    to: client.email,
    subject: `${agency.name}: quick onboarding reminder`,
    html: `
      <p>Hi ${client.name ?? "there"},</p>
      <p>A quick reminder to finish your onboarding with ${agency.name}.</p>
      <p><a href="${url}">Continue your handoff here</a></p>
    `,
  });

  await recordNotificationEvent({
    agencyId: agency.id,
    clientId: client.id,
    event: "manual_nudge",
    sentAt: result.skipped ? null : new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, ...result });
}
