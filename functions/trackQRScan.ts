const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'https://rawajcard.com';

const getServiceEnv = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl) throw new Error('SUPABASE_URL is not configured.');
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');
  return { supabaseUrl, serviceRoleKey };
};

const serviceHeaders = (serviceRoleKey: string) => ({
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
});

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');

    if (!slug) {
      return Response.redirect(APP_BASE_URL, 302);
    }

    const { supabaseUrl, serviceRoleKey } = getServiceEnv();
    const headers = serviceHeaders(serviceRoleKey);

    const cardRes = await fetch(
      `${supabaseUrl}/rest/v1/business_cards?select=id,slug,created_by,scan_count,status&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      { headers },
    );

    if (!cardRes.ok) {
      return Response.redirect(APP_BASE_URL, 302);
    }

    const cards = await cardRes.json() as Array<Record<string, unknown>>;
    const card = cards?.[0];

    if (!card || String(card.status || 'published') !== 'published') {
      return Response.redirect(APP_BASE_URL, 302);
    }

    try {
      await fetch(`${supabaseUrl}/rest/v1/card_views`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          card_id: String(card.id || ''),
          card_owner: String(card.created_by || ''),
          view_type: 'qr_scan',
          visitor_id: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || '',
          referrer: req.headers.get('referer') || '',
        }),
      });

      const currentCount = Number(card.scan_count || 0);
      await fetch(`${supabaseUrl}/rest/v1/business_cards?id=eq.${encodeURIComponent(String(card.id || ''))}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          scan_count: currentCount + 1,
        }),
      });
    } catch (error) {
      console.error('Tracking error:', error);
      // Continue redirect even if tracking fails.
    }

    const cardUrl = `${APP_BASE_URL}/c/${encodeURIComponent(String(card.slug || slug))}`;
    return Response.redirect(cardUrl, 302);
  } catch (error) {
    console.error('Error:', error);
    return Response.redirect(APP_BASE_URL, 302);
  }
});