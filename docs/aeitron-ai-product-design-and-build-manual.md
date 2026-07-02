# Aeitron AI Product, Design, and Build Manual

Last updated: 2026-07-03

## Product Summary
Aeitron AI is a premium SaaS app for agencies to manage client handoff from link creation to intake, agreement signature, deposit payment, kickoff booking, realtime notifications, and billing. The app is built as a Next.js App Router application with Supabase, Stripe, Resend, and realtime agency dashboards.

## Core Routes
- Agency auth: `/login`, `/signup`, `/forgot-password`, `/auth/callback`
- Agency app: `/dashboard`, `/analytics`, `/analytics/retention`, `/team`, `/clients`, `/clients/[id]`, `/flow`, `/settings`, `/billing`, `/onboarding`
- Client flow: `/c/[token]`, `/c/[token]/agreement`, `/c/[token]/deposit`, `/c/[token]/kickoff`, `/c/[token]/confirmation`
- Preview: `/preview/[flowId]`
- API: client links, client flow save/upload, manual client nudges, dashboard revenue/funnel/time/priority/cohort/team JSON, billing failed-payment/retry JSON, settings alert-rules JSON, Stripe checkout/webhooks, payment recovery nudges, notifications, slots, summary, signature record, monthly reports, cron nudges

## Built Features
- Supabase email/password auth, magic link, logout, password reset, and password update
- First-run agency setup with agency name, optional logo, default questions, deposit amount, and first kickoff slot
- Agency dashboard with realtime refresh, stats, weekly collected deposits, needs-attention widget, smart deposit recommendation, funnel analytics, recent activity, and client link generation
- Analytics command center with revenue leak detector, at-risk revenue, potential lost revenue, bottleneck stage heatmap, multi-flow conversion compare, time-to-close breakdown, send-time heatmap, smart follow-up prioritization, cohorts, payment recovery, team performance, custom alert rules, and monthly printable report export
- Dashboard embeds the highest-priority revenue leak detector, at-risk metric, priority call list, and monthly report export directly above the operational panels
- Dashboard API endpoints expose `/api/dashboard/revenue-leak`, `/api/dashboard/funnel-breakdown`, `/api/dashboard/time-to-close`, `/api/dashboard/priority-queue`, `/api/dashboard/cohorts`, and `/api/dashboard/team-performance`
- Manual client nudge buttons in analytics send a real follow-up email with the client's secure handoff link and record a notification event
- Client records with progress, answers, signature audit, uploaded files, payment schedule, printable signature record, and printable onboarding summary
- Flow editor with multiple onboarding flows, active/default flow selection, questions, dropdown options, conditional questions, agreement text, deposit amount, payment milestones, reassurance copy, kickoff slots, and client preview
- Public client flow with details intake, file upload, typed signature, Stripe deposit checkout or zero-dollar skip, kickoff booking, and confirmation
- Stripe deposit checkout, SaaS subscription checkout, billing portal, webhook sync, customer sync, invoice payment sync, and paywall for expired trial/subscription
- Stripe failed deposit/payment-intent and failed subscription invoice events are recorded into a recovery table for agency action
- Payment recovery panel can send client dunning/retry emails through Resend
- Payment recovery emails include the real client deposit retry link when the failed Stripe event is tied to a client
- Billing exposes failed-payment JSON at `/api/billing/failed-payments` and retry-link JSON at `/api/billing/retry-payment`
- Realtime notification center, live status badge, online presence count, client/slot/notification realtime refresh
- Resend transactional email hooks and Zapier/Make outbound webhook URL
- Stalled client nudge cron and Twilio helper
- Command palette with `Ctrl + K`
- Clients card/table toggle
- Button reliability hardening for copy, client-link generation, checkout, send-link email, slot removal, uploads, intake save, signature save, and kickoff booking
- All decorative/no-op controls are avoided; visible buttons must either perform an action, submit a form, navigate, or be clearly disabled
- Search and notification overlays use separate fixed modal layers with high z-index, Escape/outside close behavior, and no layout overlap
- Search and notification are independent components with separate local state. Their overlays render through `createPortal(document.body)` as fixed body-level surfaces, so they never push page layout downward.
- Unit tests for validation, client state, paywall behavior, notification events, average completion, and deposit recommendation

