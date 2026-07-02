import { redirect } from "next/navigation";
import { AgencyShell } from "@/components/agency-shell";
import { requireCurrentAgency } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase";
import { updatePasswordAction } from "@/lib/auth-actions";

export const dynamic = "force-dynamic";

async function saveSettingsAction(formData: FormData) {
  "use server";

  const { agency } = await requireCurrentAgency();
  const supabase = await createServerSupabase();
  await supabase
    .from("agencies")
    .update({
      name: String(formData.get("name") ?? agency.name),
      logo_url: String(formData.get("logo_url") ?? "") || null,
      brand_color: String(formData.get("brand_color") ?? "") || null,
      outbound_webhook_url: String(formData.get("outbound_webhook_url") ?? "") || null,
    })
    .eq("id", agency.id);

  redirect("/settings?saved=1");
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const { agency, email } = await requireCurrentAgency();
  return (
    <AgencyShell title="Settings" active="Settings">
      {params.error ? (
        <p className="mb-4 rounded-lg bg-[var(--red-tint)] px-3 py-2 text-sm text-[var(--red)]">{params.error}</p>
      ) : null}
      {params.saved ? (
        <p className="mb-4 rounded-lg bg-[var(--teal-tint)] px-3 py-2 text-sm text-[var(--teal)]">Saved.</p>
      ) : null}
      <form action={saveSettingsAction} className="card space-y-5 p-6">
        <label className="block">
          <span className="label">Agency name</span>
          <input className="field mt-1" name="name" defaultValue={agency.name} />
        </label>
        <label className="block">
          <span className="label">Logo URL</span>
          <input className="field mt-1" name="logo_url" defaultValue={agency.logo_url ?? ""} />
        </label>
        <label className="block">
          <span className="label">Brand color</span>
          <input className="field mt-1" name="brand_color" defaultValue={agency.brand_color ?? ""} placeholder="#132420" />
        </label>
        <label className="block">
          <span className="label">Zapier / Make webhook URL</span>
          <input
            className="field mt-1"
            name="outbound_webhook_url"
            defaultValue={agency.outbound_webhook_url ?? ""}
            placeholder="https://hooks.zapier.com/..."
          />
          <span className="mt-2 block text-xs text-[var(--ink-soft)]">
            Sends intake, signature, payment, booking, and completion events.
          </span>
        </label>
        <label className="block">
          <span className="label">Account email</span>
          <input className="field mt-1" value={email} disabled />
        </label>
        <button className="btn-primary w-full md:w-auto md:px-6" type="submit">
          Save settings
        </button>
      </form>
      <form action={updatePasswordAction} className="card mt-6 space-y-5 p-6">
        <h2 className="serif text-[19px] font-medium">Password</h2>
        <label className="block">
          <span className="label">New password</span>
          <input className="field mt-1" name="password" type="password" minLength={8} required />
        </label>
        <button className="btn-secondary w-full md:w-auto md:px-6" type="submit">
          Update password
        </button>
      </form>
    </AgencyShell>
  );
}
