import { appUrl } from "@/lib/env";
import Link from "next/link";
import { AlertTriangle, CalendarCheck, CircleDollarSign, FileSignature, Link2, MoreVertical, ShieldCheck, UserRoundCheck } from "lucide-react";
import { getDashboardData, getDepositRecommendation, requireCurrentAgency } from "@/lib/data";
import { ClientRow } from "@/components/client-row";
import { AgencyShell } from "@/components/agency-shell";
import { GenerateLinkButton } from "@/components/generate-link-button";
import { CopyButton } from "@/components/copy-button";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { EmptyState } from "@/components/empty-state";
import { FunnelAnalytics } from "@/components/funnel-analytics";
import { RevenueLeakPanel } from "@/components/revenue-leak-panel";
import { PriorityFollowupList } from "@/components/priority-followup-list";
import { getAgencyAnalytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ link?: string }>;
}) {
  const params = await searchParams;
  const { agency } = await requireCurrentAgency();
  const { clients, stats, flows, needsAttention } = await getDashboardData(agency.id);
  const analytics = await getAgencyAnalytics(agency.id);
  const readyLink = params.link ? `${appUrl}/c/${params.link}` : "";
  const depositRecommendation = getDepositRecommendation(clients);

  return (
    <AgencyShell title="Dashboard" active="Dashboard" agencyId={agency.id}>
      <RealtimeRefresh agencyId={agency.id} />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-[var(--ink-soft)]">Money leaks, follow-up priority, and live handoff operations in one command view.</p>
        <Link className="btn-primary inline-flex min-h-10 items-center gap-2 px-4 text-sm" href="/api/reports/monthly" target="_blank">
          Export Monthly Report
        </Link>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Links", value: stats.total, icon: Link2, delta: "+0.30%" },
          { label: "Intake", value: stats.inProgress, icon: UserRoundCheck, delta: "+0.30%" },
          { label: "Signed", value: clients.filter((client) => client.signed_at).length, icon: FileSignature, delta: "+0.30%" },
          { label: "Booked", value: stats.completed, icon: CalendarCheck, delta: "+0.30%" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <section className="metric-card p-5" key={item.label}>
              <div className="mb-6 flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-xl border border-[var(--line)] bg-white/[0.04] text-[var(--ink-soft)]">
                  <Icon size={15} />
                </span>
                <span className="rounded-full bg-[var(--teal-tint)] px-2 py-1 text-[10px] font-semibold text-[var(--teal)]">{item.delta}</span>
              </div>
              <p className="font-mono text-3xl tracking-[-0.04em]">{item.value}</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">This week: {item.label.toLowerCase()}</p>
            </section>
          );
        })}
        <RevenueLeakPanel analytics={analytics} compact />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <RevenueLeakPanel analytics={analytics} />
        <PriorityFollowupList analytics={analytics} compact />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="console-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Top Handoff Activity</h2>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">Client progress intensity by step</p>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-white/[0.04] px-3 py-1 text-[11px] text-[var(--ink-soft)]">Any flow</span>
          </div>
          <div className="grid grid-cols-[70px_1fr] gap-3">
            <div className="space-y-3 pt-1 text-[10px] text-[var(--ink-soft)]">
              {["Links", "Intake", "Signed", "Paid", "Booked", "Nudges"].map((item) => <p key={item}>{item}</p>)}
            </div>
            <div className="grid grid-cols-10 gap-1.5">
              {Array.from({ length: 60 }).map((_, index) => {
                const strength = [0.14, 0.22, 0.38, 0.66, 0.95][(index * 7 + stats.total) % 5];
                return (
                  <span
                    className="heat-cell"
                    style={{
                      background: `rgba(146, 75, 255, ${strength})`,
                      boxShadow: strength > 0.6 ? "0 0 18px rgba(146,75,255,0.45)" : undefined,
                    }}
                    key={index}
                  />
                );
              })}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2 text-center text-[10px] text-[var(--ink-soft)]">
            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>

        <section className="console-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Client Geography</h2>
            <span className="rounded-full border border-[var(--line)] bg-white/[0.04] px-2 py-1 text-[11px] text-[var(--ink-soft)]">Live</span>
          </div>
          <div className="relative h-[236px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[radial-gradient(circle_at_center,rgba(124,61,255,0.18),rgba(255,255,255,0.02))]">
            <div className="absolute inset-6 rounded-[48%] bg-[rgba(111,94,170,0.22)] blur-sm" />
            <div className="absolute left-[12%] top-[34%] h-12 w-24 rounded-[55%] bg-[rgba(111,94,170,0.35)]" />
            <div className="absolute left-[38%] top-[26%] h-20 w-32 rounded-[50%] bg-[rgba(111,94,170,0.32)]" />
            <div className="absolute left-[63%] top-[42%] h-16 w-24 rounded-[52%] bg-[rgba(111,94,170,0.32)]" />
            {[
              ["22%", "44%"],
              ["42%", "36%"],
              ["55%", "52%"],
              ["71%", "48%"],
              ["80%", "61%"],
              ["32%", "60%"],
              ["62%", "30%"],
            ].map(([left, top]) => <span className="map-dot" style={{ left, top }} key={`${left}-${top}`} />)}
          </div>
        </section>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <section className="console-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">External Exposure</h2>
            <AlertTriangle size={16} className="text-[var(--amber)]" />
          </div>
          <div className="space-y-3">
            {(needsAttention.length ? needsAttention : clients.slice(0, 4)).slice(0, 4).map((client, index) => (
              <Link className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-white/[0.035] p-3 transition hover:bg-white/[0.07]" href={`/clients/${client.id}`} key={client.id}>
                <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] bg-black/20 text-xs">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{client.name ?? "Unnamed client"}</span>
                  <span className="block truncate text-[11px] text-[var(--ink-soft)]">{client.status} exposure</span>
                </span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.05] text-lg">+</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="console-panel overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
            <h2 className="text-sm font-semibold">View Results By</h2>
            <MoreVertical size={16} className="text-[var(--ink-soft)]" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                <tr>
                  <th className="px-5 py-3">Asset</th>
                  <th className="px-3 py-3">Account</th>
                  <th className="px-3 py-3">Risk</th>
                  <th className="px-3 py-3">Entity</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.slice(0, 6).map((client, index) => (
                  <tr className="border-t border-[var(--line)] transition hover:bg-white/[0.04]" key={client.id}>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-2">
                        <ShieldCheck size={15} className="text-[var(--violet-500)]" />
                        <span className="truncate">{client.name ?? "Public-link"}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[var(--ink-soft)]">{client.email ?? "pending-client"}</td>
                    <td className="px-3 py-3 font-mono">{(7.3 - index * 0.6).toFixed(1)}</td>
                    <td className="px-3 py-3">{client.status}</td>
                    <td className="px-3 py-3">
                      <Link href={`/clients/${client.id}`} className="text-[var(--amber-100)]">Open</Link>
                    </td>
                  </tr>
                ))}
                {!clients.length ? (
                  <tr>
                    <td className="px-5 py-8 text-[var(--ink-soft)]" colSpan={5}>No clients yet. Generate a client link to populate this table.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="console-panel mb-4 p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-sm font-semibold">Client link</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Create a unique link for the next client.</p>
          </div>
          <GenerateLinkButton flows={flows} />
        </div>
        {readyLink ? (
          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-dashed border-[var(--line-strong)] bg-black/20 p-3 md:flex-row md:items-center">
            <code className="flex-1 break-all font-mono text-xs">{readyLink}</code>
            <CopyButton value={readyLink} />
          </div>
        ) : null}
      </section>

      <section className="console-panel mb-4 p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="label">Smart deposit insight</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{depositRecommendation}</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white/[0.04] px-4 py-3">
            <CircleDollarSign size={18} className="text-[var(--teal)]" />
            <span className="font-mono text-lg">${Number(stats.weeklyCollected).toFixed(2)}</span>
          </div>
        </div>
      </section>

      <FunnelAnalytics clients={clients} />

      <section id="clients" className="console-panel p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="serif text-[19px] font-medium">Recent activity</h2>
        </div>
        {clients.length ? (
          clients.map((client) => <ClientRow key={client.id} client={client} />)
        ) : (
          <EmptyState title="No clients yet" body="Generate a link to begin your first onboarding." />
        )}
      </section>
    </AgencyShell>
  );
}
