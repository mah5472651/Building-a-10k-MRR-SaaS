import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Client } from "@/types/handoff";
import { completedStepCount } from "@/lib/state";
import { ProgressDots } from "./progress-dots";
import { StatusBadge } from "./status-badge";

export function ClientRow({ client }: { client: Client }) {
  const initials =
    client.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "CL";

  return (
    <div className="client-row group relative grid gap-4 border-t border-[var(--ink-100)] px-4 py-4 transition-colors hover:bg-[var(--paper-50)] md:grid-cols-[1fr_auto_auto_auto] md:items-center">
      <span className="absolute inset-y-0 left-0 w-[3px] bg-transparent transition-colors group-hover:bg-[var(--amber-500)]" />
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--teal-tint)] text-sm font-semibold text-[var(--teal)] ring-2 ring-[var(--paper-100)]">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium">{client.name ?? "Unnamed client"}</p>
          <p className="text-xs text-[var(--ink-soft)]">
            {client.email ?? "No email yet"} · {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
          </p>
          <p className="text-xs text-[var(--ink-soft)]">
            Last active {client.last_active_at ? formatDistanceToNow(new Date(client.last_active_at), { addSuffix: true }) : "never"}
          </p>
        </div>
      </div>
      <ProgressDots count={completedStepCount(client)} />
      <StatusBadge status={client.status} />
      <Link href={`/clients/${client.id}`} className="btn-secondary grid place-items-center px-4 text-sm">
        View
      </Link>
    </div>
  );
}
