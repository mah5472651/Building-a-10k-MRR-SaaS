"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RemoveSlotButton({ slotId }: { slotId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="text-xs font-medium text-[var(--red-500)] transition-colors hover:text-[var(--red-700)] disabled:opacity-40"
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch(`/api/slots/${slotId}`, { method: "DELETE" });
        setLoading(false);
        router.refresh();
      }}
    >
      {loading ? "Removing" : "Remove"}
    </button>
  );
}
