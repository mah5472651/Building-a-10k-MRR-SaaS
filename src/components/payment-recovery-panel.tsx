import Link from "next/link";
import { TrendingDown } from "lucide-react";
import { RecoveryButton } from "@/components/recovery-button";
import type { getAgencyAnalytics } from "@/lib/analytics";

type Analytics = Awaited<ReturnType<typeof getAgencyAnalytics>>;

export function PaymentRecoveryPanel({ analytics }: { analytics: Analytics }) {
  const failedInvoices = analytics.paymentEvents.filter((event) => event.kind === "subscription" && event.status !== "recovered").length;
  const churnRisk = failedInvoices >= 2 ? "High" : failedInvoices === 1 ? "Watch" : "Low";

  return (
    <section className="console-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Payment Recovery</h2>
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--red-tint)] px-2 py-1 text-[11px] text-[var(--red)]">
          <TrendingDown size={12} />
          Churn risk: {churnRisk}
        </span>
      </div>
      {analytics.paymentEvents.length ? (
        <div className="space-y-3">
          {analytics.paymentEvents.map((event) => (
            <div className="rounded-xl border border-[var(--line)] bg-white/[0.035] p-3 text-sm" key={event.id}>
              <div className="flex items-center justify-between gap-3">
                <span>{event.client?.name ?? (event.kind === "subscription" ? "Agency subscription" : "Payment")}</span>
                <span className={event.status === "open" ? "text-[var(--amber)]" : "text-[var(--red)]"}>{event.status}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">{event.failure_reason ?? "Retry with dunning email"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <RecoveryButton paymentEventId={event.id} />
                {event.client?.unique_link_token ? (
                  <Link className="btn-secondary inline-flex min-h-8 items-center px-3 text-xs" href={`/c/${event.client.unique_link_token}/deposit`} target="_blank">
                    Open retry link
                  </Link>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--ink-soft)]">No failed payment events recorded yet.</p>
      )}
    </section>
  );
}
