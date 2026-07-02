"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

export function FileUploadBlock({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="rounded-xl border-2 border-dashed border-[var(--ink-200)] bg-[var(--paper-50)] p-5">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Upload size={16} />
        Upload files optional
      </div>
      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setLoading(true);
          setMessage("");
          const response = await fetch(`/api/client-flow/${token}/upload`, {
            method: "POST",
            body: form,
          });
          const payload = await response.json();
          setLoading(false);
          setMessage(response.ok ? `${payload.files.length} file(s) uploaded.` : payload.error ?? "Upload failed.");
        }}
      >
        <input className="field" name="files" type="file" multiple />
        <button className="btn-secondary w-full" type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload selected files"}
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-[var(--ink-600)]">{message}</p> : null}
    </div>
  );
}
