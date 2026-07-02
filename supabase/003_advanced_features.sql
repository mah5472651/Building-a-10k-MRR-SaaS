alter table public.onboarding_flows
  add column if not exists payment_schedule jsonb not null default '[]'::jsonb;

alter table public.clients
  add column if not exists signature_user_agent text,
  add column if not exists contract_snapshot text,
  add column if not exists last_active_at timestamptz,
  add column if not exists reminder_24h_sent_at timestamptz,
  add column if not exists reminder_3d_sent_at timestamptz;

create table if not exists public.client_files (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

alter table public.client_files enable row level security;

drop policy if exists "agency members manage client files" on public.client_files;
create policy "agency members manage client files" on public.client_files
  for all using (agency_id in (select agency_id from public.users where id = auth.uid()))
  with check (agency_id in (select agency_id from public.users where id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('client-uploads', 'client-uploads', false)
on conflict (id) do nothing;

drop policy if exists "agency members read upload objects" on storage.objects;
create policy "agency members read upload objects" on storage.objects
  for select using (
    bucket_id = 'client-uploads'
    and exists (
      select 1 from public.client_files cf
      join public.users u on u.agency_id = cf.agency_id
      where u.id = auth.uid() and cf.file_path = storage.objects.name
    )
  );

create index if not exists client_files_client_id_idx on public.client_files(client_id);
create index if not exists clients_last_active_idx on public.clients(last_active_at);
