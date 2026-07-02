"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RemoveSlotButton({ slotId }: { slotId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        className="text-xs font-medium text-[var(--red-500)] transition-colors hover:text-[var(--red-700)] disabled:opacity-40"
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError("");
          try {
            const response = await fetch(`/api/slots/${slotId}`, { method: "DELETE" });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
              setError(payload.error ?? "Could not remove.");
              return;
            }
            router.refresh();
          } catch {
            setError("Could not remove.");
          } finally {
            setLoading(false);
          }
        }}
      >
        {loading ? "Removing" : "Remove"}
      </button>
      {error ? <span className="text-[10px] text-[var(--red)]">{error}</span> : null}
    </span>
  );
}
