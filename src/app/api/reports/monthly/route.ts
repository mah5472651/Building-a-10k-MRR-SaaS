import { NextRequest, NextResponse } from "next/server";
import { getAgencyAnalytics } from "@/lib/analytics";
import { requireCurrentAgency } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { agency } = await requireCurrentAgency();
  const analytics = await getAgencyAnalytics(agency.id);
  const month = request.nextUrl.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const generatedAt = new Date().toLocaleString("en", { dateStyle: "medium", timeStyle: "short" });
  const collected = analytics.cohorts.reduce((sum, cohort) => sum + cohort.ltv, 0);
  const totalClients = analytics.bottlenecks[0]?.current ?? 0;
  const completed = analytics.bottlenecks[3]?.next ?? 0;
  const conversion = totalClients ? Math.round((completed / totalClients) * 100) : 0;

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(agency.name)} Monthly Report</title>
  <style>
    body { margin: 0; background: #f7f8fb; color: #161a24; font-family: Inter, Arial, sans-serif; }
    main { max-width: 980px; margin: 0 auto; padding: 40px 24px; }
    header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; border-bottom: 1px solid #d9deea; padding-bottom: 22px; }
    h1 { margin: 0; font-size: 30px; line-height: 1.1; }
    h2 { margin: 28px 0 12px; font-size: 18px; }
    .muted { color: #687086; font-size: 13px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 22px; }
    .card { background: white; border: 1px solid #d9deea; border-radius: 14px; padding: 16px; box-shadow: 0 10px 30px rgba(26, 33, 52, 0.06); }
    .value { margin-top: 8px; font-family: "IBM Plex Mono", monospace; font-size: 24px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #d9deea; border-radius: 14px; overflow: hidden; }
    th, td { border-bottom: 1px solid #eef1f7; padding: 10px 12px; text-align: left; font-size: 13px; }
    th { background: #111827; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; }
    tr:last-child td { border-bottom: 0; }
    button { border: 0; border-radius: 999px; padding: 10px 16px; background: #111827; color: #fff0ce; cursor: pointer; }
    @media print { button { display: none; } body { background: white; } main { padding: 0; } .card, table { box-shadow: none; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        ${agency.logo_url ? `<img src="${escapeHtml(agency.logo_url)}" alt="" style="width:48px;height:48px;border-radius:12px;object-fit:cover;margin-bottom:12px" />` : ""}
        <p class="muted">Aeitron AI performance report</p>
        <h1>${escapeHtml(agency.name)} Monthly Report</h1>
        <p class="muted">Month ${escapeHtml(month)} · Generated ${escapeHtml(generatedAt)}</p>
      </div>
      <button onclick="window.print()">Print / Save PDF</button>
    </header>

    <section class="grid">
      <div class="card"><span class="muted">Pending revenue</span><div class="value">$${analytics.revenue.pending.toFixed(2)}</div></div>
      <div class="card"><span class="muted">At-risk revenue</span><div class="value">$${analytics.revenue.atRisk.toFixed(2)}</div></div>
      <div class="card"><span class="muted">Potential lost this month</span><div class="value">$${analytics.revenue.potentialLostThisMonth.toFixed(2)}</div></div>
    </section>
    <section class="grid">
      <div class="card"><span class="muted">Total clients</span><div class="value">${totalClients}</div></div>
      <div class="card"><span class="muted">Revenue collected</span><div class="value">$${collected.toFixed(2)}</div></div>
      <div class="card"><span class="muted">Conversion rate</span><div class="value">${conversion}%</div></div>
    </section>

    <h2>Revenue Leak Detector</h2>
    <table>
      <thead><tr><th>Client</th><th>Stage stuck</th><th>Value</th><th>Days stalled</th></tr></thead>
      <tbody>${analytics.revenue.rows.slice(0, 12).map((row) => `
        <tr>
          <td>${escapeHtml(row.client.name ?? "Unnamed client")}</td>
          <td>${escapeHtml(row.stage)}</td>
          <td>$${row.value.toFixed(2)}</td>
          <td>${row.daysStalled}</td>
        </tr>`).join("") || `<tr><td colspan="4">No stuck revenue this month.</td></tr>`}
      </tbody>
    </table>

    <h2>Bottleneck Analysis</h2>
    <table>
      <thead><tr><th>Stage</th><th>Entered</th><th>Next step</th><th>Drop-off</th></tr></thead>
      <tbody>${analytics.bottlenecks.map((row) => `
        <tr><td>${escapeHtml(row.label)}</td><td>${row.current}</td><td>${row.next}</td><td>${row.drop}%</td></tr>
      `).join("")}</tbody>
    </table>

    <h2>Priority Follow-ups</h2>
    <table>
      <thead><tr><th>Client</th><th>Reason</th><th>Score</th></tr></thead>
      <tbody>${analytics.followUps.map((row) => `
        <tr><td>${escapeHtml(row.client.name ?? "Unnamed client")}</td><td>${escapeHtml(row.reason)}</td><td>${row.score}</td></tr>
      `).join("") || `<tr><td colspan="3">No priority follow-ups right now.</td></tr>`}</tbody>
    </table>
  </main>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
