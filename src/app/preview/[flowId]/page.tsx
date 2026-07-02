import { notFound } from "next/navigation";
import { ClientFrame } from "@/components/client-frame";
import { requireCurrentAgency } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase";
import type { OnboardingFlow } from "@/types/handoff";

export const dynamic = "force-dynamic";

export default async function FlowPreviewPage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = await params;
  const { agency } = await requireCurrentAgency();
  const supabase = await createServerSupabase();
  const { data: flow } = await supabase
    .from("onboarding_flows")
    .select("*")
    .eq("id", flowId)
    .eq("agency_id", agency.id)
    .single();

  if (!flow) notFound();
  const typedFlow = flow as OnboardingFlow;

  return (
    <ClientFrame
      agencyName={agency.name}
      logoUrl={agency.logo_url}
      client={{ name: null, signed_at: null, paid_at: null, scheduled_at: null }}
      current="details"
      title="Preview: Tell us the essentials"
      reassurance={typedFlow.reassurance?.details ?? "This is a no-save preview of the client experience."}
      averageMinutes={4}
      openSlotsThisWeek={0}
    >
      <div className="mb-5 rounded-lg border border-[var(--amber-200)] bg-[var(--amber-tint)] p-3 text-sm text-[var(--ink-soft)]">
        Preview mode. Submitting is disabled here; generate a client link for the real flow.
      </div>
      <div className="space-y-4 opacity-80">
        <PreviewField label="Name" />
        <PreviewField label="Email" />
        <PreviewField label="Phone" />
        {typedFlow.questions.map((question) => (
          <PreviewField label={question.label} key={question.id} multiline />
        ))}
        <button className="btn-primary w-full" disabled type="button">
          Continue to agreement
        </button>
      </div>
    </ClientFrame>
  );
}

function PreviewField({ label, multiline }: { label: string; multiline?: boolean }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {multiline ? (
        <textarea className="field mt-1 min-h-24" disabled />
      ) : (
        <input className="field mt-1" disabled />
      )}
    </label>
  );
}
