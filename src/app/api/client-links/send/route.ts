import { NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { requireCurrentAgency } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase";
import { sendTransactionalEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const { agency } = await requireCurrentAgency();
  const { client_id, email } = await request.json();

  if (!client_id || !email) {
    return NextResponse.json({ error: "Client and email are required." }, { status: 400 });
  }

  const supabase = await createServerSupabase();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", client_id)
    .eq("agency_id", agency.id)
    .single();

  if (!client) return NextResponse.json({ error: "Client link not found." }, { status: 404 });

  await supabase.from("clients").update({ email }).eq("id", client.id);

  const url = `${appUrl}/c/${client.unique_link_token}`;
  const result = await sendTransactionalEmail({
    to: email,
    subject: `${agency.name} sent your onboarding link`,
    html: `<p>${agency.name} sent your onboarding link.</p><p><a href="${url}">Start onboarding</a></p>`,
  });

  return NextResponse.json({ ok: true, url, ...result });
}
