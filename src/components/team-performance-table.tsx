import type { getAgencyAnalytics } from "@/lib/analytics";

type Analytics = Awaited<ReturnType<typeof getAgencyAnalytics>>;

export function TeamPerformanceTable({ analytics }: { analytics: Analytics }) {
  return (
    <section className="console-panel overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <h2 className="text-sm font-semibold">Team Performance</h2>
        <span className="rounded-full border border-[var(--line)] bg-white/[0.04] px-2 py-1 text-[11px] text-[var(--ink-soft)]">Leaderboard</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">
            <tr>
              <th className="px-5 py-3">Team member</th>
              <th className="px-3 py-3">Clients</th>
              <th className="px-3 py-3">Completed</th>
              <th className="px-3 py-3">Conversion</th>
              <th className="px-3 py-3">Avg response</th>
            </tr>
          </thead>
          <tbody>
            {analytics.teamPerformance.map((member) => (
              <tr className="border-t border-[var(--line)]" key={member.member}>
                <td className="px-5 py-3">{member.member}</td>
                <td className="px-3 py-3">{member.clients}</td>
                <td className="px-3 py-3">{member.completed}</td>
                <td className="px-3 py-3">{member.conversion}%</td>
                <td className="px-3 py-3">{member.responseHours}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
