import { AgencyShell } from "@/components/agency-shell";
import { ClientPipeline } from "@/components/client-pipeline";
import { GenerateLinkButton } from "@/components/generate-link-button";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { getDashboardData, requireCurrentAgency } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { agency } = await requireCurrentAgency();
  const { clients, flows } = await getDashboardData(agency.id);

  return (
    <AgencyShell title="Clients" active="Clients" agencyId={agency.id}>
      <RealtimeRefresh agencyId={agency.id} />
      <section className="card p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="serif text-[19px] font-medium">Client pipeline</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">Track every link, intake, signature, payment, and kickoff.</p>
          </div>
          <GenerateLinkButton flows={flows} />
        </div>
        <ClientPipeline clients={clients} />
      </section>
    </AgencyShell>
  );
}
