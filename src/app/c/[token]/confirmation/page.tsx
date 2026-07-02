import { CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { ClientFrame } from "@/components/client-frame";
import { getClientBundleByToken } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const bundle = await getClientBundleByToken(token);
  if (!bundle) notFound();

  return (
    <ClientFrame
      agencyName={bundle.agency.name}
      logoUrl={bundle.agency.logo_url}
      client={bundle.client}
      current="kickoff"
      title="You are all set"
      reassurance="A confirmation has been recorded for the agency."
      averageMinutes={bundle.averageCompletionMinutes}
      openSlotsThisWeek={bundle.openSlotsThisWeek}
    >
      <div className="relative">
        <div className="confirmation-glow" />
        <div className="relative z-10 space-y-3 text-sm">
        {["Details received", "Agreement signed", "Deposit recorded", "Kickoff booked"].map((item, index) => (
          <div className="receipt-item flex items-center gap-3" style={{ animationDelay: `${index * 60}ms` }} key={item}>
            <CheckCircle2 size={18} className="text-[var(--teal)]" />
            <span>{item}</span>
          </div>
        ))}
        </div>
        <p className="relative z-10 mt-7 rounded-lg bg-[var(--teal-tint)] p-4 text-sm text-[var(--teal)]">
          {bundle.agency.name} has been notified. See you at kickoff.
        </p>
      </div>
    </ClientFrame>
  );
}
