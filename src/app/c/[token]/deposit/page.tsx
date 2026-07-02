import { notFound, redirect } from "next/navigation";
import { CheckoutButton } from "@/components/checkout-button";
import { ClientFrame } from "@/components/client-frame";
import { getClientBundleByToken } from "@/lib/data";
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

  return (
    <ClientFrame agencyName={bundle.agency.name} logoUrl={bundle.agency.logo_url} client={bundle.client} current="deposit" title="Place the kickoff deposit">
      <p className="text-sm leading-6 text-[var(--ink-soft)]">
        This deposit confirms the kickoff and will be applied to your project balance.
      </p>
      <div className="my-8 border-y border-[var(--line)] py-6">
        <p className="label">Deposit due</p>
        <p className="serif mt-1 text-[28px] font-medium">${Number(bundle.flow.deposit_amount).toFixed(2)}</p>
      </div>
      <CheckoutButton endpoint="/api/stripe/deposit-checkout" payload={{ token }} label="Pay deposit" />
    </ClientFrame>
  );
}
