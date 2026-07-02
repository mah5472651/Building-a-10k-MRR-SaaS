"use client";

import { Bell, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase-browser";
import type { NotificationEvent } from "@/types/handoff";

const labels: Record<string, string> = {
  intake_completed: "Intake completed",
  signed: "Agreement signed",
  paid: "Deposit paid",
  booked: "Kickoff booked",
  completed: "Onboarding complete",
  stalled: "Client stalled",
};

export function NotificationCenter({ agencyId }: { agencyId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"connecting" | "live" | "offline">("connecting");
  const [onlineCount, setOnlineCount] = useState(1);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/notifications")
      .then((response) => response.json())
      .then((data) => {
        if (mounted) setNotifications(data.notifications ?? []);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const supabase = createClientSupabase();
    const channel = supabase
      .channel(`agency-notifications-${agencyId}`, {
        config: { presence: { key: crypto.randomUUID() } },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_events",
          filter: `agency_id=eq.${agencyId}`,
        },
        (payload) => {
          setNotifications((current) => [payload.new as NotificationEvent, ...current].slice(0, 12));
          router.refresh();
        },
      )
      .on("presence", { event: "sync" }, () => {
        setOnlineCount(Object.keys(channel.presenceState()).length || 1);
      })
      .subscribe(async (subscriptionStatus) => {
        if (subscriptionStatus === "SUBSCRIBED") {
          setStatus("live");
          await channel.track({ online_at: new Date().toISOString() });
        }
        if (subscriptionStatus === "CHANNEL_ERROR" || subscriptionStatus === "TIMED_OUT" || subscriptionStatus === "CLOSED") {
          setStatus("offline");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [agencyId, router]);

  const unread = notifications.length;
  const statusText = useMemo(() => (status === "live" ? "Live" : status === "connecting" ? "Connecting" : "Offline"), [status]);

  return (
    <div className="relative flex items-center gap-2">
      <div className="hidden items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper-50)] px-3 py-2 text-xs font-medium text-[var(--ink-soft)] sm:flex">
        <span className={`h-2 w-2 rounded-full ${status === "live" ? "bg-[var(--teal)]" : "bg-[var(--red)]"}`} />
        <Radio size={14} />
        {statusText} · {onlineCount} online
      </div>
      <button
        className="relative grid h-10 w-10 place-items-center rounded-lg border border-[var(--line)] bg-[var(--paper-50)] text-[var(--ink-800)]"
        onClick={() => setOpen((value) => !value)}
        type="button"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unread ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--amber-500)] px-1 text-[10px] font-bold text-[var(--ink-900)]">
            {Math.min(unread, 9)}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[min(340px,calc(100vw-2rem))] rounded-xl border border-[var(--line)] bg-[var(--paper-0)] p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="label">Live notifications</p>
            <span className="text-xs text-[var(--ink-soft)]">{statusText}</span>
          </div>
          <div className="max-h-80 space-y-2 overflow-auto">
            {notifications.length ? (
              notifications.map((item) => (
                <div className="rounded-lg border border-[var(--line)] bg-[var(--paper-50)] p-3 text-sm" key={item.id}>
                  <p className="font-medium">{labels[item.event] ?? item.event}</p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">
                    {item.client?.name ?? "Client"} · {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-lg bg-[var(--paper-50)] p-3 text-sm text-[var(--ink-soft)]">No live events yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
