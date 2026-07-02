import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { magicLinkAction, signInAction } from "@/lib/auth-actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthCard title="Log in" error={params.error} notice={params.notice}>
      <form action={signInAction} className="space-y-4">
        <label className="block">
          <span className="label">Email</span>
          <input className="field mt-1" name="email" type="email" required />
        </label>
        <label className="block">
          <span className="label">Password</span>
          <input className="field mt-1" name="password" type="password" required />
        </label>
        <button className="btn-primary w-full" type="submit">
          Log in
        </button>
        <button className="btn-secondary w-full" formAction={magicLinkAction} type="submit">
          Send magic link
        </button>
      </form>
      <div className="mt-5 flex justify-between text-sm text-[var(--ink-soft)]">
        <Link href="/signup">Create account</Link>
        <Link href="/forgot-password">Forgot password?</Link>
      </div>
    </AuthCard>
  );
}
