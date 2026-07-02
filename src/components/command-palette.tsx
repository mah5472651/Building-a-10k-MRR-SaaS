"use client";

import { Search, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const commands = [
  { type: "Page", label: "Dashboard", href: "/dashboard", hint: "Overview and client link" },
  { type: "Page", label: "Clients", href: "/clients", hint: "Pipeline and client records" },
  { type: "Page", label: "Onboarding flow", href: "/flow", hint: "Questions, agreement, slots" },
  { type: "Page", label: "Billing", href: "/billing", hint: "Plan and subscription" },
  { type: "Page", label: "Settings", href: "/settings", hint: "Brand and integrations" },
];

type ClientResult = {
  id: string;
  name: string | null;
  email: string | null;
  status: string;
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<ClientResult[]>([]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => {
          if (!value) window.dispatchEvent(new Event("aeitron:close-notifications"));
          return !value;
        });
      }
      if (event.key === "Escape") setOpen(false);
    };
    const onClose = () => setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("aeitron:close-search", onClose);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("aeitron:close-search", onClose);
    };
  }, []);

  useEffect(() => {
    if (!open || clients.length) return;
    fetch("/api/clients")
      .then((response) => response.json())
      .then((data) => setClients(data.clients ?? []))
      .catch(() => undefined);
  }, [clients.length, open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    const pageResults = commands
      .filter((command) => !value || `${command.label} ${command.hint}`.toLowerCase().includes(value))
      .map((command) => ({ ...command, icon: Search }));

    const clientResults = clients
      .filter((client) => {
        if (!value) return true;
        return `${client.name ?? ""} ${client.email ?? ""} ${client.status}`.toLowerCase().includes(value);
      })
      .slice(0, 8)
      .map((client) => ({
        type: "Client",
        label: client.name ?? "Unnamed client",
        href: `/clients/${client.id}`,
        hint: client.email ?? client.status,
        icon: UserRound,
      }));

    return [...pageResults, ...clientResults].slice(0, 12);
  }, [clients, query]);

  const openPalette = () => {
    window.dispatchEvent(new Event("aeitron:close-notifications"));
    setOpen(true);
  };

  const closeAndGo = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const overlay = open && typeof document !== "undefined"
    ? createPortal(
        <div className="fixed inset-0 z-[120] grid place-items-start bg-black/55 px-4 py-20 backdrop-blur-md" onClick={() => setOpen(false)}>
          <div
            className="premium-popover mx-auto w-full max-w-xl rounded-2xl border border-[var(--line)] bg-[rgba(10,14,24,0.97)] p-3 shadow-2xl backdrop-blur-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-2 pb-3">
              <Search size={18} className="text-[var(--ink-soft)]" />
              <input
                autoFocus
                className="min-h-11 flex-1 bg-transparent text-sm outline-none"
                placeholder="Search pages, clients, emails..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && results[0]) closeAndGo(results[0].href);
                }}
              />
            </div>
            <div className="mt-2 max-h-[420px] space-y-1 overflow-auto">
              {results.length ? (
                results.map((result) => {
                  const Icon = result.icon;
                  return (
                    <button
                      className="w-full rounded-xl px-3 py-3 text-left text-sm transition hover:bg-white/[0.07]"
                      key={`${result.type}-${result.href}`}
                      onClick={() => closeAndGo(result.href)}
                      type="button"
                    >
                      <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] bg-white/[0.04] text-[var(--amber-100)]">
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{result.label}</span>
                          <span className="mt-1 block truncate text-xs text-[var(--ink-soft)]">{result.type} · {result.hint}</span>
                        </span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="rounded-xl bg-white/[0.04] p-4 text-sm text-[var(--ink-soft)]">No result found.</p>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        className="hidden h-10 min-w-[150px] items-center justify-between gap-2 rounded-xl border border-[var(--line)] bg-white/[0.045] px-3 text-sm text-[var(--ink-soft)] shadow-sm backdrop-blur-xl transition hover:border-[var(--ink-800)] hover:bg-white/[0.08] md:flex xl:min-w-[210px]"
        onClick={openPalette}
        type="button"
      >
        <span className="inline-flex items-center gap-2">
          <Search size={16} />
          <span className="hidden xl:inline">Search clients, pages</span>
          <span className="xl:hidden">Search</span>
        </span>
        <span className="rounded bg-black/30 px-1.5 py-0.5 text-[11px]">Ctrl K</span>
      </button>
      {overlay}
    </>
  );
}
