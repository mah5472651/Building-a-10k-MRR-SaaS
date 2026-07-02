import { redirect } from "next/navigation";
import { AgencyShell } from "@/components/agency-shell";
import { QuestionEditor } from "@/components/question-editor";
import { RemoveSlotButton } from "@/components/remove-slot-button";
import { defaultContractText, defaultQuestions, getActiveFlow, getDashboardData, requireCurrentAgency } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

async function saveFlowAction(formData: FormData) {
  "use server";

  const { agency } = await requireCurrentAgency();
  const supabase = await createServerSupabase();
  const flowId = String(formData.get("flow_id") ?? "");
  let questions = defaultQuestions;
  try {
    const parsed = JSON.parse(String(formData.get("questions_json") ?? "[]"));
    if (Array.isArray(parsed) && parsed.length) {
      questions = parsed
        .filter((item) => typeof item?.label === "string" && item.label.trim())
        .slice(0, 12)
        .map((item, index) => ({
          id: typeof item.id === "string" && item.id ? item.id : `question-${index + 1}`,
          label: item.label.trim(),
        }));
    }
  } catch {
    questions = defaultQuestions;
  }

  await supabase
    .from("onboarding_flows")
    .update({
      title: String(formData.get("title") ?? "Client onboarding"),
      questions,
      contract_text: String(formData.get("contract_text") ?? defaultContractText),
      deposit_amount: Number(formData.get("deposit_amount") ?? 0),
      updated_at: new Date().toISOString(),
    })
    .eq("id", flowId)
    .eq("agency_id", agency.id);

  const slotDatetime = String(formData.get("slot_datetime") ?? "");
  if (slotDatetime) {
    await supabase.from("available_slots").insert({ agency_id: agency.id, datetime: slotDatetime });
  }

  redirect("/flow?saved=1");
}

export default async function FlowPage() {
  const { agency } = await requireCurrentAgency();
  const flow = await getActiveFlow(agency.id);
  const { slots } = await getDashboardData(agency.id);

  if (!flow) redirect("/onboarding");

  return (
    <AgencyShell title="Onboarding flow" active="Onboarding flow">
      <form action={saveFlowAction} className="space-y-5">
        <input type="hidden" name="flow_id" value={flow.id} />
        <section className="card p-6">
          <h2 className="serif mb-4 text-[19px] font-medium">Details</h2>
          <label className="block">
            <span className="label">Flow title</span>
            <input className="field mt-1" name="title" defaultValue={flow.title} />
          </label>
          <div className="mt-5">
            <QuestionEditor questions={flow.questions} />
          </div>
        </section>

        <section className="card p-6">
          <h2 className="serif mb-4 text-[19px] font-medium">Agreement</h2>
          <textarea className="field min-h-56" name="contract_text" defaultValue={flow.contract_text} />
        </section>

        <section className="card p-6">
          <h2 className="serif mb-4 text-[19px] font-medium">Deposit</h2>
          <label className="block max-w-xs">
            <span className="label">Fixed deposit, USD</span>
            <input className="field mt-1" name="deposit_amount" type="number" min="0" defaultValue={flow.deposit_amount} />
          </label>
        </section>

        <section className="card p-6">
          <h2 className="serif mb-4 text-[19px] font-medium">Kickoff</h2>
          <label className="block max-w-xs">
            <span className="label">Add available slot</span>
            <input className="field mt-1" name="slot_datetime" type="datetime-local" />
          </label>
          <div className="mt-5 space-y-2 text-sm">
            {slots.length ? (
              slots.map((slot) => (
                <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-2" key={slot.id}>
                  <span>{new Date(slot.datetime).toLocaleString()}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--ink-soft)]">{slot.is_booked ? "Booked" : "Open"}</span>
                    {!slot.is_booked ? (
                      <RemoveSlotButton slotId={slot.id} />
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[var(--ink-soft)]">No slots yet.</p>
            )}
          </div>
        </section>

        <button className="btn-primary w-full md:w-auto md:px-6" type="submit">
          Save flow
        </button>
      </form>
    </AgencyShell>
  );
}
