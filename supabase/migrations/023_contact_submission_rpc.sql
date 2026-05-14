-- Public contact-form submission via SECURITY DEFINER RPC.
-- Background: migration 021 removed direct anon SELECT on business_cards,
-- which broke the `cs_public_insert` policy's EXISTS subquery on
-- contact_submissions (the subquery returned 0 rows for anon, so RLS
-- rejected every public form submission). This RPC mirrors the
-- track_qr_scan pattern (013): runs as DEFINER, verifies the card is
-- published, then inserts the row server-side.
--
-- IMPORTANT — schema drift note:
-- The live `contact_submissions` table does NOT match `001_init.sql`. The
-- column names below (`user_id`, `form_data`, `company`) reflect the live
-- table, not the legacy migration spec. Do not change them without first
-- inspecting information_schema.columns on the deployed DB.

create or replace function public.submit_contact_form(
  p_card_id uuid,
  p_name    text  default null,
  p_email   text  default null,
  p_phone   text  default null,
  p_message text  default null,
  p_data    jsonb default '{}'::jsonb
)
returns public.contact_submissions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card record;
  v_row  public.contact_submissions;
begin
  select id, created_by_user_id
  into   v_card
  from   public.business_cards
  where  id = p_card_id
    and  status = 'published'
  limit  1;

  if not found then
    raise exception 'Card not found or not published'
      using errcode = 'P0002';
  end if;

  if v_card.created_by_user_id is null then
    raise exception 'Published card is missing owner user_id'
      using errcode = 'P0001';
  end if;

  insert into public.contact_submissions (
    card_id, user_id, name, email, phone, message, company, form_data
  ) values (
    v_card.id,
    v_card.created_by_user_id,
    nullif(p_name,    ''),
    nullif(p_email,   ''),
    nullif(p_phone,   ''),
    nullif(p_message, ''),
    nullif(p_data->>'company', ''),
    coalesce(p_data, '{}'::jsonb)
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.submit_contact_form(uuid, text, text, text, text, jsonb) to anon, authenticated;
