import { NextResponse } from "next/server";
import { requireCurrentAgency } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase";

export async function GET() {
  const { agency } = await requireCurrentAgency();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("notification_events")
    .select("*,client:clients(name,email)")
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data ?? [] });
}
