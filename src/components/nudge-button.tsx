"use client";

import { useState, useTransition } from "react";
import { BellRing } from "lucide-react";

export function NudgeButton({ clientId }: { clientId: string }) {
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <button
      className="btn-secondary inline-flex min-h-8 items-center gap-2 px-3 text-xs"
      disabled={pending || sent}
      type="button"
      onClick={() => {
        startTransition(async () => {
          const response = await fetch(`/api/clients/${clientId}/nudge`, { method: "POST" });
          if (response.ok) setSent(true);
        });
      }}
      title="Send client follow-up email"
    >
      <BellRing size={13} />
      {sent ? "Sent" : pending ? "Sending" : "Nudge"}
    </button>
  );
}