## Premium Visual Direction
The app uses a dark, premium financial-command-center visual style inspired by glass dashboards:
- Midnight background
- Frosted glass sidebar
- Dark translucent cards
- Violet/blue/teal light blooms
- Amber highlights for primary actions and progress
- Neon teal for live/completed states
- Soft shadows, blur, glows, and restrained motion
- Compact security-console composition inspired by Orca-style dashboards: profile sidebar, purple active nav, four metric cards, heatmap, map panel, exposure list, and results table
- Analytics screens keep the same compact security-console language: small dense cards, glowing heat cells, bordered tables, dark recovery panels, and printable light report output for business sharing

## Color Tokens
Primary colors in `src/app/globals.css`:
- `--paper`: `#05070d` app background
- `--paper-50`: `#0b101a` secondary dark surface
- `--paper-0`: `rgba(14, 19, 31, 0.78)` glass card surface
- `--ink`: `#edf3ff` primary text
- `--ink-soft`: `#9ca9c3` muted text
- `--ink-900`: `#f8fbff` brightest text
- `--ink-100`: `#232b3d` dark divider base
- `--line`: `rgba(164, 178, 213, 0.14)` default border
- `--line-strong`: `rgba(188, 200, 236, 0.28)` stronger border
- `--amber-500`: `#ffb14a` primary action/progress
- `--amber-100`: `#fff0ce` warm primary button text
- `--amber-tint`: `rgba(255, 177, 74, 0.13)` amber badge background
- `--teal-500`: `#48f0c2` live/success glow
- `--teal-tint`: `rgba(72, 240, 194, 0.12)` success badge background
- `--red-500`: `#ff4d62` error/danger
- `--red-tint`: `rgba(255, 77, 98, 0.12)` error badge background
- `--violet-500`: `#8d7cff` focus/premium glow
- `--violet-600`: `#7c3dff` active navigation and heatmap intensity
- `--blue-500`: `#5b8cff` chart gradient

## Fonts
Fonts are loaded in `src/app/layout.tsx` from Google Fonts:
- Inter: primary UI font, weights 400, 500, 600
- Fraunces: available as serif accent via `.serif`, weights 400, 500, 600
- IBM Plex Mono: numbers, codes, and links, weights 400, 500

## Typography
- Page title: 26px, 32px line-height, semibold, tight tracking
- Card titles: 19px to 24px depending context
- Body text: 14px, 1.5 line-height
- Labels: 12px, medium, 0.02em letter spacing, muted color
- Mono values: IBM Plex Mono for URLs, money, and codes

## Layout System
- Agency app uses `AgencyShell`
- Desktop sidebar width: 224px
- Mobile nav: fixed bottom glass bar
- Main content max width: 1180px
- Cards use 18px radius, translucent dark background, blur, border, shadow, and hover lift
- Client flow max width: 640px
- Repeated panels should use `.card`; nested cards should be avoided except small inline panels

## Animation System
Motion tokens and classes in `globals.css`:
- `--ease-premium`: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- `.agency-page`: staggered page reveal
- `.nav-item`: sidebar item entrance
- `.premium-popover`: command palette and notification entrance
- `.live-dot`: realtime pulse
- `.premium-float`: subtle floating bell
- `.client-row`: row hover slide
- `.handoff-step-card`: client step entrance
- `.receipt-item`: confirmation receipt stagger
- `prefers-reduced-motion` is respected

