do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notification_events'
  ) then
    alter publication supabase_realtime add table public.notification_events;
  end if;
end $$;

create index if not exists notification_events_agency_created_idx
  on public.notification_events(agency_id, created_at desc);
