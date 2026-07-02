import { Check } from "lucide-react";
import { clientSteps, completedStepCount } from "@/lib/state";
import type { Client, ClientStep } from "@/types/handoff";

export function ProgressRail({
  client,
  current,
}: {
  client: Pick<Client, "name" | "signed_at" | "paid_at" | "scheduled_at">;
  current: ClientStep;
}) {
  const complete = completedStepCount(client);
  const currentIndex = clientSteps.findIndex((step) => step.key === current);
  const fill = `${Math.max(0, Math.min(100, ((Math.max(complete, currentIndex) || 0) / 3) * 100))}%`;

  return (
    <div className="mb-8 pt-4">
      <div className="relative px-[11px]">
        <div className="absolute left-0 top-[9px] h-1 w-full rounded-full bg-[var(--ink-100)] shadow-inner" />
        <div
          className="absolute left-0 top-[9px] h-1 rounded-full bg-[var(--amber-500)] shadow-[0_0_18px_rgba(217,123,41,0.35)] transition-[width] duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
          style={{ width: fill }}
        />
        <div className="relative flex justify-between">
          {clientSteps.map((step, index) => {
            const done = index < complete;
            const active = index === currentIndex;
            return (
              <div key={step.key} className="flex w-16 flex-col items-center first:items-start last:items-end">
                <div className="relative grid h-[22px] w-[22px] place-items-center">
                  {active ? (
                    <span className="absolute inset-0 rounded-full bg-[var(--ink-800)] [animation:pulse-ring_2s_ease-in-out_infinite]" />
                  ) : null}
                  <div
                    className={`relative z-10 grid h-[22px] w-[22px] place-items-center rounded-full border-2 border-[var(--paper-100)] text-[10px] font-semibold shadow-sm ring-1 transition-transform duration-200 group-hover:scale-105 ${
                      done
                        ? "bg-[var(--amber-500)] text-white ring-[var(--amber-500)] [animation:rail-dot-pop_300ms_ease-out]"
                        : active
                          ? "bg-[var(--ink-800)] text-white ring-[var(--ink-800)]"
                          : "bg-[var(--paper-0)] text-[var(--ink-600)] ring-[var(--ink-200)]"
                    }`}
                  >
                    {done ? <Check size={10} strokeWidth={2} /> : index + 1}
                  </div>
                </div>
                <span
                  className={`mt-2 text-center text-xs ${
                    done || active ? "font-medium text-[var(--ink-800)]" : "text-[var(--ink-600)]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
