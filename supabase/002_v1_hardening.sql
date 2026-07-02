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

create index if not exists clients_unique_link_token_idx on public.clients(unique_link_token);
create index if not exists clients_agency_id_idx on public.clients(agency_id);
create index if not exists available_slots_agency_datetime_idx on public.available_slots(agency_id, datetime);
