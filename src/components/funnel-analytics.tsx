import type { Client } from "@/types/handoff";

const steps = [
  ["Details", (client: Client) => Boolean(client.name)],
  ["Agreement", (client: Client) => Boolean(client.signed_at)],
  ["Deposit", (client: Client) => Boolean(client.paid_at)],
  ["Kickoff", (client: Client) => Boolean(client.scheduled_at)],
] as const;

export function FunnelAnalytics({ clients }: { clients: Client[] }) {
  const total = Math.max(clients.length, 1);
  const rows = steps.map(([label, predicate]) => {
    const count = clients.filter(predicate).length;
    return { label, count, percent: Math.round((count / total) * 100) };
  });
  const lowest = rows.reduce((a, b) => (a.percent < b.percent ? a : b), rows[0]);

  return (
    <section className="card mb-6 p-6">
      <div className="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-end">
        <div>
          <h2 className="serif text-[19px] font-medium">Drop-off funnel</h2>
          <p className="mt-1 text-sm text-[var(--ink-600)]">See where clients get stuck before kickoff.</p>
        </div>
        <p className="text-xs font-medium text-[var(--amber-700)]">Watch: {lowest.label}</p>
      </div>
      <div className="grid gap-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-xs font-medium text-[var(--ink-600)]">
              <span>{row.label}</span>
              <span>{row.count}/{clients.length} · {row.percent}%</span>
            </div>
            <div className="h-3 rounded-full bg-[var(--paper-50)]">
              <div
                className="h-3 rounded-full bg-[var(--amber-500)] transition-[width] duration-500"
                style={{ width: `${row.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
