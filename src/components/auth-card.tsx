import { Logo } from "./logo";

export function AuthCard({
  title,
  error,
  notice,
  children,
}: {
  title: string;
  error?: string;
  notice?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="premium-shell grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-[420px]">
        <div className="mb-6 flex justify-center">
          <Logo href="/login" />
        </div>
        <div className="card card-active p-7">
          <h1 className="mb-6 text-[24px] font-semibold tracking-[-0.02em]">{title}</h1>
          {error ? (
            <p className="mb-4 rounded-lg bg-[var(--red-tint)] px-3 py-2 text-sm text-[var(--red)]">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="mb-4 rounded-lg bg-[var(--teal-tint)] px-3 py-2 text-sm text-[var(--teal)]">
              {notice}
            </p>
          ) : null}
          {children}
        </div>
      </section>
    </main>
  );
}
