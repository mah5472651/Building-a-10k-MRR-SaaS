alter table public.agencies
  add column if not exists alert_rules jsonb default '[]'::jsonb;

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  kind text not null default 'deposit',
  status text not null default 'failed',
  amount numeric(10,2),
  provider_event_id text,
  failure_reason text,
  created_at timestamptz not null default now()
);

alter table public.payment_events enable row level security;

drop policy if exists "agency members read payment events" on public.payment_events;
create policy "agency members read payment events" on public.payment_events
  for select using (agency_id in (select agency_id from public.users where id = auth.uid()));

drop policy if exists "agency members update payment events" on public.payment_events;
create policy "agency members update payment events" on public.payment_events
  for update using (agency_id in (select agency_id from public.users where id = auth.uid()))
  with check (agency_id in (select agency_id from public.users where id = auth.uid()));

create index if not exists payment_events_agency_created_idx
  on public.payment_events(agency_id, created_at desc);

create index if not exists payment_events_client_idx
  on public.payment_events(client_id);
