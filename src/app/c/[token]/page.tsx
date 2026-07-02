import { notFound, redirect } from "next/navigation";
import { ClientFrame } from "@/components/client-frame";
import { DetailsForm } from "@/components/client-flow-form";
import { getClientBundleByToken } from "@/lib/data";
import { nextClientPath } from "@/lib/state";

export const dynamic = "force-dynamic";

export default async function ClientDetailsPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const bundle = await getClientBundleByToken(token);
  if (!bundle) notFound();
  if (nextClientPath(token, bundle.client) !== `/c/${token}`) redirect(nextClientPath(token, bundle.client));

  return (
    <ClientFrame
      agencyName={bundle.agency.name}
      logoUrl={bundle.agency.logo_url}
      client={bundle.client}
      current="details"
      title="Tell us the essentials"
      reassurance={bundle.flow.reassurance?.details ?? "Your answers help the kickoff start with context instead of back-and-forth."}
      averageMinutes={bundle.averageCompletionMinutes}
      openSlotsThisWeek={bundle.openSlotsThisWeek}
    >
      <DetailsForm token={token} questions={bundle.flow.questions} defaults={bundle.client} />
    </ClientFrame>
  );
}
