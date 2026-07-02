import Link from "next/link";
import { LayoutDashboard, Settings, Users, WalletCards, Workflow } from "lucide-react";
import { signOutAction } from "@/lib/auth-actions";
import { Logo } from "./logo";
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
    <div className="min-h-screen bg-[var(--paper-100)] pb-20 text-[var(--ink-800)] md:flex md:pb-0">
      <aside className="hidden bg-[var(--ink-900)] px-3 py-5 text-[var(--paper-0)] md:fixed md:inset-y-0 md:left-0 md:flex md:w-16 md:flex-col lg:w-[240px]">
        <div className="hidden px-2 lg:block">
          <Logo />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/aeitron-logo.jpeg"
          alt=""
          className="h-10 w-10 rounded-lg border border-[#31423d] object-cover lg:hidden"
        />
        <nav className="mt-7 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = active === item.label;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  selected
                    ? "text-[var(--paper-0)]"
                    : "text-[#8A9A93] hover:text-[var(--paper-0)]"
                }`}
              >
                {selected ? <span className="absolute left-0 h-5 w-[3px] rounded-full bg-[var(--amber-500)]" /> : null}
                <Icon size={20} />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <form action={signOutAction} className="mt-auto hidden lg:block">
          <button className="w-full rounded-lg border border-[#31423d] px-3 py-2 text-sm font-medium text-[#8A9A93] transition-colors hover:border-[var(--amber-100)] hover:text-[var(--paper-0)]" type="submit">
            Logout
          </button>
        </form>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[var(--ink-100)] bg-[var(--ink-900)] px-2 py-2 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const selected = active === item.label;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium ${
                selected ? "text-[var(--amber-100)]" : "text-[#8A9A93]"
              }`}
            >
              <Icon size={18} />
              <span className="max-w-full truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
      <main className="flex-1 px-4 py-10 md:ml-16 md:px-8 md:py-14 lg:ml-[240px]">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h1 className="serif text-[24px] leading-[30px] font-medium">{title}</h1>
            {agencyId ? <NotificationCenter agencyId={agencyId} /> : null}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
