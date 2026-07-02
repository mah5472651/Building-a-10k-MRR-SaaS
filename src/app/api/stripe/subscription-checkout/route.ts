import { NextRequest, NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { requireCurrentAgency } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase";
import { getStripe, planPriceIds } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const { plan } = await request.json();
  const price = planPriceIds[plan as keyof typeof planPriceIds];
  if (!price) return NextResponse.json({ error: "Plan is not configured." }, { status: 400 });

  const { agency } = await requireCurrentAgency();
  const supabase = await createServerSupabase();
  const stripe = getStripe();

  const customer =
    agency.stripe_customer_id ??
    (
      await stripe.customers.create({
        email: agency.email,
        name: agency.name,
        metadata: { agency_id: agency.id },
      })
    ).id;

  if (!agency.stripe_customer_id) {
    await supabase.from("agencies").update({ stripe_customer_id: customer }).eq("id", agency.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price, quantity: 1 }],
    metadata: { kind: "agency_subscription", agency_id: agency.id, plan },
    success_url: `${appUrl}/billing?subscribed=1`,
    cancel_url: `${appUrl}/billing?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}
