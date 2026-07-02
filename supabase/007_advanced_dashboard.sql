alter table public.clients
  add column if not exists current_stage text,
  add column if not exists link_sent_at timestamptz default now(),
  add column if not exists assigned_to uuid references public.users(id) on delete set null;

update public.clients
set link_sent_at = created_at
where link_sent_at is null;

create table if not exists public.stage_events (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  stage text not null,
  entered_at timestamptz not null default now()
);

alter table public.stage_events enable row level security;

drop policy if exists "agency members read stage events" on public.stage_events;
create policy "agency members read stage events" on public.stage_events
  for select using (agency_id in (select agency_id from public.users where id = auth.uid()));

create index if not exists stage_events_agency_stage_idx
  on public.stage_events(agency_id, stage, entered_at desc);

create index if not exists stage_events_client_idx
  on public.stage_events(client_id, entered_at desc);

create index if not exists clients_assigned_to_idx
  on public.clients(assigned_to);
