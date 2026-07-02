import { redirect } from "next/navigation";
import type { Agency, AvailableSlot, Client, ClientBundle, ClientFile, OnboardingFlow, PaymentMilestone } from "@/types/handoff";
import { createServerSupabase, createServiceSupabase } from "./supabase";
import { isSubscriptionUsable } from "./state";

export type CurrentAgency = {
  userId: string;
  email: string;
  agency: Agency;
};

export async function requireCurrentAgency(): Promise<CurrentAgency> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("agency:agencies(*)")
    .eq("id", user.id)
    .single();

  const agency = Array.isArray(profile?.agency) ? profile.agency[0] : profile?.agency;

  if (!agency) {
    redirect("/onboarding");
  }

  return {
    userId: user.id,
    email: user.email ?? agency.email,
    agency: agency as Agency,
  };
}

export async function getActiveFlow(agencyId: string) {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("onboarding_flows")
    .select("*")
    .eq("agency_id", agencyId)
    .eq("active", true)
    .single();

  if (error) return null;
  return data as OnboardingFlow;
}

export async function getFlows(agencyId: string) {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("onboarding_flows")
    .select("*")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: true });
  return (data ?? []) as OnboardingFlow[];
}

export async function getDashboardData(agencyId: string) {
  const supabase = await createServerSupabase();
  const [{ data: clients }, { data: slots }, flows] = await Promise.all([
    supabase
      .from("clients")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("available_slots")
      .select("*")
      .eq("agency_id", agencyId)
      .order("datetime", { ascending: true }),
    getFlows(agencyId),
  ]);

  const rows = (clients ?? []) as Client[];
  return {
    flow: flows.find((flow) => flow.active) ?? flows[0] ?? null,
    flows,
    slots: (slots ?? []) as AvailableSlot[],
    clients: rows,
    stats: {
      total: rows.length,
      inProgress: rows.filter((client) => client.status === "in_progress").length,
      completed: rows.filter((client) => client.status === "completed").length,
      weeklyCollected: rows
        .filter((client) => client.paid_at && new Date(client.paid_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
        .reduce((sum, client) => sum + Number(client.amount_paid ?? 0), 0),
    },
    needsAttention: rows.filter((client) => {
      if (client.status === "completed") return false;
      const last = new Date(client.last_active_at ?? client.created_at).getTime();
      return Date.now() - last > 72 * 60 * 60 * 1000;
    }),
  };
}

export function getAverageCompletionMinutes(clients: Client[]) {
  const completed = clients.filter((client) => client.scheduled_at);
  if (!completed.length) return 4;
  const minutes = completed.map((client) => {
    const start = new Date(client.created_at).getTime();
    const end = new Date(client.scheduled_at ?? client.updated_at).getTime();
    return Math.max(1, Math.round((end - start) / 60000));
  });
  return Math.max(1, Math.round(minutes.reduce((sum, item) => sum + item, 0) / minutes.length));
}

export function getDepositRecommendation(clients: Client[]) {
  const paidClients = clients.filter((client) => Number(client.amount_paid ?? 0) > 0);
  if (paidClients.length < 4) {
    return "Collect a few more deposits and Aeitron AI will recommend the range clients complete most often.";
  }
  const buckets = [
    { label: "$0-499", min: 0, max: 499 },
    { label: "$500-750", min: 500, max: 750 },
    { label: "$751-1000", min: 751, max: 1000 },
    { label: "$1000+", min: 1001, max: Infinity },
  ].map((bucket) => {
    const rows = paidClients.filter((client) => Number(client.amount_paid) >= bucket.min && Number(client.amount_paid) <= bucket.max);
    const completed = rows.filter((client) => client.status === "completed").length;
    return { ...bucket, total: rows.length, rate: rows.length ? completed / rows.length : 0 };
  });
  const best = buckets.sort((a, b) => b.rate - a.rate)[0];
  return `Clients in the ${best.label} deposit range complete onboarding most often in your data. Consider testing that range.`;
}

export async function getClientDetail(clientId: string, agencyId: string) {
  const supabase = await createServerSupabase();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .eq("agency_id", agencyId)
    .single();

  if (!client) return null;

  const { data: flow } = await supabase
    .from("onboarding_flows")
    .select("*")
    .eq("id", client.flow_id)
    .single();

  const { data: files } = await supabase
    .from("client_files")
    .select("*")
    .eq("client_id", client.id)
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  return { client: client as Client, flow: flow as OnboardingFlow, files: (files ?? []) as ClientFile[] };
}

export async function getClientBundleByToken(token: string): Promise<ClientBundle | null> {
  const supabase = createServiceSupabase();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("unique_link_token", token)
    .single();

  if (!client) return null;

  const [{ data: agency }, { data: flow }, { data: slots }, { data: files }, { data: agencyClients }] = await Promise.all([
    supabase.from("agencies").select("*").eq("id", client.agency_id).single(),
    supabase.from("onboarding_flows").select("*").eq("id", client.flow_id).single(),
    supabase
      .from("available_slots")
      .select("*")
      .eq("agency_id", client.agency_id)
      .eq("is_booked", false)
      .order("datetime", { ascending: true }),
    supabase
      .from("client_files")
      .select("*")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("*").eq("agency_id", client.agency_id),
  ]);

  if (!agency || !flow) return null;
  const slotRows = (slots ?? []) as AvailableSlot[];
  const oneWeekFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
  return {
    agency: agency as Agency,
    flow: flow as OnboardingFlow,
    client: client as Client,
    slots: slotRows,
    files: (files ?? []) as ClientFile[],
    averageCompletionMinutes: getAverageCompletionMinutes((agencyClients ?? []) as Client[]),
    openSlotsThisWeek: slotRows.filter((slot) => {
      const time = new Date(slot.datetime).getTime();
      return time >= Date.now() && time <= oneWeekFromNow;
    }).length,
  };
}

export function canGenerateClientLink(agency: Agency) {
  return isSubscriptionUsable(agency.subscription_status, agency.trial_ends_at);
}

export const defaultQuestions = [
  { id: "project-goals", label: "What outcome matters most for this project?" },
  { id: "timeline", label: "Is there a deadline or launch window we should know about?" },
];

export const defaultContractText =
  "This agreement confirms the client authorizes the agency to begin the onboarding and kickoff process for the described services. The deposit is due before kickoff and will be applied to the project balance. By typing your name, you agree that this electronic signature is valid and binding.";

export const defaultPaymentSchedule: PaymentMilestone[] = [
  { id: "deposit", label: "Deposit", amount: 500, due: "onboarding" },
];
