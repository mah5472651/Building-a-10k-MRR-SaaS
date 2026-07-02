import { NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { eventSubject, sendTransactionalEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { createServiceSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceSupabase();
  const { data: clients } = await supabase
    .from("clients")
    .select("*, agency:agencies(*)")
    .neq("status", "completed");

  const now = Date.now();
  let sent = 0;

  for (const client of clients ?? []) {
    const agency = Array.isArray(client.agency) ? client.agency[0] : client.agency;
    const lastActive = new Date(client.last_active_at ?? client.created_at).getTime();
    const hoursInactive = (now - lastActive) / 36e5;
    const url = `${appUrl}/c/${client.unique_link_token}`;

    if (client.email && hoursInactive >= 24 && !client.reminder_24h_sent_at) {
      await sendTransactionalEmail({
        to: client.email,
        subject: `${agency.name} is waiting on your onboarding`,
        html: `<p>A quick reminder to finish your onboarding.</p><p><a href="${url}">Continue here</a></p>`,
      });
      if (client.phone && ["growth", "scale"].includes(agency.plan)) {
        await sendSms({ to: client.phone, body: `${agency.name}: finish onboarding here ${url}` });
      }
      await supabase
        .from("clients")
        .update({ reminder_24h_sent_at: new Date().toISOString() })
        .eq("id", client.id);
      sent += 1;
    }

    if (hoursInactive >= 72 && !client.reminder_3d_sent_at) {
      await sendTransactionalEmail({
        to: agency.email,
        subject: eventSubject("stalled"),
        html: `<p>${client.name ?? client.email ?? "A client"} has been inactive for 3 days.</p><p><a href="${url}">Open client link</a></p>`,
      });
      await supabase
        .from("clients")
        .update({ reminder_3d_sent_at: new Date().toISOString() })
        .eq("id", client.id);
      sent += 1;
    }
  }

  return NextResponse.json({ ok: true, sent });
}
