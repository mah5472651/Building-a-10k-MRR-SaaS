"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useState } from "react";
import type { IntakeQuestion } from "@/types/handoff";

export function QuestionEditor({ questions }: { questions: IntakeQuestion[] }) {
  const [items, setItems] = useState(
    questions.length ? questions : [{ id: crypto.randomUUID(), label: "" }],
  );

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setItems(next);
  };

  const cleaned = items
    .map((item) => ({ id: item.id, label: item.label.trim() }))
    .filter((item) => item.label);

  return (
    <div className="space-y-3">
      <input type="hidden" name="questions_json" value={JSON.stringify(cleaned)} />
      <p className="label">Questions</p>
      {items.map((question, index) => (
        <div className="flex gap-2" key={question.id}>
          <input
            className="field"
            value={question.label}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...question, label: event.target.value };
              setItems(next);
            }}
            placeholder="Ask a client intake question"
          />
          <button className="btn-secondary grid w-10 place-items-center" type="button" onClick={() => move(index, -1)}>
            <ArrowUp size={15} />
          </button>
          <button className="btn-secondary grid w-10 place-items-center" type="button" onClick={() => move(index, 1)}>
            <ArrowDown size={15} />
          </button>
          <button
            className="btn-secondary grid w-10 place-items-center"
            type="button"
            onClick={() => setItems(items.filter((item) => item.id !== question.id))}
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <button
        className="btn-secondary flex items-center gap-2 px-3 text-sm"
        type="button"
        onClick={() => setItems([...items, { id: crypto.randomUUID(), label: "" }])}
      >
        <Plus size={15} />
        Add question
      </button>
    </div>
  );
}
