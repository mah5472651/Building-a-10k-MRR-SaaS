"use client";

import { CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn-secondary flex items-center justify-center gap-2 text-sm"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        <Copy size={15} />
        Copy
      </button>
      {copied ? (
        <div className="toast fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-[var(--ink-900)] px-4 py-3 text-sm font-medium text-[var(--paper-0)] shadow-sm">
          <CheckCircle2 size={16} className="text-[var(--teal-100)]" />
          Link copied
        </div>
      ) : null}
    </>
  );
}