## Component Styling
- Primary buttons: dark gradient, amber border glow, shine sweep on hover, 12px radius
- Secondary buttons: transparent glass, subtle border, hover lift
- Fields: dark background, 12px radius, violet focus ring and glow
- Cards: glass background, 18px radius, top-left highlight, hover lift
- Console panels: `.console-panel` for dense dashboard surfaces
- Metric cards: `.metric-card` for the four top dashboard counters
- Heatmap cells: `.heat-cell` and `.map-dot` for visual analytics panels
- Sidebar: frosted dark glass, selected nav glow, amber active rail
- Notification bell: floating motion, realtime pulse, dark glass popover
- Search: Ctrl+K opens a full command palette that searches core pages and client records by name/email/status
- Analytics nav item uses a chart icon and opens the revenue/recovery command center
- Status badges: bordered translucent pills with colored dots
- Progress rail: amber glowing fill, pulsing active step, checked completed dots

## Interaction Reliability Rules
- Every network button must handle loading, success, and failure states.
- Fetch handlers must tolerate non-JSON error responses.
- Clipboard actions must use a textarea fallback when `navigator.clipboard` is unavailable.
- Random ID generation must use `crypto.randomUUID()` only with a fallback for older browsers.
- File upload must stop early with a friendly message when no file is selected.
- Buttons that do not perform an action should not be rendered as buttons.
- Search and notification surfaces must never use small dropdowns that can overlap page cards; use fixed overlays/drawers.
- Topbar overlays must not be controlled by a shared parent unless there is a specific product reason. Each overlay owns its state and renders into `document.body`; lightweight app events may close sibling overlays without moving ownership into a parent.
- Stripe buttons should show user-friendly unavailable messages when Stripe is not configured.
- Route handlers should return JSON errors instead of crashing whenever possible.
- Recovery actions must keep their own button state and call `/api/recovery/nudge`; they should not depend on notification/search parent state.
- Manual nudge actions must keep their own button state and call `/api/clients/[id]/nudge`; they should record `manual_nudge` in `notification_events`.
- Monthly report export returns standalone printable HTML from `/api/reports/monthly` and must not require client-side app state.
- Monthly report export accepts `?month=YYYY-MM`, includes agency logo when present, and shows total clients, collected revenue, and conversion rate.

## Analytics And Recovery Suite
The `/analytics` page is the agency owner cockpit for deciding where money is stuck and what action to take next.

Revenue Leak Detector:
- Calculates unpaid, incomplete clients using each client's flow deposit/payment schedule value.
- Flags at-risk rows using configurable alert thresholds, defaulting to 72 hours when no rule exists.
- Shows pending revenue, at-risk revenue, and potential lost revenue this month.
- Table columns: client name, stage stuck, value, days stalled, and action buttons for real client nudge email and phone call.

Bottleneck Heatmap:
- Measures drop-off across Intake, Agreement, Deposit, and Kickoff.
- Shows percentage drop between stages with violet-to-red bars.
- Highlights the worst stage and suggests agreement copy simplification when agreement drop-off is high.

Time-To-Close Analytics:
- Shows average hours from created-to-signed, signed-to-paid, paid-to-booked, and created-to-booked.
- Includes a weekday/time-of-day heatmap using client link creation time to reveal stronger send windows.

Smart Follow-up Prioritization:
- Scores clients with value, stall time, and completion depth.
- Shows a ranked daily call list with plain-language reasoning, stage view counts from `stage_events`, direct nudge email, call, and client-detail actions.

Cohorts And Team View:
- Groups clients by created month and estimates repeat rate from repeated client emails.
- Shows lifetime value per cohort from collected amounts.
- V1 team performance shows the agency owner as the single team member; the structure is ready for future multi-user agencies.

Payment Recovery:
- Uses `payment_events` to list failed/declined deposit and subscription payment events.
- Stripe webhooks record `checkout.session.async_payment_failed`, `payment_intent.payment_failed`, and `invoice.payment_failed`.
- Recovery buttons send dunning/retry emails via Resend, include `/c/[token]/deposit` when available, and mark the event as open with "Recovery email sent".

Custom Alerts:
- Agencies configure deposit pending and agreement unsigned thresholds in `/settings`.
- Rules are stored in `agencies.alert_rules` as JSON and displayed on `/analytics`.
- Alert rules are also exposed through `/api/settings/alert-rules` for GET, POST, and DELETE.
- `/api/cron/nudges` evaluates enabled alert rules, sends agency alert emails, records `custom_alert_[stage]` notification events, and dedupes alerts per client per day.

