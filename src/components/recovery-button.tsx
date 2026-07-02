"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";

export function RecoveryButton({ paymentEventId }: { paymentEventId: string }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="btn-secondary inline-flex min-h-8 items-center gap-2 px-3 text-xs"
      disabled={pending || sent}
      type="button"
      onClick={() => {
        setError("");
        startTransition(async () => {
          const response = await fetch("/api/recovery/nudge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payment_event_id: paymentEventId }),
          });
          if (!response.ok) {
            setError("Retry failed");
            return;
          }
          setSent(true);
        });
      }}
      title={error || "Send payment recovery email"}
    >
      <Mail size={13} />
      {sent ? "Sent" : pending ? "Sending" : "Retry"}
    </button>
  );
}
