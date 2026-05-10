-- Migration 022: CRM OAuth state + connection storage

create table if not exists public.crm_oauth_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  access_token text,
  refresh_token text,
  token_type text,
  scope text,
  instance_url text,
  expires_at timestamptz,
  status text not null default 'active' check (status in ('active', 'error', 'revoked')),
  last_refreshed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_oauth_connections_user_provider_key unique (user_id, provider)
);

drop trigger if exists set_crm_oauth_connections_updated_at on public.crm_oauth_connections;
create trigger set_crm_oauth_connections_updated_at
before update on public.crm_oauth_connections
for each row execute function public.set_updated_at();

create index if not exists crm_oauth_connections_user_id_idx
  on public.crm_oauth_connections (user_id);

create index if not exists crm_oauth_connections_status_expires_at_idx
  on public.crm_oauth_connections (status, expires_at);

create table if not exists public.crm_oauth_states (
  state text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  expires_at timestamptz not null,
  redirect_to text,
  created_at timestamptz not null default now()
);

create index if not exists crm_oauth_states_user_id_idx
  on public.crm_oauth_states (user_id);

create index if not exists crm_oauth_states_expires_at_idx
  on public.crm_oauth_states (expires_at);

alter table public.crm_oauth_connections enable row level security;
alter table public.crm_oauth_states enable row level security;

-- Secrets are managed only by trusted server-side code using the service role.
-- Authenticated clients should not read or write these tables directly.
