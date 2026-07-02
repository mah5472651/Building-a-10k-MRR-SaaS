import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { createServerSupabase, createServiceSupabase } from "@/lib/supabase";
import { defaultContractText, defaultQuestions } from "@/lib/data";

export const dynamic = "force-dynamic";

async function createAgencyAction(formData: FormData) {
  "use server";

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) redirect("/login");

  const serviceSupabase = createServiceSupabase();
  const agencyName = String(formData.get("agency_name") ?? "");
  const logoUrl = String(formData.get("logo_url") ?? "");
  const q1 = String(formData.get("question_1") ?? defaultQuestions[0].label);
  const q2 = String(formData.get("question_2") ?? defaultQuestions[1].label);
  const depositAmount = Number(formData.get("deposit_amount") ?? 0);
  const slotDatetime = String(formData.get("slot_datetime") ?? "");

  const { data: existingProfile } = await serviceSupabase
    .from("users")
    .select("agency_id")
    .eq("id", user.id)
    .single();

  if (existingProfile?.agency_id) redirect("/dashboard");

  const { data: agency, error: agencyError } = await serviceSupabase
    .from("agencies")
    .insert({ name: agencyName, email: user.email, logo_url: logoUrl || null })
    .select("*")
    .single();

  if (agencyError || !agency) redirect("/onboarding?error=Could not create agency");

  await serviceSupabase.from("users").insert({
    id: user.id,
    agency_id: agency.id,
    email: user.email,
    role: "owner",
  });

  const { data: flow } = await serviceSupabase
    .from("onboarding_flows")
    .insert({
      agency_id: agency.id,
      title: "Client onboarding",
      questions: [
        { id: "project-goals", label: q1 },
        { id: "timeline", label: q2 },
      ],
      contract_text: defaultContractText,
      deposit_amount: depositAmount,
    })
    .select("*")
    .single();

  if (slotDatetime) {
    await serviceSupabase.from("available_slots").insert({
      agency_id: agency.id,
      datetime: slotDatetime,
    });
  }

  if (flow) {
    const { data: client } = await serviceSupabase
      .from("clients")
      .insert({ agency_id: agency.id, flow_id: flow.id })
      .select("unique_link_token")
      .single();
    redirect(client ? `/dashboard?link=${client.unique_link_token}` : "/dashboard");
  }

  redirect("/dashboard");
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-[var(--paper)] px-4 py-8">
      <section className="mx-auto max-w-[640px]">
        <div className="mb-7">
          <Logo />
        </div>
        <form action={createAgencyAction} className="card space-y-7 p-7">
          <div>
            <h1 className="serif text-[22px] font-medium">Set up your first onboarding flow</h1>
            {params.error ? <p className="mt-3 text-sm text-[var(--red)]">{params.error}</p> : null}
          </div>
          <WizardSection number="1" title="Agency">
            <label className="block">
              <span className="label">Agency name</span>
              <input className="field mt-1" name="agency_name" required placeholder="Northline Studio" />
            </label>
            <label className="block">
              <span className="label">Logo URL optional</span>
              <input className="field mt-1" name="logo_url" placeholder="https://..." />
            </label>
          </WizardSection>
          <WizardSection number="2" title="Intake">
            <div className="grid gap-3">
              <p className="label">Starter questions</p>
              <input className="field" name="question_1" defaultValue={defaultQuestions[0].label} required />
              <input className="field" name="question_2" defaultValue={defaultQuestions[1].label} required />
            </div>
          </WizardSection>
          <WizardSection number="3" title="Deposit and kickoff">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="label">Deposit amount, USD</span>
                <input className="field mt-1" name="deposit_amount" type="number" min="0" defaultValue="500" />
              </label>
              <label className="block">
                <span className="label">First kickoff slot</span>
                <input className="field mt-1" name="slot_datetime" type="datetime-local" required />
              </label>
            </div>
          </WizardSection>
          <div className="rounded-xl bg-[var(--amber-tint)] p-4 text-sm text-[var(--amber-deep)]">
            Finish setup and Aeitron AI will create your first client link.
          </div>
          <button className="btn-primary w-full" type="submit">
            Your onboarding link is ready
          </button>
        </form>
      </section>
    </main>
  );
}

function WizardSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[var(--line)] pt-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--ink)] text-sm font-medium text-[var(--amber-tint)]">
          {number}
        </span>
        <h2 className="serif text-[18px] font-medium">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
