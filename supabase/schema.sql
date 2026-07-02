create extension if not exists "pgcrypto";

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  logo_url text,
  brand_color text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'starter',
  subscription_status text not null default 'trialing',
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_id uuid not null references public.agencies(id) on delete cascade,
  email text not null,
  role text not null default 'owner',
  created_at timestamptz not null default now()
);

create table public.onboarding_flows (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  title text not null default 'Client onboarding',
  questions jsonb not null default '[]'::jsonb,
  contract_text text not null,
  deposit_amount numeric(10,2) not null default 0,
  payment_schedule jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  flow_id uuid not null references public.onboarding_flows(id) on delete cascade,
  unique_link_token uuid not null unique default gen_random_uuid(),
  name text,
  email text,
  phone text,
  answers jsonb not null default '{}'::jsonb,
  signed_at timestamptz,
  signature_name text,
  signature_ip text,
  signature_user_agent text,
  contract_snapshot text,
  paid_at timestamptz,
  stripe_payment_intent_id text,
  amount_paid numeric(10,2),
  scheduled_at timestamptz,
  meeting_time text,
  status text not null default 'link_sent',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_active_at timestamptz,
  reminder_24h_sent_at timestamptz,
  reminder_3d_sent_at timestamptz
);

create table public.available_slots (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  datetime timestamptz not null,
  is_booked boolean not null default false,
  client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.notification_events (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  event text not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.client_files (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

alter table public.agencies enable row level security;
alter table public.users enable row level security;
alter table public.onboarding_flows enable row level security;
alter table public.clients enable row level security;
alter table public.available_slots enable row level security;
alter table public.notification_events enable row level security;
alter table public.client_files enable row level security;

create policy "users can read own profile" on public.users for select using (id = auth.uid());
create policy "users can update own profile" on public.users for update using (id = auth.uid());

create policy "agency members read agency" on public.agencies
  for select using (id in (select agency_id from public.users where id = auth.uid()));
create policy "agency members update agency" on public.agencies
  for update using (id in (select agency_id from public.users where id = auth.uid()));

create policy "agency members manage flows" on public.onboarding_flows
  for all using (agency_id in (select agency_id from public.users where id = auth.uid()))
  with check (agency_id in (select agency_id from public.users where id = auth.uid()));

create policy "agency members manage clients" on public.clients
  for all using (agency_id in (select agency_id from public.users where id = auth.uid()))
  with check (agency_id in (select agency_id from public.users where id = auth.uid()));

create policy "agency members manage slots" on public.available_slots
  for all using (agency_id in (select agency_id from public.users where id = auth.uid()))
  with check (agency_id in (select agency_id from public.users where id = auth.uid()));

create policy "agency members read notification events" on public.notification_events
  for select using (agency_id in (select agency_id from public.users where id = auth.uid()));

create policy "agency members manage client files" on public.client_files
  for all using (agency_id in (select agency_id from public.users where id = auth.uid()))
  with check (agency_id in (select agency_id from public.users where id = auth.uid()));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'clients'
  ) then
    alter publication supabase_realtime add table public.clients;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'available_slots'
  ) then
    alter publication supabase_realtime add table public.available_slots;
  end if;
end $$;
