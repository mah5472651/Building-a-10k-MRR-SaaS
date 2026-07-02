import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { AgencyShell } from "@/components/agency-shell";
import { CopyButton } from "@/components/copy-button";
import { ProgressDots } from "@/components/progress-dots";
import { SendLinkForm } from "@/components/send-link-form";
import { completedStepCount } from "@/lib/state";
import { appUrl } from "@/lib/env";
import { getClientDetail, requireCurrentAgency } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { agency } = await requireCurrentAgency();
  const detail = await getClientDetail(id, agency.id);
  if (!detail) notFound();

  const { client, flow } = detail;
  const clientUrl = `${appUrl}/c/${client.unique_link_token}`;

  return (
    <AgencyShell title={client.name ?? "Client detail"} active="Clients" agencyId={agency.id}>
      <Link href="/dashboard#clients" className="mb-5 inline-block text-sm text-[var(--ink-soft)]">
        Back to clients
      </Link>
      <section className="card mb-6 p-6">
        <h2 className="serif mb-4 text-[19px] font-medium">Client link</h2>
        <div className="flex flex-col gap-3 rounded-lg border border-dashed border-[var(--line-strong)] p-3 md:flex-row md:items-center">
          <code className="flex-1 break-all font-mono text-xs">{clientUrl}</code>
          <CopyButton value={clientUrl} />
          <Link className="btn-secondary grid place-items-center px-3 text-sm" href={clientUrl} target="_blank">
            Open
          </Link>
        </div>
        <SendLinkForm clientId={client.id} />
      </section>

      <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
        <section className="card p-6">
          <h2 className="serif mb-5 text-[19px] font-medium">Progress</h2>
          <ProgressDots count={completedStepCount(client)} size={10} />
          <div className="mt-5 space-y-3 text-sm">
            {[
              ["Details", client.name],
              ["Agreement", client.signed_at],
              ["Deposit", client.paid_at],
              ["Kickoff", client.scheduled_at],
            ].map(([label, value]) => (
              <div className="flex items-center justify-between border-t border-[var(--line)] pt-3" key={label}>
                <span>{label}</span>
                <span className={value ? "text-[var(--teal)]" : "text-[var(--ink-soft)]"}>
                  {value ? "Complete" : "Waiting"}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="serif mb-5 text-[19px] font-medium">Client responses</h2>
          <KeyValue label="Name" value={client.name} />
          <KeyValue label="Email" value={client.email} />
          <KeyValue label="Phone" value={client.phone} />
          {flow.questions.map((question) => (
            <KeyValue key={question.id} label={question.label} value={client.answers?.[question.id]} />
          ))}
          <KeyValue label="Signature" value={client.signature_name} />
          <KeyValue label="Signature IP" value={client.signature_ip} />
          <KeyValue label="User agent" value={client.signature_user_agent} />
          <KeyValue label="Booked time" value={client.meeting_time} />
          {client.signed_at ? (
            <Link className="btn-secondary mt-4 flex items-center justify-center gap-2 text-sm" href={`/api/clients/${client.id}/signature-record`} target="_blank">
              <FileText size={15} />
              View signature record
            </Link>
          ) : null}
          <Link className="btn-secondary mt-3 flex items-center justify-center gap-2 text-sm" href={`/api/clients/${client.id}/summary`} target="_blank">
            <FileText size={15} />
            View onboarding summary
          </Link>
        </section>
      </div>
      <section className="card mt-6 p-6">
        <h2 className="serif mb-4 text-[19px] font-medium">Uploaded files</h2>
        {detail.files.length ? (
          <div className="space-y-2">
            {detail.files.map((file) => (
              <a
                className="flex items-center justify-between rounded-lg border border-[var(--ink-100)] bg-[var(--paper-50)] px-3 py-2 text-sm"
                href={`/api/client-files/${file.id}/download`}
                key={file.id}
              >
                <span>{file.file_name}</span>
                <Download size={15} />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--ink-soft)]">No files uploaded yet.</p>
        )}
      </section>
      <section className="card mt-6 p-6">
        <h2 className="serif mb-4 text-[19px] font-medium">Payment schedule</h2>
        {(flow.payment_schedule?.length ? flow.payment_schedule : [{ id: "deposit", label: "Deposit", amount: flow.deposit_amount, due: "onboarding" }]).map((milestone) => (
          <div className="flex justify-between border-t border-[var(--line)] py-3 text-sm" key={milestone.id}>
            <span>{milestone.label} <span className="text-[var(--ink-soft)]">({milestone.due})</span></span>
            <span className="font-mono">${Number(milestone.amount).toFixed(2)}</span>
          </div>
        ))}
      </section>
    </AgencyShell>
  );
}

function KeyValue({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-2 border-t border-[var(--line)] py-3 text-sm md:grid-cols-[180px_1fr]">
      <dt className="text-[var(--ink-soft)]">{label}</dt>
      <dd className="md:text-right">{value || "—"}</dd>
    </div>
  );
}
