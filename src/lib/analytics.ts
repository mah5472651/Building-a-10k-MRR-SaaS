import type { AlertRule, Client, OnboardingFlow, PaymentEvent } from "@/types/handoff";
import { completedStepCount } from "./state";
import { createServerSupabase } from "./supabase";

const stages = [
  { key: "details", label: "Intake" },
  { key: "agreement", label: "Agreement" },
  { key: "deposit", label: "Deposit" },
  { key: "kickoff", label: "Kickoff" },
] as const;

export async function getAgencyAnalytics(agencyId: string) {
  const supabase = await createServerSupabase();
  const [{ data: clients }, { data: flows }, { data: paymentEvents }] = await Promise.all([
    supabase.from("clients").select("*").eq("agency_id", agencyId).order("created_at", { ascending: false }),
    supabase.from("onboarding_flows").select("*").eq("agency_id", agencyId),
    supabase
      .from("payment_events")
      .select("*,client:clients(name,email)")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const clientRows = (clients ?? []) as Client[];
  const flowRows = (flows ?? []) as OnboardingFlow[];
  const flowById = new Map(flowRows.map((flow) => [flow.id, flow]));
  const now = Date.now();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const revenueRows = clientRows
    .filter((client) => !client.paid_at && client.status !== "completed")
    .map((client) => {
      const flow = flowById.get(client.flow_id);
      const value = getDepositValue(flow);
      const daysStalled = Math.max(0, Math.floor((now - new Date(client.last_active_at ?? client.updated_at ?? client.created_at).getTime()) / 86400000));
      return {
        client,
        value,
        daysStalled,
        stage: getStuckStage(client),
        atRisk: daysStalled >= 2,
      };
    })
    .sort((a, b) => Number(b.atRisk) - Number(a.atRisk) || b.value - a.value);

  const stageCounts = {
    details: clientRows.length,
    agreement: clientRows.filter((client) => client.name).length,
    deposit: clientRows.filter((client) => client.signed_at).length,
    kickoff: clientRows.filter((client) => client.paid_at).length,
    completed: clientRows.filter((client) => client.scheduled_at).length,
  };

  const bottlenecks = stages.map((stage, index) => {
    const current = stageCounts[stage.key];
    const next = index === stages.length - 1 ? stageCounts.completed : stageCounts[stages[index + 1].key];
    const drop = current ? Math.round(((current - next) / current) * 100) : 0;
    return { ...stage, current, next, drop };
  });

  const biggestBottleneck = bottlenecks.reduce((winner, row) => (row.drop > winner.drop ? row : winner), bottlenecks[0]);
  const flowComparison = flowRows.map((flow) => {
    const rows = clientRows.filter((client) => client.flow_id === flow.id);
    return {
      flow,
      total: rows.length,
      completed: rows.filter((client) => client.status === "completed").length,
      conversion: rows.length ? Math.round((rows.filter((client) => client.status === "completed").length / rows.length) * 100) : 0,
    };
  });

  const timeToClose = {
    createdToSignedHours: averageHours(clientRows, "created_at", "signed_at"),
    signedToPaidHours: averageHours(clientRows, "signed_at", "paid_at"),
    paidToBookedHours: averageHours(clientRows, "paid_at", "scheduled_at"),
    totalHours: averageHours(clientRows, "created_at", "scheduled_at"),
  };

  const sendHeatmap = buildSendHeatmap(clientRows);
  const followUps = revenueRows
    .map((row) => ({
      ...row,
      score: Math.round(row.value * Math.max(1, row.daysStalled) * (1 + completedStepCount(row.client) / 4)),
      reason: `${row.client.name ?? "Client"} is stuck at ${row.stage} for ${row.daysStalled} day(s), with $${row.value.toFixed(2)} pending.`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const cohorts = buildCohorts(clientRows);
  const teamPerformance = [
    {
      member: "Agency owner",
      clients: clientRows.length,
      completed: clientRows.filter((client) => client.status === "completed").length,
      conversion: clientRows.length ? Math.round((clientRows.filter((client) => client.status === "completed").length / clientRows.length) * 100) : 0,
      responseHours: Math.round(timeToClose.createdToSignedHours || 0),
    },
  ];

  return {
    revenue: {
      pending: revenueRows.reduce((sum, row) => sum + row.value, 0),
      atRisk: revenueRows.filter((row) => row.atRisk).reduce((sum, row) => sum + row.value, 0),
      potentialLostThisMonth: revenueRows
        .filter((row) => row.atRisk && new Date(row.client.updated_at).getTime() >= monthStart.getTime())
        .reduce((sum, row) => sum + row.value, 0),
      rows: revenueRows,
    },
    bottlenecks,
    biggestBottleneck,
    flowComparison,
    timeToClose,
    sendHeatmap,
    followUps,
    cohorts,
    paymentEvents: (paymentEvents ?? []) as PaymentEvent[],
    teamPerformance,
  };
}

export const defaultAlertRules: AlertRule[] = [
  { id: "deposit-48h", name: "Deposit pending over 48h", stage: "deposit", threshold_hours: 48, enabled: true },
  { id: "agreement-24h", name: "Agreement unsigned over 24h", stage: "agreement", threshold_hours: 24, enabled: true },
];

function getDepositValue(flow?: OnboardingFlow) {
  const milestone = flow?.payment_schedule?.find((item) => item.due === "onboarding") ?? flow?.payment_schedule?.[0];
  return Number(milestone?.amount ?? flow?.deposit_amount ?? 0);
}

function getStuckStage(client: Client) {
  if (!client.name) return "intake";
  if (!client.signed_at) return "agreement";
  if (!client.paid_at) return "deposit";
  if (!client.scheduled_at) return "kickoff";
  return "completed";
}

function averageHours(clients: Client[], startKey: keyof Client, endKey: keyof Client) {
  const values = clients
    .map((client) => {
      const start = client[startKey];
      const end = client[endKey];
      if (typeof start !== "string" || typeof end !== "string" || !start || !end) return null;
      return Math.max(0, (new Date(end).getTime() - new Date(start).getTime()) / 3600000);
    })
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function buildSendHeatmap(clients: Client[]) {
  return Array.from({ length: 7 }).map((_, day) =>
    Array.from({ length: 4 }).map((__, block) => {
      const count = clients.filter((client) => {
        const date = new Date(client.created_at);
        return date.getDay() === day && Math.floor(date.getHours() / 6) === block;
      }).length;
      return count;
    }),
  );
}

function buildCohorts(clients: Client[]) {
  const byMonth = new Map<string, Client[]>();
  clients.forEach((client) => {
    const month = new Date(client.created_at).toLocaleString("en", { month: "short", year: "numeric" });
    byMonth.set(month, [...(byMonth.get(month) ?? []), client]);
  });
  return Array.from(byMonth.entries()).map(([month, rows]) => {
    const emails = new Map<string, number>();
    rows.forEach((client) => {
      if (client.email) emails.set(client.email, (emails.get(client.email) ?? 0) + 1);
    });
    const repeat = Array.from(emails.values()).filter((count) => count > 1).length;
    return {
      month,
      clients: rows.length,
      repeat,
      repeatRate: rows.length ? Math.round((repeat / rows.length) * 100) : 0,
      ltv: rows.reduce((sum, client) => sum + Number(client.amount_paid ?? 0), 0),
    };
  });
}
