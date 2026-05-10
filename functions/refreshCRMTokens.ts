declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: corsHeaders });

const getEnv = () => {
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
});

const refreshByProvider = async (provider: string, refreshToken: string) => {
  if (provider === 'salesforce') {
    const clientId = Deno.env.get('SALESFORCE_CLIENT_ID');
    const clientSecret = Deno.env.get('SALESFORCE_CLIENT_SECRET');
    if (!clientId || !clientSecret) throw new Error('Missing Salesforce OAuth secrets.');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.access_token) {
      throw new Error(`Salesforce refresh failed: ${JSON.stringify(data)}`);
    }

    return {
      access_token: String(data.access_token),
      refresh_token: String(data.refresh_token || refreshToken),
      token_type: String(data.token_type || 'Bearer'),
      scope: String(data.scope || ''),
      instance_url: String(data.instance_url || ''),
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      metadata: {
        id: data.id || null,
      },
    };
  }

  if (provider === 'hubspot') {
    const clientId = Deno.env.get('HUBSPOT_CLIENT_ID');
    const clientSecret = Deno.env.get('HUBSPOT_CLIENT_SECRET');
    if (!clientId || !clientSecret) throw new Error('Missing HubSpot OAuth secrets.');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const res = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: body.toString(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.access_token) {
      throw new Error(`HubSpot refresh failed: ${JSON.stringify(data)}`);
    }

    const expiresInSec = Number(data?.expires_in || 1800) || 1800;

    return {
      access_token: String(data.access_token),
      refresh_token: String(data.refresh_token || refreshToken),
      token_type: String(data.token_type || 'Bearer'),
      scope: String(data.scope || ''),
      instance_url: '',
      expires_at: new Date(Date.now() + expiresInSec * 1000).toISOString(),
      metadata: {
        hub_id: data.hub_id || null,
      },
    };
  }

  throw new Error('Unsupported provider');
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { supabaseUrl, serviceRoleKey } = getEnv();
    const nowIso = new Date().toISOString();
    const soonIso = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const res = await fetch(
      `${supabaseUrl}/rest/v1/crm_oauth_connections?select=id,user_id,provider,refresh_token,expires_at,status&status=eq.active&or=(expires_at.is.null,expires_at.lte.${encodeURIComponent(soonIso)})`,
      { headers: serviceHeaders(serviceRoleKey) },
    );

    const rows = await res.json().catch(() => []);
    if (!res.ok || !Array.isArray(rows)) {
      return json({ success: false, error: 'Failed to fetch OAuth connections', details: rows }, 500);
    }

    let refreshed = 0;
    let failed = 0;

    for (const row of rows as Array<Record<string, unknown>>) {
      const id = String(row.id || '');
      const provider = String(row.provider || '');
      const refreshToken = String(row.refresh_token || '');

      if (!id || !provider || !refreshToken) {
        failed++;
        continue;
      }

      try {
        const tokenData = await refreshByProvider(provider, refreshToken);

        const updateRes = await fetch(`${supabaseUrl}/rest/v1/crm_oauth_connections?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: serviceHeaders(serviceRoleKey),
          body: JSON.stringify({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || refreshToken,
            token_type: tokenData.token_type || null,
            scope: tokenData.scope || null,
            instance_url: tokenData.instance_url || null,
            expires_at: tokenData.expires_at || null,
            status: 'active',
            last_refreshed_at: nowIso,
            metadata: tokenData.metadata || {},
          }),
        });

        if (!updateRes.ok) {
          const body = await updateRes.text();
          throw new Error(`DB update failed: ${body}`);
        }

        refreshed++;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`refreshCRMTokens row ${id} failed:`, message);
        failed++;

        await fetch(`${supabaseUrl}/rest/v1/crm_oauth_connections?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: serviceHeaders(serviceRoleKey),
          body: JSON.stringify({
            status: 'error',
            metadata: { refresh_error: message, failed_at: nowIso },
          }),
        });
      }
    }

    return json({ success: true, refreshed, failed, checked: rows.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return json({ success: false, error: message }, 500);
  }
});

export {};
