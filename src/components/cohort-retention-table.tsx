import type { getAgencyAnalytics } from "@/lib/analytics";

type Analytics = Awaited<ReturnType<typeof getAgencyAnalytics>>;

export function CohortRetentionTable({ analytics }: { analytics: Analytics }) {
  return (
    <section className="console-panel overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <h2 className="text-sm font-semibold">Cohort Retention</h2>
        <span className="rounded-full border border-[var(--line)] bg-white/[0.04] px-2 py-1 text-[11px] text-[var(--ink-soft)]">Repeat clients</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">
            <tr>
              <th className="px-5 py-3">Month</th>
              <th className="px-3 py-3">Clients</th>
              <th className="px-3 py-3">Repeat</th>
              <th className="px-3 py-3">Repeat rate</th>
              <th className="px-3 py-3">LTV</th>
            </tr>
          </thead>
          <tbody>
            {analytics.cohorts.map((cohort) => (
              <tr className="border-t border-[var(--line)]" key={cohort.month}>
                <td className="px-5 py-3">{cohort.month}</td>
                <td className="px-3 py-3">{cohort.clients}</td>
                <td className="px-3 py-3">{cohort.repeat}</td>
                <td className="px-3 py-3">{cohort.repeatRate}%</td>
                <td className="px-3 py-3 font-mono">${cohort.ltv.toFixed(2)}</td>
              </tr>
            ))}
            {!analytics.cohorts.length ? (
              <tr>
                <td className="px-5 py-6 text-[var(--ink-soft)]" colSpan={5}>No cohort data yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
