import Link from "next/link";
import { AgencyShell } from "@/components/agency-shell";
import { CohortRetentionTable } from "@/components/cohort-retention-table";
import { getAgencyAnalytics } from "@/lib/analytics";
import { requireCurrentAgency } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RetentionPage() {
  const { agency } = await requireCurrentAgency();
  const analytics = await getAgencyAnalytics(agency.id);

  return (
    <AgencyShell title="Retention" active="Analytics" agencyId={agency.id}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="max-w-2xl text-sm text-[var(--ink-soft)]">
          Month-by-month repeat client rate, client lifetime value, and cohort strength.
        </p>
        <Link href="/analytics" className="btn-secondary inline-flex min-h-9 items-center px-3 text-sm">
          Back to analytics
        </Link>
      </div>
      <CohortRetentionTable analytics={analytics} />
    </AgencyShell>
  );
}
