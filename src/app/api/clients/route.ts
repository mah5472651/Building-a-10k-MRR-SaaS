import { NextResponse } from "next/server";
import { getDashboardData, requireCurrentAgency } from "@/lib/data";

export async function GET() {
  const { agency } = await requireCurrentAgency();
  const { clients } = await getDashboardData(agency.id);

  return NextResponse.json({
    clients: clients.slice(0, 30).map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      status: client.status,
    })),
  });
}
