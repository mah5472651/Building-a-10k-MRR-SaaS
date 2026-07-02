"use client";

import { useState } from "react";

export function CheckoutButton({
  endpoint,
  payload,
  label,
}: {
  endpoint: string;
  payload: Record<string, string>;
  label: string;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <>
      <button
        className="btn-primary grid w-full min-w-36 place-items-center px-4"
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError("");
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await response.json();
          setLoading(false);
          if (!response.ok || !data.url) {
            setError(data.error ?? "Checkout is unavailable.");
            return;
          }
          window.location.href = data.url;
        }}
      >
        {loading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : label}
      </button>
      {error ? <p className="mt-3 text-sm text-[var(--red)]">{error}</p> : null}
    </>
  );
}
