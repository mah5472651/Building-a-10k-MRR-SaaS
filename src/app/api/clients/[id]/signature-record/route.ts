import { NextResponse } from "next/server";
import { getClientDetail, requireCurrentAgency } from "@/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { agency } = await requireCurrentAgency();
  const detail = await getClientDetail(id, agency.id);
  if (!detail) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const { client, flow } = detail;
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Signature record - ${client.name ?? "Client"}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #132420; line-height: 1.5; }
    h1 { font-family: Georgia, serif; }
    dl { display: grid; grid-template-columns: 180px 1fr; gap: 8px 18px; }
    dt { color: #3E5750; font-weight: 700; }
    pre { white-space: pre-wrap; background: #EEF1EE; padding: 18px; border: 1px solid #D4D9D2; border-radius: 8px; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <button onclick="window.print()">Print / Save as PDF</button>
  <h1>Signature audit record</h1>
  <dl>
    <dt>Agency</dt><dd>${agency.name}</dd>
    <dt>Client</dt><dd>${client.name ?? ""} (${client.email ?? ""})</dd>
    <dt>Flow</dt><dd>${flow.title}</dd>
    <dt>Signed name</dt><dd>${client.signature_name ?? ""}</dd>
    <dt>Signed at</dt><dd>${client.signed_at ?? ""}</dd>
    <dt>IP address</dt><dd>${client.signature_ip ?? ""}</dd>
    <dt>User agent</dt><dd>${client.signature_user_agent ?? ""}</dd>
  </dl>
  <h2>Contract snapshot</h2>
  <pre>${escapeHtml(client.contract_snapshot ?? flow.contract_text)}</pre>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
