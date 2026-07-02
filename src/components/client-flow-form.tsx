"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { IntakeQuestion } from "@/types/handoff";
import { FileUploadBlock } from "./file-upload-block";

export function DetailsForm({
  token,
  questions,
  defaults,
}: {
  token: string;
  questions: IntakeQuestion[];
  defaults?: { name?: string | null; email?: string | null; phone?: string | null; answers?: Record<string, string> };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState(defaults?.answers ?? {});

  const visibleQuestions = questions.filter((question) => {
    if (!question.conditional_on) return true;
    return answers[question.conditional_on.question_id] === question.conditional_on.equals;
  });

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const payloadAnswers = Object.fromEntries(visibleQuestions.map((question) => [question.id, String(form.get(question.id) ?? "")]));
        setLoading(true);
        setError("");
        try {
          const response = await fetch(`/api/client-flow/${token}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              action: "details",
              name: form.get("name"),
              email: form.get("email"),
              phone: form.get("phone"),
              answers: payloadAnswers,
            }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            setError(data.error?.formErrors?.[0] ?? "Please check the form and try again.");
            return;
          }
          router.push(data.next);
        } catch {
          setError("Please check the form and try again.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <label className="block">
        <span className="label">Name</span>
        <input className="field mt-1" name="name" defaultValue={defaults?.name ?? ""} required />
      </label>
      <label className="block">
        <span className="label">Email</span>
        <input className="field mt-1" name="email" type="email" defaultValue={defaults?.email ?? ""} required />
      </label>
      <label className="block">
        <span className="label">Phone</span>
        <input className="field mt-1" name="phone" defaultValue={defaults?.phone ?? ""} />
      </label>
      {visibleQuestions.map((question) => (
        <label className="block" key={question.id}>
          <span className="label">{question.label}</span>
          {question.type === "select" ? (
            <select
              className="field mt-1"
              name={question.id}
              value={answers[question.id] ?? ""}
              onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })}
            >
              <option value="">Choose one</option>
              {(question.options ?? []).map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <textarea
              className="field mt-1 min-h-28"
              name={question.id}
              value={answers[question.id] ?? ""}
              onChange={(event) => setAnswers({ ...answers, [question.id]: event.target.value })}
            />
          )}
        </label>
      ))}
      <FileUploadBlock token={token} />
      {error ? <p className="text-sm text-[var(--red)]">{error}</p> : null}
      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Saving..." : "Continue to agreement"}
      </button>
    </form>
  );
}

export function SignatureForm({ token }: { token: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
          const response = await fetch(`/api/client-flow/${token}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "signature", signature_name: name }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            setError("Please type your name to sign.");
            return;
          }
          router.push(data.next);
        } catch {
          setError("Please type your name to sign.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="rounded-xl border-2 border-dashed border-[var(--line-strong)] p-7 text-center">
        <p className="text-sm text-[var(--ink-soft)]">Typed signature</p>
        <p className="serif mt-4 min-h-10 text-[26px] italic text-[var(--teal)]">{name || "Your name"}</p>
      </div>
      <label className="block">
        <span className="label">Type your legal name</span>
        <input className="field mt-1" value={name} onChange={(event) => setName(event.target.value)} required />
      </label>
      {error ? <p className="text-sm text-[var(--red)]">{error}</p> : null}
      <button className="btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Signing..." : "Sign and continue"}
      </button>
    </form>
  );
}

export function BookingForm({
  token,
  slots,
}: {
  token: string;
  slots: { id: string; datetime: string }[];
}) {
  const router = useRouter();
  const [slotId, setSlotId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");
        try {
          const response = await fetch(`/api/client-flow/${token}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "booking", slot_id: slotId }),
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            setError(data.error ?? "Choose a kickoff slot.");
            return;
          }
          router.push(data.next);
        } catch {
          setError("Choose a kickoff slot.");
        } finally {
          setLoading(false);
        }
      }}
    >
      {slots.map((slot) => (
        <label
          className={`block cursor-pointer rounded-lg border p-4 text-sm ${
            slotId === slot.id ? "border-[var(--ink)] bg-[var(--amber-tint)]" : "border-[var(--line)] bg-white"
          }`}
          key={slot.id}
        >
          <input
            className="sr-only"
            type="radio"
            name="slot_id"
            value={slot.id}
            checked={slotId === slot.id}
            onChange={() => setSlotId(slot.id)}
          />
          <span className="block font-medium">{new Date(slot.datetime).toLocaleString()}</span>
          <span className="mt-1 block text-xs text-[var(--ink-soft)]">60 minute kickoff</span>
        </label>
      ))}
      {slots.length === 0 ? <p className="text-sm text-[var(--ink-soft)]">No kickoff slots are available yet.</p> : null}
      {error ? <p className="text-sm text-[var(--red)]">{error}</p> : null}
      <button className="btn-primary w-full" type="submit" disabled={!slotId || loading}>
        {loading ? "Booking..." : "Book kickoff"}
      </button>
    </form>
  );
}
