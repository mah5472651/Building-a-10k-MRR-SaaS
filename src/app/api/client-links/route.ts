import { NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { canGenerateClientLink, getActiveFlow, requireCurrentAgency } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase";

export async function POST() {
  const { agency } = await requireCurrentAgency();
  if (!canGenerateClientLink(agency)) {
    return NextResponse.json({ error: "Subscription required to generate new client links." }, { status: 402 });
  }

  const flow = await getActiveFlow(agency.id);
  if (!flow) {
    return NextResponse.json({ error: "Create an onboarding flow first." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("clients")
    .insert({ agency_id: agency.id, flow_id: flow.id })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not create client link." }, { status: 500 });
  }

  return NextResponse.json({
    client: data,
    url: `${appUrl}/c/${data.unique_link_token}`,
  });
}
