import { CheckoutButton } from "@/components/checkout-button";
import { AgencyShell } from "@/components/agency-shell";
import { requireCurrentAgency } from "@/lib/data";
import { getAgencyAnalytics } from "@/lib/analytics";
import { PaymentRecoveryPanel } from "@/components/payment-recovery-panel";

export const dynamic = "force-dynamic";

const plans = [
  { key: "starter", name: "Starter", price: "$49", features: ["One onboarding flow", "Client links", "Deposits"] },
  { key: "growth", name: "Growth", price: "$99", features: ["Everything in Starter", "More active clients", "Priority support"] },
  { key: "scale", name: "Scale", price: "$199", features: ["Everything in Growth", "Higher usage", "Launch support"] },
];

export default async function BillingPage() {
  const { agency } = await requireCurrentAgency();
  const analytics = await getAgencyAnalytics(agency.id);
  const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <AgencyShell title="Billing" active="Billing" agencyId={agency.id}>
      {!stripeConfigured ? (
        <p className="mb-5 rounded-lg bg-[var(--amber-tint)] px-4 py-3 text-sm text-[var(--amber-deep)]">
          Stripe is not configured yet. Add Stripe keys and price IDs to enable real subscription checkout.
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const current = agency.plan === plan.key;
          return (
            <section
              className={`card p-6 ${current ? "border-[var(--ink)]" : ""}`}
              key={plan.key}
            >
              <h2 className="serif text-[19px] font-medium">{plan.name}</h2>
              <p className="serif mt-3 text-[28px] font-medium">{plan.price}</p>
              <p className="label mb-5 mt-1">per month</p>
              <ul className="mb-6 space-y-2 text-sm text-[var(--ink-soft)]">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {current ? (
                <button className="btn-secondary w-full" disabled>
                  Current plan
                </button>
              ) : !stripeConfigured ? (
                <button className="btn-secondary w-full" disabled>
                  Stripe required
                </button>
              ) : (
                <CheckoutButton
                  endpoint="/api/stripe/subscription-checkout"
                  payload={{ plan: plan.key }}
                  label={`Upgrade to ${plan.name}`}
                />
              )}
            </section>
          );
        })}
      </div>
      <section className="card mt-6 p-6">
        <h2 className="serif mb-3 text-[19px] font-medium">Subscription</h2>
        <p className="text-sm text-[var(--ink-soft)]">
          Status: <span className="font-medium text-[var(--ink)]">{agency.subscription_status}</span>
        </p>
        {agency.trial_ends_at ? (
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Trial ends {new Date(agency.trial_ends_at).toLocaleDateString()}
          </p>
        ) : null}
        {agency.stripe_customer_id ? (
          <div className="mt-5 max-w-xs">
            <CheckoutButton endpoint="/api/stripe/billing-portal" payload={{}} label="Manage billing" />
          </div>
        ) : null}
      </section>
      <div className="mt-6">
        <PaymentRecoveryPanel analytics={analytics} />
      </div>
      <section className="card mt-6 p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="serif text-[19px] font-medium">Payment method</h2>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">
              Update cards and invoices through the Stripe billing portal.
            </p>
          </div>
          {agency.stripe_customer_id && stripeConfigured ? (
            <div className="w-full md:w-44">
              <CheckoutButton endpoint="/api/stripe/billing-portal" payload={{}} label="Update card" />
            </div>
          ) : null}
        </div>
        <div className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-4 text-sm text-[var(--ink-soft)]">
          {agency.stripe_customer_id ? "Stripe customer connected." : "No payment method on file yet."}
        </div>
      </section>
      <section className="card mt-6 p-6">
        <h2 className="serif mb-4 text-[19px] font-medium">Invoice history</h2>
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-[var(--line)] pb-2 text-xs font-medium text-[var(--ink-soft)]">
          <span>Date</span>
          <span>Amount</span>
          <span>Status</span>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] gap-3 py-4 text-sm text-[var(--ink-soft)]">
          <span>No invoices yet</span>
          <span className="font-mono">$0.00</span>
          <span>—</span>
        </div>
      </section>
    </AgencyShell>
  );
}
