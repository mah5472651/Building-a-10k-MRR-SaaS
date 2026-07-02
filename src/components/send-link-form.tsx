"use client";

import { Send } from "lucide-react";
import { useState } from "react";

export function SendLinkForm({ clientId }: { clientId: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="mt-4 flex flex-col gap-2 md:flex-row"
      onSubmit={async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        try {
          const response = await fetch("/api/client-links/send", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ client_id: clientId, email }),
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) {
            setMessage(payload.error ?? "Could not send link.");
            return;
          }
          setMessage(payload.skipped ? "Email provider not configured, but the link is ready to copy." : "Link sent.");
        } catch {
          setMessage("Could not send link.");
        } finally {
          setLoading(false);
        }
      }}
    >
      <input
        className="field min-h-10 flex-1"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="client@example.com"
        required
      />
      <button className="btn-secondary flex items-center justify-center gap-2 px-3 text-sm" type="submit" disabled={loading}>
        <Send size={15} />
        {loading ? "Sending" : "Send"}
      </button>
      {message ? <p className="text-sm text-[var(--ink-soft)] md:self-center">{message}</p> : null}
    </form>
  );
}
