"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import type { PaymentMilestone } from "@/types/handoff";

export function MilestoneEditor({ milestones }: { milestones: PaymentMilestone[] }) {
  const [items, setItems] = useState(
    milestones.length
      ? milestones
      : [{ id: "deposit", label: "Deposit", amount: 500, due: "onboarding" as const }],
  );

  const payload = items
    .filter((item) => item.label.trim())
    .slice(0, 3)
    .map((item) => ({ ...item, amount: Number(item.amount) || 0 }));

  return (
    <div className="space-y-3">
      <input type="hidden" name="payment_schedule_json" value={JSON.stringify(payload)} />
      {items.map((item, index) => (
        <div className="grid gap-3 rounded-xl border border-[var(--ink-100)] bg-[var(--paper-50)] p-3 md:grid-cols-[1fr_140px_150px_auto]" key={item.id}>
          <input
            className="field"
            value={item.label}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...item, label: event.target.value };
              setItems(next);
            }}
          />
          <input
            className="field"
            type="number"
            min="0"
            value={item.amount}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...item, amount: Number(event.target.value) };
              setItems(next);
            }}
          />
          <select
            className="field"
            value={item.due}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...item, due: event.target.value as PaymentMilestone["due"] };
              setItems(next);
            }}
          >
            <option value="onboarding">Onboarding</option>
            <option value="midpoint">Midpoint</option>
            <option value="final">Final</option>
          </select>
          <button
            className="btn-secondary grid w-10 place-items-center"
            type="button"
            onClick={() => setItems(items.filter((row) => row.id !== item.id))}
            disabled={items.length === 1}
          >
            <X size={15} />
          </button>
        </div>
      ))}
      {items.length < 3 ? (
        <button
          className="btn-secondary flex items-center gap-2 text-sm"
          type="button"
          onClick={() =>
            setItems([
              ...items,
              { id: crypto.randomUUID(), label: "Next milestone", amount: 0, due: "midpoint" },
            ])
          }
        >
          <Plus size={15} />
          Add milestone
        </button>
      ) : null}
    </div>
  );
}
