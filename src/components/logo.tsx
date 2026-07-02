import Link from "next/link";

export function Logo({ href = "/dashboard" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/aeitron-logo.jpeg"
        alt=""
        className="h-9 w-9 rounded-lg border border-[var(--ink-100)] object-cover"
      />
      <span className="serif text-xl font-medium text-current">Aeitron AI</span>
    </Link>
  );
}
