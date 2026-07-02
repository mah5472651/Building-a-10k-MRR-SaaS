import Link from "next/link";
import { BellRing, Download, Mail, Phone, TrendingDown } from "lucide-react";
import { AgencyShell } from "@/components/agency-shell";
import { RecoveryButton } from "@/components/recovery-button";
import { defaultAlertRules, getAgencyAnalytics } from "@/lib/analytics";
import { requireCurrentAgency } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { agency } = await requireCurrentAgency();
  const analytics = await getAgencyAnalytics(agency.id);
  const alertRules = agency.alert_rules?.length ? agency.alert_rules : defaultAlertRules;

  return (
    <AgencyShell title="Analytics" active="Analytics" agencyId={agency.id}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-sm text-[var(--ink-soft)]">
          Revenue leakage, bottlenecks, close timing, recovery, alerts, and owner-ready reporting.
        </p>
        <Link className="btn-primary grid place-items-center gap-2 px-4 text-sm md:inline-flex" href="/api/reports/monthly" target="_blank">
          <Download size={15} />
          Monthly report
        </Link>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Metric label="Pending revenue" value={`$${analytics.revenue.pending.toFixed(2)}`} />
        <Metric label="At-risk revenue" value={`$${analytics.revenue.atRisk.toFixed(2)}`} tone="danger" />
        <Metric label="Potential lost this month" value={`$${analytics.revenue.potentialLostThisMonth.toFixed(2)}`} tone="warning" />
      </div>

      <section className="console-panel mb-4 overflow-hidden p-0">
        <PanelHeader title="Revenue Leak Detector" action="Client | Stage | Value | Days | Action" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">
              <tr>
                <th className="px-5 py-3">Client name</th>
                <th className="px-3 py-3">Stage stuck</th>
                <th className="px-3 py-3">Value</th>
                <th className="px-3 py-3">Days stalled</th>
                <th className="px-3 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {analytics.revenue.rows.slice(0, 8).map((row) => (
                <tr className="border-t border-[var(--line)]" key={row.client.id}>
                  <td className="px-5 py-3">{row.client.name ?? "Unnamed client"}</td>
                  <td className="px-3 py-3">{row.stage}</td>
                  <td className="px-3 py-3 font-mono">${row.value.toFixed(2)}</td>
                  <td className={row.atRisk ? "px-3 py-3 text-[var(--red)]" : "px-3 py-3"}>{row.daysStalled}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <Link className="btn-secondary grid min-h-8 place-items-center px-3 text-xs" href={`/clients/${row.client.id}`}>Nudge</Link>
                      <a className="btn-secondary inline-flex min-h-8 items-center gap-2 px-3 text-xs" href={row.client.phone ? `tel:${row.client.phone}` : `/clients/${row.client.id}`}>
                        <Phone size={13} />
                        Call
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="console-panel p-5">
          <PanelHeader title="Bottleneck Heatmap" action={`Worst: ${analytics.biggestBottleneck.label}`} />
          <div className="space-y-4">
            {analytics.bottlenecks.map((row) => (
              <div key={row.key}>
                <div className="mb-1 flex justify-between text-xs text-[var(--ink-soft)]">
                  <span>{row.label}</span>
                  <span>{row.drop}% drop</span>
                </div>
                <div className="h-3 rounded-full bg-white/[0.05]">
                  <div className="h-3 rounded-full bg-gradient-to-r from-[var(--violet-600)] to-[var(--red)]" style={{ width: `${Math.max(row.drop, 4)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-xl border border-[var(--line)] bg-white/[0.04] p-3 text-sm text-[var(--ink-soft)]">
            Suggestion: if Agreement has the highest drop, simplify agreement copy and strengthen reassurance text in the flow editor.
          </p>
        </section>

        <section className="console-panel p-5">
          <PanelHeader title="Flow Conversion Compare" action="Multiple flows" />
          <div className="space-y-3">
            {analytics.flowComparison.map((row) => (
              <div className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-3" key={row.flow.id}>
                <div className="flex justify-between text-sm">
                  <span>{row.flow.title}</span>
                  <span>{row.conversion}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/[0.05]">
                  <div className="h-2 rounded-full bg-[var(--teal)]" style={{ width: `${row.conversion}%` }} />
                </div>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">{row.completed}/{row.total} completed</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="console-panel p-5">
          <PanelHeader title="Time-to-Close Analytics" action={`${analytics.timeToClose.totalHours}h total avg`} />
          <div className="grid gap-3 md:grid-cols-3">
            <Metric label="Created to signed" value={`${analytics.timeToClose.createdToSignedHours}h`} />
            <Metric label="Signed to paid" value={`${analytics.timeToClose.signedToPaidHours}h`} />
            <Metric label="Paid to booked" value={`${analytics.timeToClose.paidToBookedHours}h`} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-1">
            {analytics.sendHeatmap.flat().map((count, index) => (
              <span
                className="heat-cell"
                style={{ background: `rgba(124,61,255,${Math.min(0.95, 0.12 + count * 0.18)})` }}
                key={index}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--ink-soft)]">Weekday/time-of-day send heatmap based on client-link creation.</p>
        </section>

        <section className="console-panel p-5">
          <PanelHeader title="Smart Follow-up Prioritization" action="Call list" />
          <div className="space-y-3">
            {analytics.followUps.map((row) => (
              <div className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-3" key={row.client.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{row.client.name ?? "Unnamed client"}</p>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">{row.reason}</p>
                  </div>
                  <span className="rounded-full bg-[var(--amber-tint)] px-2 py-1 text-xs text-[var(--amber-100)]">{row.score}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-3">
        <section className="console-panel p-5">
          <PanelHeader title="Cohort Retention" action="Repeat view" />
          {analytics.cohorts.map((cohort) => (
            <div className="border-t border-[var(--line)] py-3 text-sm first:border-t-0" key={cohort.month}>
              <div className="flex justify-between"><span>{cohort.month}</span><span>{cohort.repeatRate}% repeat</span></div>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">{cohort.clients} clients - ${cohort.ltv.toFixed(2)} LTV</p>
            </div>
          ))}
        </section>

        <section className="console-panel p-5">
          <PanelHeader title="Payment Recovery" action="Stripe events" />
          {analytics.paymentEvents.length ? analytics.paymentEvents.map((event) => (
            <div className="border-t border-[var(--line)] py-3 text-sm first:border-t-0" key={event.id}>
              <div className="flex items-center justify-between gap-3">
                <span>{event.client?.name ?? "Payment"}</span>
                <span className={event.status === "open" ? "text-[var(--amber)]" : "text-[var(--red)]"}>{event.status}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">{event.failure_reason ?? "Retry with dunning email"}</p>
              <div className="mt-3">
                <RecoveryButton paymentEventId={event.id} />
              </div>
            </div>
          )) : <p className="text-sm text-[var(--ink-soft)]">No failed payment events recorded yet.</p>}
          <div className="mt-4 flex gap-2 text-xs">
            <span className="btn-secondary inline-flex min-h-8 items-center gap-2 px-3"><Mail size={13} /> Dunning ready</span>
            <span className="btn-secondary inline-flex min-h-8 items-center gap-2 px-3"><TrendingDown size={13} /> Churn score</span>
          </div>
        </section>

        <section className="console-panel p-5">
          <PanelHeader title="Team Performance" action="Owner view" />
          {analytics.teamPerformance.map((member) => (
            <div className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-3" key={member.member}>
              <p className="text-sm font-medium">{member.member}</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">{member.clients} clients - {member.conversion}% conversion - {member.responseHours}h response</p>
            </div>
          ))}
        </section>
      </div>

      <section className="console-panel p-5">
        <PanelHeader title="Custom Alert Rules" action={`${alertRules.length} configured`} />
        <div className="grid gap-3 md:grid-cols-2">
          {alertRules.map((rule) => (
            <div className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-3" key={rule.name}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{rule.name}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{rule.stage} - {rule.threshold_hours}h threshold</p>
                </div>
                <span className="rounded-full bg-[var(--teal-tint)] px-2 py-1 text-xs text-[var(--teal)]">{rule.enabled ? "On" : "Off"}</span>
              </div>
            </div>
          ))}
        </div>
        <Link href="/settings" className="btn-secondary mt-4 inline-flex min-h-9 items-center gap-2 px-3 text-sm">
          <BellRing size={14} />
          Configure alerts
        </Link>
      </section>
    </AgencyShell>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: "danger" | "warning" }) {
  const color = tone === "danger" ? "text-[var(--red)]" : tone === "warning" ? "text-[var(--amber)]" : "text-[var(--ink-900)]";
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white/[0.035] p-4">
      <p className="label">{label}</p>
      <p className={`mt-2 font-mono text-2xl ${color}`}>{value}</p>
    </div>
  );
}

function PanelHeader({ title, action }: { title: string; action: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      <span className="rounded-full border border-[var(--line)] bg-white/[0.04] px-2 py-1 text-[11px] text-[var(--ink-soft)]">{action}</span>
    </div>
  );
}
