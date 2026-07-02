import Link from "next/link";

export function Logo({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/aeitron-logo.jpeg"
        alt=""
        className="h-9 w-9 rounded-xl border border-[var(--line)] object-cover shadow-[0_0_24px_rgba(141,124,255,0.18)]"
      />
      <span className="text-xl font-semibold tracking-[-0.02em] text-current">Aeitron AI</span>
    </Link>
  );
}
