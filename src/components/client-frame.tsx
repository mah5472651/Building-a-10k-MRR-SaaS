import { Logo } from "./logo";
import { ProgressRail } from "./progress-rail";
import type { Client, ClientStep } from "@/types/handoff";

export function ClientFrame({
  agencyName,
  logoUrl,
  client,
  current,
  title,
  children,
}: {
  agencyName: string;
  logoUrl?: string | null;
  client: Pick<Client, "name" | "signed_at" | "paid_at" | "scheduled_at">;
  current: ClientStep;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--paper)] px-4 py-6">
      <section className="mx-auto max-w-[640px]">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-9 w-9 rounded-lg border border-[var(--line)] object-cover" />
            ) : (
              <Logo href="#" />
            )}
          </div>
          <span className="text-sm font-medium text-[var(--ink-soft)]">{agencyName}</span>
        </div>
        <ProgressRail client={client} current={current} />
        <section className="card card-active handoff-step-card p-6 md:p-8">
          <h1 className="serif mb-6 text-[22px] font-medium">{title}</h1>
          {children}
        </section>
      </section>
    </main>
  );
}
