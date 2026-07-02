import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { signUpAction } from "@/lib/auth-actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthCard title="Create your Aeitron AI account" error={params.error}>
      <form action={signUpAction} className="space-y-4">
        <label className="block">
          <span className="label">Email</span>
          <input className="field mt-1" name="email" type="email" required />
        </label>
        <label className="block">
          <span className="label">Password</span>
          <input className="field mt-1" name="password" type="password" minLength={8} required />
        </label>
        <button className="btn-primary w-full" type="submit">
          Sign up
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-[var(--ink-soft)]">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </AuthCard>
  );
}
