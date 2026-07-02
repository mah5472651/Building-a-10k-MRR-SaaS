import { NextResponse } from "next/server";
import { requireCurrentAgency } from "@/lib/data";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { agency } = await requireCurrentAgency();
  const supabase = await createServerSupabase();
  const { data: file } = await supabase
    .from("client_files")
    .select("*")
    .eq("id", id)
    .eq("agency_id", agency.id)
    .single();

  if (!file) return NextResponse.json({ error: "File not found." }, { status: 404 });

  const { data, error } = await createServiceSupabase()
    .storage
    .from("client-uploads")
    .createSignedUrl(file.file_path, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Could not create download URL." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
