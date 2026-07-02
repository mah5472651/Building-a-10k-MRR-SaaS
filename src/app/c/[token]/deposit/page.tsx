import { notFound, redirect } from "next/navigation";
import { CheckoutButton } from "@/components/checkout-button";
import { ClientFrame } from "@/components/client-frame";
import { getClientBundleByToken } from "@/lib/data";
import { recordStageEvent } from "@/lib/stage-events";
import { nextClientPath } from "@/lib/state";

export const dynamic = "force-dynamic";

export default async function DepositPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const bundle = await getClientBundleByToken(token);
  if (!bundle) notFound();
  if (!bundle.client.signed_at) redirect(`/c/${token}/agreement`);
  if (nextClientPath(token, bundle.client) !== `/c/${token}/deposit`) redirect(nextClientPath(token, bundle.client));
  await recordStageEvent({ agencyId: bundle.agency.id, clientId: bundle.client.id, stage: "deposit" });

  return (
    <ClientFrame
      agencyName={bundle.agency.name}
      logoUrl={bundle.agency.logo_url}
      client={bundle.client}
      current="deposit"
      title="Place the kickoff deposit"
      reassurance={bundle.flow.reassurance?.deposit ?? "Secure checkout opens in Stripe and returns you here to book kickoff."}
      averageMinutes={bundle.averageCompletionMinutes}
      openSlotsThisWeek={bundle.openSlotsThisWeek}
    >
      <p className="text-sm leading-6 text-[var(--ink-soft)]">
        This deposit confirms the kickoff and will be applied to your project balance.
      </p>
      <div className="my-8 border-y border-[var(--line)] py-6">
        <p className="label">Due now</p>
        <p className="serif mt-1 text-[28px] font-medium">
          ${Number((bundle.flow.payment_schedule?.find((item) => item.due === "onboarding") ?? bundle.flow.payment_schedule?.[0])?.amount ?? bundle.flow.deposit_amount).toFixed(2)}
        </p>
      </div>
      <div className="mb-6 rounded-xl border border-[var(--ink-100)] bg-[var(--paper-50)] p-4">
        <p className="label mb-3">Payment schedule</p>
        {(bundle.flow.payment_schedule?.length ? bundle.flow.payment_schedule : [{ id: "deposit", label: "Deposit", amount: bundle.flow.deposit_amount, due: "onboarding" }]).map((milestone) => (
          <div className="flex justify-between border-t border-[var(--ink-100)] py-2 text-sm first:border-t-0" key={milestone.id}>
            <span>{milestone.label}</span>
            <span className="font-mono">${Number(milestone.amount).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <CheckoutButton endpoint="/api/stripe/deposit-checkout" payload={{ token }} label="Pay deposit" />
    </ClientFrame>
  );
}
