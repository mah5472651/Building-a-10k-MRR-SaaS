import { AgencyShell } from "@/components/agency-shell";
import { TeamPerformanceTable } from "@/components/team-performance-table";
import { getAgencyAnalytics } from "@/lib/analytics";
import { requireCurrentAgency } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const { agency } = await requireCurrentAgency();
  const analytics = await getAgencyAnalytics(agency.id);

  return (
    <AgencyShell title="Team" active="Team" agencyId={agency.id}>
      <p className="mb-4 max-w-2xl text-sm text-[var(--ink-soft)]">
        Team leaderboard for clients handled, conversion, and average response time. V1 shows the owner view until multi-seat accounts are enabled.
      </p>
      <TeamPerformanceTable analytics={analytics} />
    </AgencyShell>
  );
}
