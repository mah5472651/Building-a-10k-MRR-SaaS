alter table public.agencies
  add column if not exists outbound_webhook_url text;

alter table public.onboarding_flows
  add column if not exists reassurance jsonb default '{}'::jsonb;

create index if not exists clients_paid_at_idx on public.clients(paid_at);
