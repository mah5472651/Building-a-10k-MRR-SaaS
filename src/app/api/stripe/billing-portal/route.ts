import { NextResponse } from "next/server";
import { appUrl } from "@/lib/env";
import { requireCurrentAgency } from "@/lib/data";
import { getStripe } from "@/lib/stripe";

export async function POST() {
  const { agency } = await requireCurrentAgency();
  if (!agency.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer exists yet." }, { status: 400 });
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: agency.stripe_customer_id,
    return_url: `${appUrl}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
