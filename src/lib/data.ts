import { redirect } from "next/navigation";
import type { Agency, AvailableSlot, Client, ClientBundle, OnboardingFlow } from "@/types/handoff";
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

export async function getDashboardData(agencyId: string) {
  const supabase = await createServerSupabase();
  const [{ data: clients }, { data: slots }, flow] = await Promise.all([
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
    getActiveFlow(agencyId),
  ]);

  const rows = (clients ?? []) as Client[];
  return {
    flow,
    slots: (slots ?? []) as AvailableSlot[],
    clients: rows,
    stats: {
      total: rows.length,
      inProgress: rows.filter((client) => client.status === "in_progress").length,
      completed: rows.filter((client) => client.status === "completed").length,
    },
  };
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

  return { client: client as Client, flow: flow as OnboardingFlow };
}

export async function getClientBundleByToken(token: string): Promise<ClientBundle | null> {
  const supabase = createServiceSupabase();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("unique_link_token", token)
    .single();

  if (!client) return null;

  const [{ data: agency }, { data: flow }, { data: slots }] = await Promise.all([
    supabase.from("agencies").select("*").eq("id", client.agency_id).single(),
    supabase.from("onboarding_flows").select("*").eq("id", client.flow_id).single(),
    supabase
      .from("available_slots")
      .select("*")
      .eq("agency_id", client.agency_id)
      .eq("is_booked", false)
      .order("datetime", { ascending: true }),
  ]);

  if (!agency || !flow) return null;
  return {
    agency: agency as Agency,
    flow: flow as OnboardingFlow,
    client: client as Client,
    slots: (slots ?? []) as AvailableSlot[],
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
