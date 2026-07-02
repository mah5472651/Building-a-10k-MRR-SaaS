import type { getAgencyAnalytics } from "@/lib/analytics";

type Analytics = Awaited<ReturnType<typeof getAgencyAnalytics>>;

export function TimeToCloseChart({ analytics }: { analytics: Analytics }) {
  const segments = [
    { label: "Created to signed", value: analytics.timeToClose.createdToSignedHours },
    { label: "Signed to paid", value: analytics.timeToClose.signedToPaidHours },
    { label: "Paid to booked", value: analytics.timeToClose.paidToBookedHours },
  ];

  return (
    <section className="console-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Time-to-Close Analytics</h2>
        <span className="rounded-full border border-[var(--line)] bg-white/[0.04] px-2 py-1 text-[11px] text-[var(--ink-soft)]">
          {analytics.timeToClose.totalHours}h total avg
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {segments.map((segment) => (
          <div className="rounded-2xl border border-[var(--line)] bg-white/[0.035] p-4" key={segment.label}>
            <p className="label">{segment.label}</p>
            <p className="mt-2 font-mono text-2xl">{segment.value}h</p>
          </div>
        ))}
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
      <p className="mt-2 text-xs text-[var(--ink-soft)]">Weekday/time-of-day heatmap based on link creation.</p>
    </section>
  );
}
