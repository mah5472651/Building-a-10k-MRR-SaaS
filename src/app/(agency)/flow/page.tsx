import { redirect } from "next/navigation";
import Link from "next/link";
import { AgencyShell } from "@/components/agency-shell";
import { QuestionEditor } from "@/components/question-editor";
import { RemoveSlotButton } from "@/components/remove-slot-button";
import { MilestoneEditor } from "@/components/milestone-editor";
import { defaultContractText, defaultPaymentSchedule, defaultQuestions, getDashboardData, requireCurrentAgency } from "@/lib/data";
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
          type: ["text", "textarea", "select"].includes(item.type) ? item.type : "textarea",
          options: Array.isArray(item.options) ? item.options.filter((option: unknown) => typeof option === "string" && option.trim()).slice(0, 6) : [],
          conditional_on:
            item.conditional_on?.question_id && item.conditional_on?.equals
              ? { question_id: String(item.conditional_on.question_id), equals: String(item.conditional_on.equals) }
              : null,
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
      payment_schedule: parsePaymentSchedule(formData),
      reassurance: {
        details: String(formData.get("reassurance_details") ?? ""),
        agreement: String(formData.get("reassurance_agreement") ?? ""),
        deposit: String(formData.get("reassurance_deposit") ?? ""),
        kickoff: String(formData.get("reassurance_kickoff") ?? ""),
      },
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

function parsePaymentSchedule(formData: FormData) {
  try {
    const parsed = JSON.parse(String(formData.get("payment_schedule_json") ?? "[]"));
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.slice(0, 3).map((item, index) => ({
        id: typeof item.id === "string" ? item.id : `milestone-${index + 1}`,
        label: typeof item.label === "string" ? item.label : `Milestone ${index + 1}`,
        amount: Number(item.amount) || 0,
        due: ["onboarding", "midpoint", "final"].includes(item.due) ? item.due : "onboarding",
      }));
    }
  } catch {}
  return defaultPaymentSchedule;
}

async function createFlowAction(formData: FormData) {
  "use server";

  const { agency } = await requireCurrentAgency();
  const supabase = await createServerSupabase();
  const title = String(formData.get("new_flow_title") ?? "New onboarding flow");
  const { data } = await supabase
    .from("onboarding_flows")
    .insert({
      agency_id: agency.id,
      title,
      questions: defaultQuestions,
      contract_text: defaultContractText,
      deposit_amount: defaultPaymentSchedule[0].amount,
      payment_schedule: defaultPaymentSchedule,
      active: false,
    })
    .select("id")
    .single();
  redirect(data ? `/flow?flow=${data.id}` : "/flow");
}

export default async function FlowPage({
  searchParams,
}: {
  searchParams: Promise<{ flow?: string }>;
}) {
  const params = await searchParams;
  const { agency } = await requireCurrentAgency();
  const { slots, flows } = await getDashboardData(agency.id);
  const flow = flows.find((row) => row.id === params.flow) ?? flows.find((row) => row.active) ?? flows[0];

  if (!flow) redirect("/onboarding");

  return (
    <AgencyShell title="Onboarding flow" active="Onboarding flow" agencyId={agency.id}>
      <section className="card mb-5 p-6">
        <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="serif text-[19px] font-medium">Service flows</h2>
            <p className="mt-1 text-sm text-[var(--ink-600)]">Create a separate onboarding flow for each service line.</p>
          </div>
          <form action={createFlowAction} className="flex gap-2">
            <input className="field min-w-0" name="new_flow_title" placeholder="SEO Retainer Onboarding" />
            <button className="btn-secondary" type="submit">Create</button>
          </form>
        </div>
        <div className="flex flex-wrap gap-2">
          {flows.map((item) => (
            <Link
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                item.id === flow.id ? "border-[var(--ink-800)] bg-[var(--amber-100)]" : "border-[var(--ink-100)] bg-[var(--paper-50)]"
              }`}
              href={`/flow?flow=${item.id}`}
              key={item.id}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </section>
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
          <h2 className="serif mb-4 text-[19px] font-medium">Step reassurance copy</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="label">Details step</span>
              <input className="field mt-1" name="reassurance_details" defaultValue={flow.reassurance?.details ?? ""} />
            </label>
            <label className="block">
              <span className="label">Agreement step</span>
              <input className="field mt-1" name="reassurance_agreement" defaultValue={flow.reassurance?.agreement ?? ""} />
            </label>
            <label className="block">
              <span className="label">Deposit step</span>
              <input className="field mt-1" name="reassurance_deposit" defaultValue={flow.reassurance?.deposit ?? ""} />
            </label>
            <label className="block">
              <span className="label">Kickoff step</span>
              <input className="field mt-1" name="reassurance_kickoff" defaultValue={flow.reassurance?.kickoff ?? ""} />
            </label>
          </div>
        </section>

        <section className="card p-6">
          <h2 className="serif mb-4 text-[19px] font-medium">Agreement</h2>
          <textarea className="field min-h-56" name="contract_text" defaultValue={flow.contract_text} />
        </section>

        <section className="card p-6">
          <h2 className="serif mb-4 text-[19px] font-medium">Deposit and milestones</h2>
          <label className="block max-w-xs">
            <span className="label">Fixed deposit, USD</span>
            <input className="field mt-1" name="deposit_amount" type="number" min="0" defaultValue={flow.deposit_amount} />
          </label>
          <div className="mt-5">
            <MilestoneEditor milestones={flow.payment_schedule?.length ? flow.payment_schedule : [{ id: "deposit", label: "Deposit", amount: flow.deposit_amount, due: "onboarding" }]} />
          </div>
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

        <div className="flex flex-col gap-3 md:flex-row">
          <button className="btn-primary w-full md:w-auto md:px-6" type="submit">
            Save flow
          </button>
          <Link className="btn-secondary grid place-items-center text-sm md:px-6" href={`/preview/${flow.id}`} target="_blank">
            Preview as client
          </Link>
        </div>
      </form>
    </AgencyShell>
  );
}
