import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import { sendTransactionalEmail } from "@/lib/email";
import { sendAgencyWebhook } from "@/lib/webhooks";
import { recordNotificationEvent } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = getStripe();

  let event;
  try {
    event = secret && signature
      ? stripe.webhooks.constructEvent(payload, signature, secret)
      : JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  const supabase = createServiceSupabase();
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.metadata?.kind === "client_deposit") {
      const clientId = session.metadata.client_id;
      await supabase
        .from("clients")
        .update({
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: String(session.payment_intent ?? ""),
          amount_paid: Number(session.amount_total ?? 0) / 100,
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", clientId);

      const { data: client } = await supabase
        .from("clients")
        .select("*,agency:agencies(*)")
        .eq("id", clientId)
        .single();
      const agency = Array.isArray(client?.agency) ? client.agency[0] : client?.agency;
      if (agency?.email) {
        await sendTransactionalEmail({
          to: agency.email,
          subject: "A client paid their deposit",
          html: `<p>${client?.name ?? "A client"} paid the onboarding deposit for ${agency.name}.</p>`,
        });
      }
      if (agency && client) {
        await recordNotificationEvent({ agencyId: agency.id, clientId, event: "paid" });
        await sendAgencyWebhook({
          agency,
          event: "paid",
          client: {
            ...client,
            paid_at: new Date().toISOString(),
            amount_paid: Number(session.amount_total ?? 0) / 100,
          },
        });
      }
    }

    if (session.metadata?.kind === "agency_subscription") {
      await supabase
        .from("agencies")
        .update({
          stripe_customer_id: String(session.customer ?? ""),
          stripe_subscription_id: String(session.subscription ?? ""),
          subscription_status: "active",
          plan: session.metadata.plan ?? "starter",
        })
        .eq("id", session.metadata.agency_id);
    }
  }

  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object;
    if (session.metadata?.kind === "client_deposit" && session.metadata.agency_id) {
      await supabase.from("payment_events").insert({
        agency_id: session.metadata.agency_id,
        client_id: session.metadata.client_id ?? null,
        kind: "deposit",
        status: "failed",
        amount: Number(session.amount_total ?? 0) / 100,
        provider_event_id: event.id,
        failure_reason: "Checkout payment failed",
      });
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    if (paymentIntent.metadata?.kind === "client_deposit" && paymentIntent.metadata.agency_id) {
      await supabase.from("payment_events").insert({
        agency_id: paymentIntent.metadata.agency_id,
        client_id: paymentIntent.metadata.client_id ?? null,
        kind: "deposit",
        status: "declined",
        amount: Number(paymentIntent.amount ?? 0) / 100,
        provider_event_id: event.id,
        failure_reason: paymentIntent.last_payment_error?.message ?? "Card payment failed",
      });
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    await supabase
      .from("agencies")
      .update({
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
      })
      .eq("stripe_customer_id", subscription.customer);
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;
    if (invoice.customer) {
      await supabase
        .from("agencies")
        .update({ subscription_status: "active" })
        .eq("stripe_customer_id", invoice.customer);
    }
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    if (invoice.customer) {
      const { data: agency } = await supabase
        .from("agencies")
        .select("id")
        .eq("stripe_customer_id", invoice.customer)
        .single();

      if (agency?.id) {
        await supabase.from("payment_events").insert({
          agency_id: agency.id,
          client_id: null,
          kind: "subscription",
          status: "failed",
          amount: Number(invoice.amount_due ?? 0) / 100,
          provider_event_id: event.id,
          failure_reason: "Subscription invoice payment failed",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
