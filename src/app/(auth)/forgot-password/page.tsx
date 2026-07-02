import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { forgotPasswordAction } from "@/lib/auth-actions";

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Reset password">
      <form action={forgotPasswordAction} className="space-y-4">
        <label className="block">
          <span className="label">Email</span>
          <input className="field mt-1" name="email" type="email" required />
        </label>
        <button className="btn-primary w-full" type="submit">
          Send reset link
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-[var(--ink-soft)]">
        <Link href="/login">Back to login</Link>
      </p>
    </AuthCard>
  );
}
