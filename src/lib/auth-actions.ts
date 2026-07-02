"use server";

import { redirect } from "next/navigation";
import { appUrl } from "./env";
import { createServerSupabase } from "./supabase";

export async function signInAction(formData: FormData) {
  const supabase = await createServerSupabase();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const supabase = await createServerSupabase();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${appUrl}/auth/callback` },
  });
  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  redirect("/onboarding");
}

export async function magicLinkAction(formData: FormData) {
  const supabase = await createServerSupabase();
  const email = String(formData.get("email") ?? "");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${appUrl}/auth/callback` },
  });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/login?notice=Check your email for the magic link.");
}

export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createServerSupabase();
  const email = String(formData.get("email") ?? "");
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/settings`,
  });
  redirect("/login?notice=Check your email for a reset link.");
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createServerSupabase();
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) redirect("/settings?error=Password must be at least 8 characters.");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  redirect("/settings?saved=1");
}

export async function signOutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/login");
}
