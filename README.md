# Aeitron AI

Aeitron AI is a v1 SaaS for agency client onboarding: intake, agreement signing, deposit payment, kickoff booking, dashboard visibility, notifications, and subscription billing.

## Run locally

```powershell
npm.cmd install
Copy-Item .env.example .env.local
npm.cmd run dev
```

Open `http://localhost:3000/login`.

## Configure services

1. Create a Supabase project and run `supabase/schema.sql`.
   If you already ran the original schema, also run `supabase/002_v1_hardening.sql` and `supabase/003_advanced_features.sql`.
2. Fill `.env.local` with Supabase URL, anon key, and service role key.
3. Add Stripe secret, webhook secret, and plan price IDs.
4. Add Resend API key and sender email.

## Make it a real app

This code is a real Next.js web app. To make it usable outside your computer:

1. Push this folder to GitHub.
2. Deploy it on Vercel as a Next.js project.
3. Add the same `.env.local` values as Vercel environment variables.
4. In Supabase, run `supabase/schema.sql` in the SQL editor.
5. In Stripe, create products/prices for Starter, Growth, and Scale, then paste the price IDs into Vercel.
6. In Stripe, add a webhook endpoint pointing to `https://your-domain.com/api/webhooks/stripe`.

The dashboard uses Supabase Realtime for client and slot updates.

Advanced v1 features include multi-flow onboarding, conditional questions, client file uploads, milestone payment schedules, signature audit records, funnel analytics, and a cron endpoint for stalled-client nudges at `/api/cron/nudges`.

## Verify

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run lint
npm.cmd run build
```
