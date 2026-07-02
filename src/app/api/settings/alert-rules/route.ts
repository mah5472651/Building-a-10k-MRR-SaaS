import { NextRequest, NextResponse } from "next/server";
import { defaultAlertRules } from "@/lib/analytics";
import { requireCurrentAgency } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase";
import type { AlertRule } from "@/types/handoff";

export async function GET() {
  const { agency } = await requireCurrentAgency();
  return NextResponse.json({ rules: agency.alert_rules?.length ? agency.alert_rules : defaultAlertRules });
}

export async function POST(request: NextRequest) {
  const { agency } = await requireCurrentAgency();
  const body = await request.json();
  const rules: Partial<AlertRule>[] = Array.isArray(body.rules) ? body.rules : [body];
  const parsed = rules
    .filter((rule): rule is AlertRule => Boolean(rule?.stage && rule?.threshold_hours))
    .map((rule) => ({
      id: String(rule.id ?? `${rule.stage}-${rule.threshold_hours}`),
      name: String(rule.name ?? `${rule.stage} pending`),
      stage: rule.stage,
      threshold_hours: Math.max(1, Number(rule.threshold_hours)),
      enabled: Boolean(rule.enabled),
    }));

  const supabase = await createServerSupabase();
  await supabase.from("agencies").update({ alert_rules: parsed }).eq("id", agency.id);
  return NextResponse.json({ rules: parsed });
}

export async function DELETE(request: NextRequest) {
  const { agency } = await requireCurrentAgency();
  const { id } = await request.json();
  const rules = (agency.alert_rules?.length ? agency.alert_rules : defaultAlertRules).filter((rule) => rule.id !== id);
  const supabase = await createServerSupabase();
  await supabase.from("agencies").update({ alert_rules: rules }).eq("id", agency.id);
  return NextResponse.json({ rules });
}
