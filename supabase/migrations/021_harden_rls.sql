-- Migration 021: Harden RLS – owner-scoped policies, admin helper, safe public card lookup
-- Replaces all permissive `using (true)` policies with owner-scoped checks.
-- Anon access to business_cards is removed from the table and moved to a
-- SECURITY DEFINER function so bulk enumeration via the REST API is impossible.

-- ─────────────────────────────────────────────────────────────────────────────
-- PRE-STEP: Ensure both created_by (text) and created_by_user_id (uuid) exist
-- on every relevant table.  Some live databases were created before these
-- columns were added to 001_init.sql, so we add them defensively here.
-- ─────────────────────────────────────────────────────────────────────────────

-- Add created_by text column where missing
alter table public.business_cards         add column if not exists created_by text;
alter table public.custom_templates       add column if not exists created_by text;
alter table public.customization_requests add column if not exists created_by text;
alter table public.subscriptions          add column if not exists created_by text;
alter table public.orders                 add column if not exists created_by text;
alter table public.cart_items             add column if not exists created_by text;
alter table public.teams                  add column if not exists created_by text;

-- Add created_by_user_id uuid column where missing
alter table public.business_cards         add column if not exists created_by_user_id uuid;
alter table public.custom_templates       add column if not exists created_by_user_id uuid;
alter table public.customization_requests add column if not exists created_by_user_id uuid;
alter table public.subscriptions          add column if not exists created_by_user_id uuid;
alter table public.orders                 add column if not exists created_by_user_id uuid;
alter table public.cart_items             add column if not exists created_by_user_id uuid;
alter table public.teams                  add column if not exists created_by_user_id uuid;

-- Backfill created_by_user_id from auth.users where created_by email is known.
-- Safe to run even when created_by is null — those rows simply won't match.
update public.business_cards bc
  set created_by_user_id = u.id
  from auth.users u
  where u.email = bc.created_by
    and bc.created_by_user_id is null
    and bc.created_by is not null;

update public.custom_templates ct
  set created_by_user_id = u.id
  from auth.users u
  where u.email = ct.created_by
    and ct.created_by_user_id is null
    and ct.created_by is not null;

update public.customization_requests cr
  set created_by_user_id = u.id
  from auth.users u
  where u.email = cr.created_by
    and cr.created_by_user_id is null
    and cr.created_by is not null;

update public.subscriptions s
  set created_by_user_id = u.id
  from auth.users u
  where u.email = s.created_by
    and s.created_by_user_id is null
    and s.created_by is not null;

update public.orders o
  set created_by_user_id = u.id
  from auth.users u
  where u.email = o.created_by
    and o.created_by_user_id is null
    and o.created_by is not null;

update public.cart_items ci
  set created_by_user_id = u.id
  from auth.users u
  where u.email = ci.created_by
    and ci.created_by_user_id is null
    and ci.created_by is not null;

update public.teams t
  set created_by_user_id = u.id
  from auth.users u
  where u.email = t.created_by
    and t.created_by_user_id is null
    and t.created_by is not null;

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Admin helper function
--    Returns true when the calling user has role = 'admin' in public.profiles
--    OR is one of the emergency fallback emails (kept only for bootstrapping).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  )
  -- emergency bootstrap: owners of the service account still work even before
  -- the role column is set.  Remove these two emails once role='admin' is
  -- confirmed in the DB.
  or auth.jwt() ->> 'email' in ('emadradman.dev@gmail.com', 'admin@rawajcard.com');
$$;

grant execute on function public.is_admin() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. business_cards
--    • Anon: NO direct table access at all (use get_public_card_by_slug RPC).
--    • Authenticated owner: full CRUD on own rows only.
--    • Admin: full CRUD on all rows.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "business_cards_public_read"           on public.business_cards;
drop policy if exists "business_cards_authenticated_read"    on public.business_cards;
drop policy if exists "business_cards_authenticated_write"   on public.business_cards;
drop policy if exists "business_cards_authenticated_update"  on public.business_cards;
drop policy if exists "business_cards_authenticated_delete"  on public.business_cards;

-- owner select
create policy "bc_owner_select" on public.business_cards
  for select to authenticated
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

