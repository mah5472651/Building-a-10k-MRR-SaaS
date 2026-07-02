import { NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { eventSubject, sendTransactionalEmail } from "@/lib/email";
import { defaultAlertRules } from "@/lib/analytics";
import { sendSms } from "@/lib/sms";
import { createServiceSupabase } from "@/lib/supabase";
import type { AlertRule, Client } from "@/types/handoff";

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
    const stage = getStuckStage(client);
    const customRule = getEnabledRule(agency.alert_rules, stage);

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

    if (customRule && hoursInactive >= customRule.threshold_hours) {
      const eventName = `custom_alert_${stage}`;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: existingAlert } = await supabase
        .from("notification_events")
        .select("id")
        .eq("agency_id", agency.id)
        .eq("client_id", client.id)
        .eq("event", eventName)
        .gte("created_at", today.toISOString())
        .maybeSingle();
      if (existingAlert) continue;

      await sendTransactionalEmail({
        to: agency.email,
        subject: `Aeitron AI alert: ${customRule.name}`,
        html: `<p>${client.name ?? client.email ?? "A client"} matched your alert rule: ${customRule.name}.</p><p>Stage: ${stage}. Inactive for ${Math.round(hoursInactive)} hours.</p><p><a href="${url}">Open client link</a></p>`,
      });
      await supabase.from("notification_events").insert({
        agency_id: agency.id,
        client_id: client.id,
        event: eventName,
        sent_at: new Date().toISOString(),
      });
      sent += 1;
    }
  }

  return NextResponse.json({ ok: true, sent });
}

function getEnabledRule(rules: AlertRule[] | null | undefined, stage: string) {
  const rows = Array.isArray(rules) && rules.length ? rules : defaultAlertRules;
  return rows.find((rule) => rule.enabled && rule.stage === stage);
}

function getStuckStage(client: Client) {
  if (!client.name) return "details";
  if (!client.signed_at) return "agreement";
  if (!client.paid_at) return "deposit";
  if (!client.scheduled_at) return "kickoff";
  return "kickoff";
}
