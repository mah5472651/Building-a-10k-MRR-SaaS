import Link from "next/link";
import { LayoutDashboard, Settings, Users, WalletCards, Workflow } from "lucide-react";
import { signOutAction } from "@/lib/auth-actions";
import { Logo } from "./logo";
import { CommandPalette } from "./command-palette";
import { NotificationCenter } from "./notification-center";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/flow", label: "Onboarding flow", icon: Workflow },
  { href: "/billing", label: "Billing", icon: WalletCards },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AgencyShell({
  title,
  active,
  agencyId,
  children,
}: {
  title: string;
  active: string;
  agencyId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="premium-shell min-h-screen pb-20 text-[var(--ink-800)] md:flex md:pb-0">
      <aside className="glass-sidebar hidden px-3 py-5 text-[var(--ink-800)] md:fixed md:inset-y-0 md:left-0 md:flex md:w-16 md:flex-col lg:w-[260px]">
        <div className="hidden items-center justify-between px-2 lg:flex">
          <Logo />
          <span className="rounded-full border border-[var(--line)] bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            Live
          </span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/aeitron-logo.jpeg"
          alt=""
          className="h-10 w-10 rounded-xl border border-[var(--line)] object-cover shadow-lg lg:hidden"
        />
        <nav className="mt-7 flex flex-col gap-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const selected = active === item.label;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                style={{ animationDelay: `${index * 45}ms` }}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  selected
                    ? "nav-active-glow text-[var(--ink-900)]"
                    : "text-[#8A9A93] hover:text-[var(--paper-0)]"
                } nav-item`}
              >
                {selected ? <span className="absolute right-2 h-5 w-[3px] rounded-full bg-[var(--amber-500)] shadow-[0_0_16px_rgba(255,177,74,0.55)]" /> : null}
                <Icon size={20} />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <form action={signOutAction} className="mt-auto hidden lg:block">
          <button className="w-full rounded-xl border border-[var(--line)] bg-white/5 px-3 py-2 text-sm font-medium text-[#8A9A93] transition-colors hover:border-[var(--amber-100)] hover:text-[var(--paper-0)]" type="submit">
            Logout
          </button>
        </form>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[var(--line)] bg-[rgba(8,11,19,0.88)] px-2 py-2 backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = active === item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium ${
                selected ? "bg-white/10 text-[var(--amber-100)]" : "text-[#8A9A93]"
              }`}
            >
              <Icon size={18} />
              <span className="max-w-full truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
      <main className="flex-1 px-4 py-8 md:ml-16 md:px-8 md:py-10 lg:ml-[260px]">
        <div className="agency-page mx-auto max-w-[1120px]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-soft)]">Overview</p>
              <h1 className="text-[26px] leading-[32px] font-semibold">{title}</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <CommandPalette />
              {agencyId ? <NotificationCenter agencyId={agencyId} /> : null}
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
