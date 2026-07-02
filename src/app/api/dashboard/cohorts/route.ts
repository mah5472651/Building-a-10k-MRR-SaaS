import { NextResponse } from "next/server";
import { getAgencyAnalytics } from "@/lib/analytics";
import { requireCurrentAgency } from "@/lib/data";

export async function GET() {
  const { agency } = await requireCurrentAgency();
  const analytics = await getAgencyAnalytics(agency.id);
  return NextResponse.json({ cohorts: analytics.cohorts });
}
