import { NextResponse } from "next/server";
import { requireCurrentAgency } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { agency } = await requireCurrentAgency();
  const supabase = await createServerSupabase();

  const { error } = await supabase
    .from("available_slots")
    .delete()
    .eq("id", id)
    .eq("agency_id", agency.id)
    .eq("is_booked", false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
