import { NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { canGenerateClientLink, requireCurrentAgency } from "@/lib/data";
import { recordNotificationEvent } from "@/lib/notifications";
import { createServerSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { agency } = await requireCurrentAgency();
  if (!canGenerateClientLink(agency)) {
    return NextResponse.json({ error: "Subscription required to generate new client links." }, { status: 402 });
  }

  const body = await request.json().catch(() => ({}));
  const requestedFlowId = typeof body.flow_id === "string" ? body.flow_id : "";
  const supabase = await createServerSupabase();
  const flowQuery = supabase
    .from("onboarding_flows")
    .select("*")
    .eq("agency_id", agency.id);
  const { data: flow } = requestedFlowId
    ? await flowQuery.eq("id", requestedFlowId).single()
    : await flowQuery.eq("active", true).limit(1).single();
  if (!flow) {
    return NextResponse.json({ error: "Create an onboarding flow first." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({ agency_id: agency.id, flow_id: flow.id })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not create client link." }, { status: 500 });
  }

  await recordNotificationEvent({ agencyId: agency.id, clientId: data.id, event: "link_sent" });

  return NextResponse.json({
    client: data,
    url: `${appUrl}/c/${data.unique_link_token}`,
  });
}
