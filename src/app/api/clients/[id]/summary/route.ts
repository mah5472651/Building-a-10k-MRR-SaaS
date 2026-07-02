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

  const { client, flow, files } = detail;
  const answers = flow.questions
    .map((question) => `<dt>${escapeHtml(question.label)}</dt><dd>${escapeHtml(client.answers?.[question.id] ?? "")}</dd>`)
    .join("");
  const uploadedFiles = files.length
    ? files.map((file) => `<li>${escapeHtml(file.file_name)} (${Math.round(Number(file.file_size ?? 0) / 1024)} KB)</li>`).join("")
    : "<li>No files uploaded</li>";

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Onboarding summary - ${escapeHtml(client.name ?? "Client")}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #132420; line-height: 1.5; }
    h1, h2 { font-family: Georgia, serif; }
    section { border-top: 1px solid #D4D9D2; padding: 18px 0; }
    dl { display: grid; grid-template-columns: 180px 1fr; gap: 8px 18px; }
    dt { color: #3E5750; font-weight: 700; }
    dd { margin: 0; }
    button { background: #132420; color: #F2C94C; border: 0; border-radius: 8px; padding: 10px 14px; }
    @media print { button { display: none; } body { margin: 24px; } }
  </style>
</head>
<body>
  <button onclick="window.print()">Print / Save as PDF</button>
  <h1>Onboarding summary</h1>
  <section>
    <dl>
      <dt>Agency</dt><dd>${escapeHtml(agency.name)}</dd>
      <dt>Client</dt><dd>${escapeHtml(client.name ?? "")} (${escapeHtml(client.email ?? "")})</dd>
      <dt>Phone</dt><dd>${escapeHtml(client.phone ?? "")}</dd>
      <dt>Flow</dt><dd>${escapeHtml(flow.title)}</dd>
      <dt>Status</dt><dd>${escapeHtml(client.status)}</dd>
      <dt>Deposit</dt><dd>$${Number(client.amount_paid ?? 0).toFixed(2)} paid ${escapeHtml(client.paid_at ?? "")}</dd>
      <dt>Kickoff</dt><dd>${escapeHtml(client.meeting_time ?? client.scheduled_at ?? "")}</dd>
    </dl>
  </section>
  <section>
    <h2>Intake answers</h2>
    <dl>${answers}</dl>
  </section>
  <section>
    <h2>Signature</h2>
    <dl>
      <dt>Signed name</dt><dd>${escapeHtml(client.signature_name ?? "")}</dd>
      <dt>Signed at</dt><dd>${escapeHtml(client.signed_at ?? "")}</dd>
      <dt>IP address</dt><dd>${escapeHtml(client.signature_ip ?? "")}</dd>
    </dl>
  </section>
  <section>
    <h2>Files</h2>
    <ul>${uploadedFiles}</ul>
  </section>
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
