-- Unified card view / interaction tracking RPC.
-- SECURITY DEFINER so anonymous visitors can record views and clicks
-- without needing direct table write access.

create or replace function public.track_card_view(
  p_card_id    uuid,
  p_view_type  text,                  -- 'page_view' | 'qr_scan' | 'link_click'
  p_visitor_id text    default null,
  p_user_agent text    default null,
  p_referrer   text    default null,
  p_clicked_link text  default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_card record;
begin
  select id, created_by
  into v_card
  from public.business_cards
  where id = p_card_id
  limit 1;

  if not found then
    return;
  end if;

  insert into public.card_views (
    card_id,
    card_owner,
    view_type,
    visitor_id,
    user_agent,
    referrer,
    clicked_link
  ) values (
    v_card.id,
    v_card.created_by,
    p_view_type,
    p_visitor_id,
    p_user_agent,
    p_referrer,
    p_clicked_link
  );

  -- Increment the right counter atomically (no race condition)
  if p_view_type = 'page_view' then
    update public.business_cards
    set view_count = coalesce(view_count, 0) + 1
    where id = v_card.id;
  elsif p_view_type = 'qr_scan' then
    update public.business_cards
    set scan_count = coalesce(scan_count, 0) + 1
    where id = v_card.id;
  end if;
end;
$$;

grant execute on function public.track_card_view(uuid, text, text, text, text, text) to anon;
grant execute on function public.track_card_view(uuid, text, text, text, text, text) to authenticated;
