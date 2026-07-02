"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const commands = [
  { label: "Dashboard", href: "/dashboard", hint: "Overview and client link" },
  { label: "Clients", href: "/clients", hint: "Pipeline and client records" },
  { label: "Onboarding flow", href: "/flow", hint: "Questions, agreement, slots" },
  { label: "Billing", href: "/billing", hint: "Plan and subscription" },
  { label: "Settings", href: "/settings", hint: "Brand and integrations" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return commands;
    return commands.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(value));
  }, [query]);

  return (
    <>
      <button
        className="hidden h-10 items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--paper-50)] px-3 text-sm text-[var(--ink-soft)] shadow-sm transition hover:border-[var(--ink-800)] hover:bg-[var(--paper-0)] md:flex"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search size={16} />
        Search
        <span className="rounded bg-[var(--paper)] px-1.5 py-0.5 text-[11px]">Ctrl K</span>
      </button>
      {open ? (
        <div className="fixed inset-0 z-[60] bg-[rgba(14,28,24,0.28)] px-4 py-20 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="premium-popover mx-auto max-w-lg rounded-2xl border border-[var(--line)] bg-[var(--paper-0)] p-3 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-[var(--line)] px-2 pb-3">
              <Search size={18} className="text-[var(--ink-soft)]" />
              <input
                autoFocus
                className="min-h-10 flex-1 bg-transparent text-sm outline-none"
                placeholder="Jump to..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="mt-2 space-y-1">
              {filtered.map((command) => (
                <button
                  className="w-full rounded-lg px-3 py-3 text-left text-sm transition hover:bg-[var(--paper-50)]"
                  key={command.href}
                  onClick={() => {
                    setOpen(false);
                    router.push(command.href);
                  }}
                  type="button"
                >
                  <span className="block font-medium">{command.label}</span>
                  <span className="mt-1 block text-xs text-[var(--ink-soft)]">{command.hint}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
