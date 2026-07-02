import { appUrl } from "@/lib/env";
import Link from "next/link";
import { getDashboardData, getDepositRecommendation, requireCurrentAgency } from "@/lib/data";
import { ClientRow } from "@/components/client-row";
import { AgencyShell } from "@/components/agency-shell";
import { GenerateLinkButton } from "@/components/generate-link-button";
import { CopyButton } from "@/components/copy-button";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { EmptyState } from "@/components/empty-state";
import { FunnelAnalytics } from "@/components/funnel-analytics";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ link?: string }>;
}) {
  const params = await searchParams;
  const { agency } = await requireCurrentAgency();
  const { clients, stats, flows, needsAttention } = await getDashboardData(agency.id);
  const readyLink = params.link ? `${appUrl}/c/${params.link}` : "";
  const depositRecommendation = getDepositRecommendation(clients);

  return (
    <AgencyShell title="Dashboard" active="Dashboard" agencyId={agency.id}>
      <RealtimeRefresh agencyId={agency.id} />
      <section className="card mb-6 overflow-hidden p-0">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="label">Last update: real time</p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">Live onboarding command center</h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--ink-soft)]">Track client handoff, agreements, deposits, booking, and realtime notifications from one premium workspace.</p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white/[0.04] p-4 text-right">
            <p className="label">Weekly collected</p>
            <p className="mt-1 font-mono text-2xl text-[var(--teal)]">${Number(stats.weeklyCollected).toFixed(2)}</p>
          </div>
        </div>
        <div className="grid border-t border-[var(--line)] text-xs text-[var(--ink-soft)] md:grid-cols-4">
          {["Intake live", "Signature audit", "Stripe checkout", "Kickoff booking"].map((item) => (
            <div className="border-t border-[var(--line)] px-6 py-3 md:border-l md:border-t-0 first:md:border-l-0" key={item}>
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[var(--teal)] shadow-[0_0_12px_rgba(72,240,194,0.65)]" />
              {item}
            </div>
          ))}
        </div>
      </section>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          ["Total clients", stats.total, "+0 this week"],
          ["In progress", stats.inProgress, "Live"],
          ["Onboarded", stats.completed, "+0 this week"],
        ].map(([label, value, trend]) => (
          <div className="card stat-glow p-6" key={label}>
            <p className="serif text-[28px] leading-8 font-medium tabular-nums">{value}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="label">{label}</p>
              <span className="rounded-full bg-[var(--teal-tint)] px-2 py-1 text-xs font-medium text-[var(--teal-500)]">{trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <section className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="serif text-[19px] font-medium">Needs attention</h2>
            <span className="rounded-full bg-[var(--amber-tint)] px-2 py-1 text-xs font-medium text-[var(--amber-100)]">{needsAttention.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {needsAttention.length ? (
              needsAttention.slice(0, 3).map((client) => (
                <Link className="block rounded-xl border border-[var(--line)] bg-white/[0.04] p-3 text-sm transition hover:border-[var(--line-strong)] hover:bg-white/[0.07]" href={`/clients/${client.id}`} key={client.id}>
                  <span className="font-medium">{client.name ?? "Unnamed client"}</span>
                  <span className="mt-1 block text-xs text-[var(--ink-soft)]">Inactive since {new Date(client.last_active_at ?? client.created_at).toLocaleDateString()}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-[var(--ink-soft)]">No stalled onboarding right now.</p>
            )}
          </div>
        </section>
        <section className="card p-6">
          <p className="label">Collected this week</p>
          <p className="serif mt-2 text-[30px] font-medium">${Number(stats.weeklyCollected).toFixed(2)}</p>
          <div className="mt-5 flex h-12 items-end gap-1">
            {[0.25, 0.5, 0.36, 0.76, 0.42, 0.88, 0.64].map((height, index) => (
              <span className="flex-1 rounded-t bg-gradient-to-t from-[var(--blue-500)] to-[var(--teal)] opacity-90 shadow-[0_0_18px_rgba(72,240,194,0.22)]" style={{ height: `${height * 100}%` }} key={index} />
            ))}
          </div>
        </section>
        <section className="card p-6">
          <p className="label">Smart deposit insight</p>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{depositRecommendation}</p>
        </section>
      </div>

      <section className="card mb-6 p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="serif text-[19px] font-medium">Client link</h2>
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

      <FunnelAnalytics clients={clients} />

      <section id="clients" className="card p-6">
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
