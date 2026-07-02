import { AgencyShell } from "@/components/agency-shell";

export default function DashboardLoading() {
  return (
    <AgencyShell title="Dashboard" active="Dashboard">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div className="card" key={item}>
            <div className="skeleton h-8 w-16 rounded" />
            <div className="skeleton mt-3 h-4 w-24 rounded" />
          </div>
        ))}
      </div>
      <section className="card">
        {[0, 1, 2].map((item) => (
          <div className="flex items-center gap-3 border-t border-[var(--ink-100)] py-4 first:border-t-0" key={item}>
            <div className="skeleton h-9 w-9 rounded-full" />
            <div className="flex-1">
              <div className="skeleton h-4 w-40 rounded" />
              <div className="skeleton mt-2 h-3 w-56 rounded" />
            </div>
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
        ))}
      </section>
    </AgencyShell>
  );
}
