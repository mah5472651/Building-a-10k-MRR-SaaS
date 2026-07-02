import { AgencyShell } from "@/components/agency-shell";
import { ClientRow } from "@/components/client-row";
import { GenerateLinkButton } from "@/components/generate-link-button";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { EmptyState } from "@/components/empty-state";
import { getDashboardData, requireCurrentAgency } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { agency } = await requireCurrentAgency();
  const { clients, flows } = await getDashboardData(agency.id);

  return (
    <AgencyShell title="Clients" active="Clients">
      <RealtimeRefresh agencyId={agency.id} />
      <section className="card p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="serif text-[19px] font-medium">Client pipeline</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Track every link, intake, signature, payment, and kickoff.</p>
          </div>
          <GenerateLinkButton flows={flows} />
        </div>
        {clients.length ? (
          clients.map((client) => <ClientRow key={client.id} client={client} />)
        ) : (
          <EmptyState title="No clients yet" body="Generate your first client link to begin." />
        )}
      </section>
    </AgencyShell>
  );
}