-- owner insert  (new cards must belong to the caller)
create policy "bc_owner_insert" on public.business_cards
  for insert to authenticated
  with check (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

-- owner update
create policy "bc_owner_update" on public.business_cards
  for update to authenticated
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  )
  with check (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

-- owner delete
create policy "bc_owner_delete" on public.business_cards
  for delete to authenticated
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Public card lookup – SECURITY DEFINER function
--    Called by the /c/:slug page.  Returns at most one published card.
--    Because it is SECURITY DEFINER it bypasses RLS internally, so the anon
--    role never touches the business_cards table directly.
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.get_public_card_by_slug(p_slug text)
returns setof public.business_cards
language sql
security definer
stable
set search_path = public
as $$
  select *
  from public.business_cards
  where slug = p_slug
    and status = 'published'
  limit 1;
$$;

-- Allow both anon visitors and authenticated users to call this function.
grant execute on function public.get_public_card_by_slug(text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. card_views
--    • Anon insert: allowed, but only for valid published card_id.
--    • Authenticated select: only the card owner can see views of their own cards.
--    • Admin: can read all.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "card_views_public_insert"       on public.card_views;
drop policy if exists "card_views_authenticated_read"  on public.card_views;

-- public insert scoped to published cards only
create policy "cv_public_insert" on public.card_views
  for insert
  with check (
    exists (
      select 1
      from public.business_cards bc
      where bc.id = card_id
        and bc.status = 'published'
    )
  );

-- owner / admin select
create policy "cv_owner_select" on public.card_views
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.business_cards bc
      where bc.id = card_views.card_id
        and bc.created_by_user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. contact_submissions
--    • Anon insert: allowed for published cards only (public contact form).
--    • Authenticated select: card owner or admin.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "contact_submissions_public_insert"       on public.contact_submissions;
drop policy if exists "contact_submissions_authenticated_read"  on public.contact_submissions;

create policy "cs_public_insert" on public.contact_submissions
  for insert
  with check (
    exists (
      select 1
      from public.business_cards bc
      where bc.id = card_id
        and bc.status = 'published'
    )
  );

create policy "cs_owner_select" on public.contact_submissions
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.business_cards bc
      where bc.id = contact_submissions.card_id
        and bc.created_by_user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. subscriptions
--    • Owner: select/update own row only.
--    • Admin: full access.
--    • Inserts / deletes should only happen via service-role (edge functions).
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "subscriptions_authenticated_all" on public.subscriptions;

create policy "sub_owner_select" on public.subscriptions
  for select to authenticated
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

create policy "sub_owner_update" on public.subscriptions
  for update to authenticated
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  )
  with check (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

-- Service-role inserts bypass RLS entirely, so no insert policy needed here.
-- If you do need authenticated inserts (e.g. free plan on signup), add:
-- create policy "sub_owner_insert" on public.subscriptions
--   for insert to authenticated
--   with check (created_by_user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. orders
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "orders_authenticated_all" on public.orders;
drop policy if exists "orders_public_insert"     on public.orders;

create policy "orders_owner_select" on public.orders
  for select to authenticated
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

create policy "orders_owner_update" on public.orders
  for update to authenticated
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  )
  with check (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

-- Guest checkout: allow anon insert (no user id) or authenticated insert for self.
create policy "orders_insert" on public.orders
  for insert
  with check (
    -- anon guest order (no user id)
    created_by_user_id is null
    -- or the caller is creating their own order
    or created_by_user_id = auth.uid()
    or public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. cart_items
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "cart_items_authenticated_all" on public.cart_items;

create policy "cart_owner_all" on public.cart_items
  for all to authenticated
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  )
  with check (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. custom_templates
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "custom_templates_authenticated_all" on public.custom_templates;

create policy "ct_owner_all" on public.custom_templates
  for all to authenticated
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  )
  with check (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. customization_requests
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "customization_requests_authenticated_all" on public.customization_requests;

create policy "cr_owner_all" on public.customization_requests
  for all to authenticated
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  )
  with check (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. teams
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "teams_authenticated_all" on public.teams;

create policy "teams_owner_all" on public.teams
  for all to authenticated
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  )
  with check (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. team_members
--     A member can see/edit their own row; team owners can see all rows in their teams.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "team_members_authenticated_all" on public.team_members;

create policy "tm_access" on public.team_members
  for all to authenticated
  using (
    public.is_admin()
    -- the user is the member themselves
    or email = (select email from public.profiles where id = auth.uid())
    -- or the user owns the team
    or exists (
      select 1 from public.teams t
      where t.id = team_members.team_id
        and t.created_by_user_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or email = (select email from public.profiles where id = auth.uid())
    or exists (
      select 1 from public.teams t
      where t.id = team_members.team_id
        and t.created_by_user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. activity_logs
--     Team owners and admins only.
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "activity_logs_authenticated_all" on public.activity_logs;

create policy "al_team_owner_access" on public.activity_logs
  for all to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.teams t
      where t.id = activity_logs.team_id
        and t.created_by_user_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.teams t
      where t.id = activity_logs.team_id
        and t.created_by_user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. Update admin profile policies to use is_admin() instead of hardcoded emails
-- ─────────────────────────────────────────────────────────────────────────────
drop policy if exists "profiles_admin_read_all"   on public.profiles;
drop policy if exists "profiles_admin_update_all" on public.profiles;

create policy "profiles_admin_read_all" on public.profiles
  for select
  using (public.is_admin());

create policy "profiles_admin_update_all" on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- Reload PostgREST schema cache
notify pgrst, 'reload schema';
