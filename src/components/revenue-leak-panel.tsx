import Link from "next/link";
import { Phone } from "lucide-react";
import { NudgeButton } from "@/components/nudge-button";
import type { getAgencyAnalytics } from "@/lib/analytics";

type Analytics = Awaited<ReturnType<typeof getAgencyAnalytics>>;

export function RevenueLeakPanel({ analytics, compact = false }: { analytics: Analytics; compact?: boolean }) {
  return (
    <section className={compact ? "metric-card p-5" : "console-panel overflow-hidden p-0"}>
      {compact ? (
        <>
          <p className="label">At-risk revenue</p>
          <p className="mt-2 font-mono text-3xl text-[var(--red)]">${analytics.revenue.atRisk.toFixed(2)}</p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            {analytics.revenue.rows.filter((row) => row.atRisk).length} stalled client(s)
          </p>
          <Link href="/analytics" className="btn-secondary mt-4 inline-flex min-h-9 items-center px-3 text-xs">
            Review leaks
          </Link>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-sm font-semibold">Revenue Leak Detector</h2>
            <span className="rounded-full bg-[var(--red-tint)] px-2 py-1 text-[11px] text-[var(--red)]">
              ${analytics.revenue.atRisk.toFixed(2)} at risk
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                <tr>
                  <th className="px-5 py-3">Client</th>
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
                    <td className="px-3 py-3 capitalize">{row.stage}</td>
                    <td className="px-3 py-3 font-mono">${row.value.toFixed(2)}</td>
                    <td className={row.atRisk ? "px-3 py-3 text-[var(--red)]" : "px-3 py-3"}>{row.daysStalled}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <NudgeButton clientId={row.client.id} />
                        <a className="btn-secondary inline-flex min-h-8 items-center gap-2 px-3 text-xs" href={row.client.phone ? `tel:${row.client.phone}` : `/clients/${row.client.id}`}>
                          <Phone size={13} />
                          Call
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {!analytics.revenue.rows.length ? (
                  <tr>
                    <td className="px-5 py-6 text-[var(--ink-soft)]" colSpan={5}>No stuck revenue right now.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
