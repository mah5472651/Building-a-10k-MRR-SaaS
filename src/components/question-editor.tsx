"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { useState } from "react";
import type { IntakeQuestion } from "@/types/handoff";

export function QuestionEditor({ questions }: { questions: IntakeQuestion[] }) {
  const [items, setItems] = useState(
    questions.length ? questions : [{ id: createQuestionId(), label: "" }],
  );

  const move = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setItems(next);
  };

  const payload = items
    .filter((item) => item.label.trim())
    .map((item) => ({
      ...item,
      label: item.label.trim(),
      options: item.type === "select" ? (item.options ?? []).filter(Boolean) : [],
      conditional_on: item.conditional_on?.question_id && item.conditional_on?.equals ? item.conditional_on : null,
    }));

  return (
    <div className="space-y-3">
      <input type="hidden" name="questions_json" value={JSON.stringify(payload)} />
      <p className="label">Questions</p>
      {items.map((question, index) => (
        <div className="rounded-xl border border-[var(--ink-100)] bg-[var(--paper-50)] p-3" key={question.id}>
          <div className="flex gap-2">
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
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label>
              <span className="label">Type</span>
              <select
                className="field mt-1"
                value={question.type ?? "textarea"}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...question, type: event.target.value as IntakeQuestion["type"] };
                  setItems(next);
                }}
              >
                <option value="textarea">Long text</option>
                <option value="text">Short text</option>
                <option value="select">Dropdown</option>
              </select>
            </label>
            <label>
              <span className="label">Options comma-separated</span>
              <input
                className="field mt-1"
                value={(question.options ?? []).join(", ")}
                onChange={(event) => {
                  const next = [...items];
                  next[index] = { ...question, options: event.target.value.split(",").map((value) => value.trim()) };
                  setItems(next);
                }}
                disabled={(question.type ?? "textarea") !== "select"}
              />
            </label>
            <label>
              <span className="label">Show if previous answer equals</span>
              <input
                className="field mt-1"
                value={question.conditional_on?.equals ?? ""}
                onChange={(event) => {
                  const previous = items[index - 1];
                  const next = [...items];
                  next[index] = {
                    ...question,
                    conditional_on: previous && event.target.value ? { question_id: previous.id, equals: event.target.value } : null,
                  };
                  setItems(next);
                }}
                placeholder={index === 0 ? "Always shown" : "e.g. Branding"}
                disabled={index === 0}
              />
            </label>
          </div>
        </div>
      ))}
      <button
        className="btn-secondary flex items-center gap-2 px-3 text-sm"
        type="button"
        onClick={() => setItems([...items, { id: createQuestionId(), label: "" }])}
      >
        <Plus size={15} />
        Add question
      </button>
    </div>
  );
}

function createQuestionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `question-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
