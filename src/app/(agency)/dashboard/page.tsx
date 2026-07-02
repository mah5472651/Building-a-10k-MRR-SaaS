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
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          ["Total clients", stats.total, "+0 this week"],
          ["In progress", stats.inProgress, "Live"],
          ["Onboarded", stats.completed, "+0 this week"],
        ].map(([label, value, trend]) => (
          <div className="card p-6" key={label}>
            <p className="serif text-[28px] leading-8 font-medium tabular-nums">{value}</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="label">{label}</p>
              <span className="text-xs font-medium text-[var(--teal-500)]">{trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <section className="card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="serif text-[19px] font-medium">Needs attention</h2>
            <span className="rounded-full bg-[var(--amber-tint)] px-2 py-1 text-xs font-medium">{needsAttention.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {needsAttention.length ? (
              needsAttention.slice(0, 3).map((client) => (
                <Link className="block rounded-lg border border-[var(--line)] bg-[var(--paper-50)] p-3 text-sm" href={`/clients/${client.id}`} key={client.id}>
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
              <span className="flex-1 rounded-t bg-[var(--teal)] opacity-80" style={{ height: `${height * 100}%` }} key={index} />
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
          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-dashed border-[var(--line-strong)] p-3 md:flex-row md:items-center">
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
