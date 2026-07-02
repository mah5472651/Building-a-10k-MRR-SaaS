import { appUrl } from "@/lib/env";
import { getDashboardData, requireCurrentAgency } from "@/lib/data";
import { ClientRow } from "@/components/client-row";
import { AgencyShell } from "@/components/agency-shell";
import { GenerateLinkButton } from "@/components/generate-link-button";
import { CopyButton } from "@/components/copy-button";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { EmptyState } from "@/components/empty-state";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ link?: string }>;
}) {
  const params = await searchParams;
  const { agency } = await requireCurrentAgency();
  const { clients, stats } = await getDashboardData(agency.id);
  const readyLink = params.link ? `${appUrl}/c/${params.link}` : "";

  return (
    <AgencyShell title="Dashboard" active="Dashboard">
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

      <section className="card mb-6 p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="serif text-[19px] font-medium">Client link</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Create a unique link for the next client.</p>
          </div>
          <GenerateLinkButton />
        </div>
        {readyLink ? (
          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-dashed border-[var(--line-strong)] p-3 md:flex-row md:items-center">
            <code className="flex-1 break-all font-mono text-xs">{readyLink}</code>
            <CopyButton value={readyLink} />
          </div>
        ) : null}
      </section>

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
