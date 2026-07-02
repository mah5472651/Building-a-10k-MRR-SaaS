"use client";

import { Bell, Radio, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { createClientSupabase } from "@/lib/supabase-browser";
import type { NotificationEvent } from "@/types/handoff";

const labels: Record<string, string> = {
  link_sent: "Client link created",
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
    let active = true;
    fetch("/api/notifications")
      .then((response) => response.json())
      .then((data) => {
        if (active) setNotifications(data.notifications ?? []);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onClose = () => setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("aeitron:close-notifications", onClose);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("aeitron:close-notifications", onClose);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    const supabase = createClientSupabase();
    const channel = supabase
      .channel(`agency-notifications-${agencyId}`, {
        config: { presence: { key: createPresenceKey() } },
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

  const openNotifications = () => {
    window.dispatchEvent(new Event("aeitron:close-search"));
    setOpen(true);
  };

  const overlay = open && typeof document !== "undefined"
    ? createPortal(
        <div className="fixed inset-0 z-[110] bg-black/55 px-4 py-5 backdrop-blur-md" onClick={() => setOpen(false)}>
          <aside
            className="premium-popover ml-auto flex h-full w-full max-w-md flex-col rounded-2xl border border-[var(--line)] bg-[rgba(10,14,24,0.97)] p-4 shadow-2xl backdrop-blur-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="label">Live notifications</p>
                <h2 className="mt-1 text-xl font-semibold">Activity feed</h2>
              </div>
              <button
                className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] bg-white/[0.04] text-[var(--ink-soft)] transition hover:bg-white/[0.08]"
                onClick={() => setOpen(false)}
                type="button"
                aria-label="Close notifications"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mb-3 flex items-center justify-between rounded-xl border border-[var(--line)] bg-white/[0.04] px-3 py-2 text-xs text-[var(--ink-soft)]">
              <span>{statusText}</span>
              <span>{onlineCount} online</span>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1">
              {notifications.length ? (
                notifications.map((item) => (
                  <div className="rounded-xl border border-[var(--line)] bg-white/[0.045] p-3 text-sm transition hover:border-[var(--ink-200)] hover:bg-white/[0.08]" key={item.id}>
                    <p className="font-medium">{labels[item.event] ?? item.event}</p>
                    <p className="mt-1 text-xs text-[var(--ink-soft)]">
                      {item.client?.name ?? "Client"} · {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-xl bg-white/[0.04] p-4 text-sm text-[var(--ink-soft)]">No live events yet.</p>
              )}
            </div>
          </aside>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="flex items-center gap-2">
      <div className="hidden items-center gap-2 rounded-full border border-[var(--line)] bg-white/[0.045] px-3 py-2 text-xs font-medium text-[var(--ink-soft)] shadow-sm backdrop-blur-xl sm:flex">
        <span className={`h-2 w-2 rounded-full ${status === "live" ? "live-dot bg-[var(--teal)]" : "bg-[var(--red)]"}`} />
        <Radio size={14} />
        {statusText} · {onlineCount} online
      </div>
      <button
        className="premium-float relative grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-white/[0.045] text-[var(--ink-800)] shadow-sm backdrop-blur-xl transition hover:border-[var(--ink-800)] hover:bg-white/[0.08]"
        onClick={openNotifications}
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
      {overlay}
    </div>
  );
}

function createPresenceKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `presence-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
