import { notFound, redirect } from "next/navigation";
import { ClientFrame } from "@/components/client-frame";
import { SignatureForm } from "@/components/client-flow-form";
import { getClientBundleByToken } from "@/lib/data";
import { recordStageEvent } from "@/lib/stage-events";
import { nextClientPath } from "@/lib/state";

export const dynamic = "force-dynamic";

export default async function AgreementPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const bundle = await getClientBundleByToken(token);
  if (!bundle) notFound();
  if (!bundle.client.name) redirect(`/c/${token}`);
  if (nextClientPath(token, bundle.client) !== `/c/${token}/agreement`) redirect(nextClientPath(token, bundle.client));
  await recordStageEvent({ agencyId: bundle.agency.id, clientId: bundle.client.id, stage: "agreement" });

  return (
    <ClientFrame
      agencyName={bundle.agency.name}
      logoUrl={bundle.agency.logo_url}
      client={bundle.client}
      current="agreement"
      title="Review and sign"
      reassurance={bundle.flow.reassurance?.agreement ?? "This creates a timestamped signature record for both sides."}
      averageMinutes={bundle.averageCompletionMinutes}
      openSlotsThisWeek={bundle.openSlotsThisWeek}
    >
      <div className="mb-6 rounded-xl bg-[var(--paper)] p-5 text-sm leading-6 text-[var(--ink-soft)]">
        {bundle.flow.contract_text}
      </div>
      <SignatureForm token={token} />
    </ClientFrame>
  );
}
