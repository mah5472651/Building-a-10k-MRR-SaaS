import { statusLabel } from "@/lib/state";

export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "completed"
      ? "bg-[var(--teal-tint)] text-[var(--teal)]"
      : status === "in_progress"
        ? "bg-[var(--amber-tint)] text-[var(--amber-deep)]"
        : "border border-[var(--line-strong)] bg-[var(--paper)] text-[var(--ink-soft)]";
  const dot =
    status === "completed"
      ? "bg-[var(--teal-500)]"
      : status === "in_progress"
        ? "bg-[var(--amber-500)]"
        : "bg-[var(--ink-400)]";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {statusLabel(status)}
    </span>
  );
}
