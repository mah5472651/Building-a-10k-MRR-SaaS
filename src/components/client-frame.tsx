import { Logo } from "./logo";
import { ProgressTitle } from "./progress-title";
import { ProgressRail } from "./progress-rail";
import type { Client, ClientStep } from "@/types/handoff";

export function ClientFrame({
  agencyName,
  logoUrl,
  client,
  current,
  title,
  reassurance,
  averageMinutes,
  openSlotsThisWeek,
  children,
}: {
  agencyName: string;
  logoUrl?: string | null;
  client: Pick<Client, "name" | "signed_at" | "paid_at" | "scheduled_at">;
  current: ClientStep;
  title: string;
  reassurance?: string;
  averageMinutes?: number;
  openSlotsThisWeek?: number;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--paper)] px-4 py-6">
      <ProgressTitle current={current} />
      <section className="agency-page mx-auto max-w-[640px]">
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
          <div className="mb-6">
            <h1 className="serif text-[22px] font-medium">{title}</h1>
            {reassurance ? (
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{reassurance}</p>
            ) : null}
            <div className="mt-4 grid gap-2 text-xs text-[var(--ink-soft)] md:grid-cols-2">
              {averageMinutes ? (
                <p className="rounded-lg bg-[var(--paper)] px-3 py-2">Average completion: {averageMinutes} min</p>
              ) : null}
              {typeof openSlotsThisWeek === "number" ? (
                <p className="rounded-lg bg-[var(--paper)] px-3 py-2">{openSlotsThisWeek} kickoff slots open this week</p>
              ) : null}
            </div>
          </div>
          {children}
        </section>
      </section>
    </main>
  );
}
