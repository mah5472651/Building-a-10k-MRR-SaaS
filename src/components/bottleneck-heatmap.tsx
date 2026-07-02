import type { getAgencyAnalytics } from "@/lib/analytics";

type Analytics = Awaited<ReturnType<typeof getAgencyAnalytics>>;

export function BottleneckHeatmap({ analytics }: { analytics: Analytics }) {
  return (
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
        {analytics.biggestBottleneck.key === "agreement"
          ? "Agreement is the biggest drop-off. Try shorter copy, clearer scope, and stronger reassurance."
          : `${analytics.biggestBottleneck.label} is the biggest drop-off. Tighten that step before increasing lead volume.`}
      </p>
    </section>
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
