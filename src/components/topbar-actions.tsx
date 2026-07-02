"use client";

import { useEffect, useState } from "react";
import { CommandPalette } from "./command-palette";
import { NotificationCenter } from "./notification-center";

export function TopbarActions({ agencyId }: { agencyId?: string }) {
  const [active, setActive] = useState<"search" | "notifications" | null>(null);

  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);

  return (
    <div className="flex shrink-0 items-center gap-2">
      <CommandPalette
        open={active === "search"}
        onOpenChange={(open) => setActive(open ? "search" : null)}
      />
      {agencyId ? (
        <NotificationCenter
          agencyId={agencyId}
          open={active === "notifications"}
          onOpenChange={(open) => setActive(open ? "notifications" : null)}
        />
      ) : null}
    </div>
  );
}
