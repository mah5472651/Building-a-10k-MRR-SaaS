import type { Client, ClientStep } from "@/types/handoff";

export const clientSteps: { key: ClientStep; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "agreement", label: "Agreement" },
  { key: "deposit", label: "Deposit" },
  { key: "kickoff", label: "Kickoff" },
];

export function completedStepCount(client: Pick<Client, "name" | "signed_at" | "paid_at" | "scheduled_at">) {
  return [
    Boolean(client.name),
    Boolean(client.signed_at),
    Boolean(client.paid_at),
    Boolean(client.scheduled_at),
  ].filter(Boolean).length;
}

export function statusLabel(status: string) {
  if (status === "completed") return "Onboarded";
  if (status === "in_progress") return "In progress";
  return "Link sent";
}

export function isSubscriptionUsable(status?: string | null, trialEndsAt?: string | null) {
  if (status === "active" || status === "trialing") return true;
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt).getTime() > Date.now();
}

export function nextClientPath(token: string, client: Pick<Client, "name" | "signed_at" | "paid_at" | "scheduled_at">) {
  if (!client.name) return `/c/${token}`;
  if (!client.signed_at) return `/c/${token}/agreement`;
  if (!client.paid_at) return `/c/${token}/deposit`;
  if (!client.scheduled_at) return `/c/${token}/kickoff`;
  return `/c/${token}/confirmation`;
}
