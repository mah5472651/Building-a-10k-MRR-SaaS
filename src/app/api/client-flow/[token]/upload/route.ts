import { NextRequest, NextResponse } from "next/server";
import { getClientBundleByToken } from "@/lib/data";
import { createServiceSupabase } from "@/lib/supabase";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const bundle = await getClientBundleByToken(token);
  if (!bundle) return NextResponse.json({ error: "Invalid client link." }, { status: 404 });

  const form = await request.formData();
  const files = form.getAll("files").filter((item): item is File => item instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files uploaded." }, { status: 400 });

  const supabase = createServiceSupabase();
  const saved = [];

  for (const file of files.slice(0, 6)) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${bundle.agency.id}/${bundle.client.id}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage
      .from("client-uploads")
      .upload(path, file, { contentType: file.type || "application/octet-stream" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data } = await supabase
      .from("client_files")
      .insert({
        agency_id: bundle.agency.id,
        client_id: bundle.client.id,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        mime_type: file.type,
      })
      .select("*")
      .single();
    saved.push(data);
  }

  await supabase
    .from("clients")
    .update({ last_active_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", bundle.client.id);

  return NextResponse.json({ files: saved });
}
