"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingFlow } from "@/types/handoff";

export function GenerateLinkButton({ flows = [] }: { flows?: OnboardingFlow[] }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [flowId, setFlowId] = useState(flows[0]?.id ?? "");

  return (
    <div className="space-y-3">
      {flows.length > 1 ? (
        <select className="field max-w-xs" value={flowId} onChange={(event) => setFlowId(event.target.value)}>
          {flows.map((flow) => (
            <option key={flow.id} value={flow.id}>
              {flow.title}
            </option>
          ))}
        </select>
      ) : null}
      <button
        type="button"
        className="btn-primary w-full px-4 md:w-auto"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError("");
          const response = await fetch("/api/client-links", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ flow_id: flowId || undefined }),
          });
          const payload = await response.json();
          setLoading(false);
          if (!response.ok) {
            setError(payload.error ?? "Could not generate link.");
            return;
          }
          setUrl(payload.url);
          await navigator.clipboard.writeText(payload.url);
          router.refresh();
        }}
      >
        {loading ? "Generating..." : "Generate new client link"}
      </button>
      {url ? (
        <div className="rounded-lg border border-dashed border-[var(--line-strong)] bg-white p-3 font-mono text-xs">
          {url}
        </div>
      ) : null}
      {error ? <p className="text-sm text-[var(--red)]">{error}</p> : null}
    </div>
  );
}
