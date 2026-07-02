import { NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { getClientBundleByToken } from "@/lib/data";
import { createServiceSupabase } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  const bundle = await getClientBundleByToken(String(token));
  if (!bundle) return NextResponse.json({ error: "Invalid client link." }, { status: 404 });

  const amount = Math.max(0, Math.round(Number(bundle.flow.deposit_amount) * 100));
  if (amount === 0) {
    await createServiceSupabase()
      .from("clients")
      .update({
        paid_at: new Date().toISOString(),
        amount_paid: 0,
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bundle.client.id);
    return NextResponse.json({ url: `/c/${token}/kickoff` });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 503 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: bundle.client.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: { name: `${bundle.agency.name} onboarding deposit` },
          unit_amount: amount,
        },
      },
    ],
    metadata: {
      kind: "client_deposit",
      client_id: bundle.client.id,
      token,
    },
    success_url: `${appUrl}/c/${token}/kickoff?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/c/${token}/deposit?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
