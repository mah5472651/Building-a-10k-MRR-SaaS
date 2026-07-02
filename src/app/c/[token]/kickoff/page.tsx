import { notFound, redirect } from "next/navigation";
import { BookingForm } from "@/components/client-flow-form";
import { ClientFrame } from "@/components/client-frame";
import { createServiceSupabase } from "@/lib/supabase";
import { getClientBundleByToken } from "@/lib/data";
import { getStripe } from "@/lib/stripe";
import { sendAgencyWebhook } from "@/lib/webhooks";
import { recordNotificationEvent } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export default async function KickoffPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { token } = await params;
  const search = await searchParams;
  let bundle = await getClientBundleByToken(token);
  if (!bundle) notFound();
  if (!bundle.client.signed_at) redirect(`/c/${token}/agreement`);

  if (search.session_id && !bundle.client.paid_at) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(search.session_id);
    if (
      session.payment_status === "paid" &&
      session.metadata?.kind === "client_deposit" &&
      session.metadata?.token === token
    ) {
      await createServiceSupabase()
        .from("clients")
        .update({
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: String(session.payment_intent ?? ""),
          amount_paid: Number(session.amount_total ?? 0) / 100,
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bundle.client.id);
      await sendAgencyWebhook({
        agency: bundle.agency,
        event: "paid",
        client: {
          ...bundle.client,
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: String(session.payment_intent ?? ""),
          amount_paid: Number(session.amount_total ?? 0) / 100,
        },
      });
      await recordNotificationEvent({ agencyId: bundle.agency.id, clientId: bundle.client.id, event: "paid" });
      bundle = await getClientBundleByToken(token);
    }
  }

  if (!bundle) notFound();
  if (!bundle.client.paid_at && Number(bundle.flow.deposit_amount) > 0) redirect(`/c/${token}/deposit`);
  if (bundle.client.scheduled_at) redirect(`/c/${token}/confirmation`);

  return (
    <ClientFrame
      agencyName={bundle.agency.name}
      logoUrl={bundle.agency.logo_url}
      client={bundle.client}
      current="kickoff"
      title="Choose a kickoff time"
      reassurance={bundle.flow.reassurance?.kickoff ?? "Pick the slot that gives you the cleanest start."}
      averageMinutes={bundle.averageCompletionMinutes}
      openSlotsThisWeek={bundle.openSlotsThisWeek}
    >
      <BookingForm token={token} slots={bundle.slots} />
    </ClientFrame>
  );
}
