import type { ClientStep } from "@/types/handoff";
import { createServiceSupabase } from "./supabase";

export async function recordStageEvent(input: {
  agencyId: string;
  clientId: string;
  stage: ClientStep;
}) {
  const supabase = createServiceSupabase();
  await supabase.from("stage_events").insert({
    agency_id: input.agencyId,
    client_id: input.clientId,
    stage: input.stage,
  });

  const update: Record<string, string> = {
    current_stage: input.stage,
    last_active_at: new Date().toISOString(),
  };
  if (input.stage === "details") {
    update.link_sent_at = new Date().toISOString();
  }

  await supabase.from("clients").update(update).eq("id", input.clientId);
}
