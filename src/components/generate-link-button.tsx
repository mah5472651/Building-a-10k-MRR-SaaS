"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateLinkButton() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="btn-primary w-full px-4 md:w-auto"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError("");
          const response = await fetch("/api/client-links", { method: "POST" });
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
