"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClientSupabase } from "@/lib/supabase-browser";

export function RealtimeRefresh({ agencyId }: { agencyId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClientSupabase();
    const channel = supabase
      .channel(`agency-live-${agencyId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "clients",
          filter: `agency_id=eq.${agencyId}`,
        },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "available_slots",
          filter: `agency_id=eq.${agencyId}`,
        },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notification_events",
          filter: `agency_id=eq.${agencyId}`,
        },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [agencyId, router]);

  return null;
}
