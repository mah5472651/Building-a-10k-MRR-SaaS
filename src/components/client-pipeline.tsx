"use client";

import Link from "next/link";
import { LayoutGrid, Table2 } from "lucide-react";
import { useState } from "react";
import type { Client } from "@/types/handoff";
import { completedStepCount } from "@/lib/state";
import { ClientRow } from "./client-row";
import { EmptyState } from "./empty-state";
import { ProgressDots } from "./progress-dots";
import { StatusBadge } from "./status-badge";

export function ClientPipeline({ clients }: { clients: Client[] }) {
  const [view, setView] = useState<"cards" | "table">("cards");

  if (!clients.length) {
    return <EmptyState title="No clients yet" body="Generate your first client link to begin." />;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-grid grid-cols-2 rounded-lg border border-[var(--line)] bg-[var(--paper-50)] p-1">
          <button className={`grid h-8 w-9 place-items-center rounded-md ${view === "cards" ? "bg-white shadow-sm" : ""}`} onClick={() => setView("cards")} type="button" aria-label="Card view">
            <LayoutGrid size={15} />
          </button>
          <button className={`grid h-8 w-9 place-items-center rounded-md ${view === "table" ? "bg-white shadow-sm" : ""}`} onClick={() => setView("table")} type="button" aria-label="Table view">
            <Table2 size={15} />
          </button>
        </div>
      </div>
      {view === "cards" ? (
        clients.map((client) => <ClientRow key={client.id} client={client} />)
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead className="bg-[var(--paper-50)] text-left text-xs font-medium text-[var(--ink-soft)]">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Deposit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr className="border-t border-[var(--line)] transition hover:bg-[var(--paper-50)]" key={client.id}>
                  <td className="px-4 py-3">
                    <span className="block font-medium">{client.name ?? "Unnamed client"}</span>
                    <span className="text-xs text-[var(--ink-soft)]">{client.email ?? "No email yet"}</span>
                  </td>
                  <td className="px-4 py-3"><ProgressDots count={completedStepCount(client)} /></td>
                  <td className="px-4 py-3 font-mono">${Number(client.amount_paid ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={client.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link className="btn-secondary inline-grid place-items-center px-3 text-xs" href={`/clients/${client.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