Monthly Report Export:
- `/api/reports/monthly?month=YYYY-MM` returns printable HTML with summary revenue, collected revenue, conversion rate, stuck clients, bottlenecks, and priority follow-ups.
- The browser print dialog can save the report as PDF.

## Database Tables
Supabase tables:
- `agencies`
- `users`
- `onboarding_flows`
- `clients`
- `available_slots`
- `notification_events`
- `client_files`
- `payment_events`
- `stage_events`

RLS protects agency-owned data. Public client token routes use server-side API handlers and service role where needed.

## Supabase Migrations
Migration files:
- `supabase/schema.sql`: full base schema and RLS
- `supabase/002_v1_hardening.sql`: realtime publication hardening
- `supabase/003_advanced_features.sql`: files, milestones, reminders, storage
- `supabase/004_round2_features.sql`: outbound webhook URL, reassurance copy, paid index
- `supabase/005_realtime_notifications.sql`: notification realtime publication and index
- `supabase/006_analytics_recovery.sql`: agency alert rules JSON, payment recovery events table, RLS, and recovery indexes
- `supabase/007_advanced_dashboard.sql`: client current stage, link sent timestamp, assigned user, stage events table, RLS, and dashboard analytics indexes

## Environment Variables
Required:
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional integrations:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_STARTER_PRICE_ID`
- `STRIPE_GROWTH_PRICE_ID`
- `STRIPE_SCALE_PRICE_ID`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CRON_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

## Important Files
- `src/app/globals.css`: full design tokens, animations, component primitives
- `src/components/agency-shell.tsx`: agency layout, sidebar, header, command palette, notifications
- `src/components/client-frame.tsx`: public client flow shell
- `src/components/notification-center.tsx`: realtime notifications and presence
- `src/components/command-palette.tsx`: Ctrl+K navigation
- `src/components/client-pipeline.tsx`: clients card/table switcher
- `src/components/recovery-button.tsx`: payment recovery retry/dunning action button
- `src/components/revenue-leak-panel.tsx`: dashboard and analytics revenue leak detector
- `src/components/bottleneck-heatmap.tsx`: funnel drop-off visualization
- `src/components/time-to-close-chart.tsx`: stage timing and send-time heatmap
- `src/components/priority-followup-list.tsx`: scored daily client call list
- `src/components/cohort-retention-table.tsx`: monthly cohort and repeat client table
- `src/components/payment-recovery-panel.tsx`: failed payment and churn-risk panel
- `src/components/team-performance-table.tsx`: team leaderboard table
- `src/components/alert-rule-builder.tsx`: custom threshold settings UI
- `src/app/(agency)/analytics/page.tsx`: analytics, revenue leak, bottleneck, recovery, alert, cohort, and report UI
- `src/app/(agency)/analytics/retention/page.tsx`: focused retention/cohort view
- `src/app/(agency)/team/page.tsx`: team performance view
- `src/app/api/reports/monthly/route.ts`: printable monthly performance report export
- `src/app/api/recovery/nudge/route.ts`: Resend-powered recovery email endpoint
- `src/app/api/clients/[id]/nudge/route.ts`: manual client follow-up email endpoint
- `src/lib/analytics.ts`: agency analytics calculations for revenue, bottlenecks, time-to-close, cohorts, follow-ups, payment events, and team performance
- `src/lib/stage-events.ts`: public client flow stage entry logging and current-stage updates
- `src/lib/data.ts`: agency data, dashboard stats, recommendations, client bundles
- `src/lib/state.ts`: client progress and paywall helpers
- `src/lib/notifications.ts`: notification event recording
- `src/lib/webhooks.ts`: outbound agency webhook sender
- `src/lib/supabase.ts`: server/service Supabase clients

## Update Rule
Whenever any product feature, UI style, route, database schema, environment variable, or integration changes, this manual must be updated in the same commit. This file should stay complete enough that someone can understand the whole Aeitron AI app without seeing the UI first.
