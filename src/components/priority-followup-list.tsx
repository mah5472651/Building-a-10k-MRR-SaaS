import Link from "next/link";
import { Phone } from "lucide-react";
import { NudgeButton } from "@/components/nudge-button";
import type { getAgencyAnalytics } from "@/lib/analytics";

type Analytics = Awaited<ReturnType<typeof getAgencyAnalytics>>;

export function PriorityFollowupList({ analytics, compact = false }: { analytics: Analytics; compact?: boolean }) {
  const rows = compact ? analytics.followUps.slice(0, 4) : analytics.followUps;

  return (
    <section className="console-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{compact ? "Call These Clients Today" : "Smart Follow-up Prioritization"}</h2>
        <span className="rounded-full border border-[var(--line)] bg-white/[0.04] px-2 py-1 text-[11px] text-[var(--ink-soft)]">Priority score</span>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-3" key={row.client.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{row.client.name ?? "Unnamed client"}</p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">{row.reason}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <NudgeButton clientId={row.client.id} />
                  <a className="btn-secondary inline-flex min-h-8 items-center gap-2 px-3 text-xs" href={row.client.phone ? `tel:${row.client.phone}` : `/clients/${row.client.id}`}>
                    <Phone size={13} />
                    Call
                  </a>
                  <Link className="btn-secondary inline-flex min-h-8 items-center px-3 text-xs" href={`/clients/${row.client.id}`}>
                    Open
                  </Link>
                </div>
              </div>
              <span className="rounded-full bg-[var(--amber-tint)] px-2 py-1 text-xs text-[var(--amber-100)]">{row.score}</span>
            </div>
          </div>
        ))}
        {!rows.length ? <p className="text-sm text-[var(--ink-soft)]">No priority follow-ups right now.</p> : null}
      </div>
    </section>
  );
}
