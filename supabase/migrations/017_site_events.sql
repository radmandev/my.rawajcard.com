-- Migration 017: Public website tracking events

create table if not exists public.site_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  page_name text,
  path text,
  referrer text,
  visitor_id text,
  session_id text,
  user_id uuid,
  user_email text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.site_events enable row level security;

create index if not exists site_events_created_at_idx on public.site_events(created_at desc);
create index if not exists site_events_event_name_created_at_idx on public.site_events(event_name, created_at desc);
create index if not exists site_events_page_name_created_at_idx on public.site_events(page_name, created_at desc);
create index if not exists site_events_path_created_at_idx on public.site_events(path, created_at desc);
create index if not exists site_events_visitor_created_at_idx on public.site_events(visitor_id, created_at desc);

-- Public pages need anonymous inserts.
drop policy if exists "site_events_public_insert" on public.site_events;
create policy "site_events_public_insert" on public.site_events
for insert with check (true);

-- Admins can review website tracking from the dashboard.
drop policy if exists "site_events_admin_read_all" on public.site_events;
create policy "site_events_admin_read_all" on public.site_events
for select using (
  auth.jwt() ->> 'email' in ('emadradman.dev@gmail.com', 'admin@rawajcard.com')
);
