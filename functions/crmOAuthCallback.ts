declare const Deno: any;

const APP_BASE_URL = Deno.env.get('APP_BASE_URL') || 'https://rawajcard.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': APP_BASE_URL,
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

const providerTokenExchange = async (provider: string, code: string) => {
  if (provider === 'salesforce') {
    const clientId = Deno.env.get('SALESFORCE_CLIENT_ID');
    const clientSecret = Deno.env.get('SALESFORCE_CLIENT_SECRET');
    const redirectUri = Deno.env.get('SALESFORCE_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Salesforce OAuth secrets.');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });

    const res = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.access_token) {
      throw new Error(`Salesforce token exchange failed: ${JSON.stringify(data)}`);
    }

    const expiresInSec = Number(data?.expires_in || 7200) || 7200;

    return {
      access_token: String(data.access_token),
      refresh_token: String(data.refresh_token || ''),
      token_type: String(data.token_type || 'Bearer'),
      scope: String(data.scope || ''),
      instance_url: String(data.instance_url || ''),
      expires_at: new Date(Date.now() + expiresInSec * 1000).toISOString(),
      metadata: {
        id: data.id || null,
        signature: data.signature || null,
      },
    };
  }

  if (provider === 'hubspot') {
    const clientId = Deno.env.get('HUBSPOT_CLIENT_ID');
    const clientSecret = Deno.env.get('HUBSPOT_CLIENT_SECRET');
    const redirectUri = Deno.env.get('HUBSPOT_REDIRECT_URI');

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing HubSpot OAuth secrets.');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });

    const res = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: body.toString(),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.access_token) {
      throw new Error(`HubSpot token exchange failed: ${JSON.stringify(data)}`);
    }

    const expiresInSec = Number(data?.expires_in || 1800) || 1800;

    return {
      access_token: String(data.access_token),
      refresh_token: String(data.refresh_token || ''),
      token_type: String(data.token_type || 'Bearer'),
      scope: String(data.scope || ''),
      instance_url: '',
      expires_at: new Date(Date.now() + expiresInSec * 1000).toISOString(),
      metadata: {
        hub_id: data.hub_id || null,
      },
    };
  }

  throw new Error('Unsupported OAuth provider');
};

const mergeCrmConfig = (existing: Record<string, unknown>, provider: string) => {
  return {
    ...(existing || {}),
    provider,
    status: 'active',
    connected_at: new Date().toISOString(),
  };
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { supabaseUrl, serviceRoleKey } = getEnv();
    const url = new URL(req.url);

    const state = url.searchParams.get('state') || '';
    const code = url.searchParams.get('code') || '';
    const error = url.searchParams.get('error') || '';
    const errorDescription = url.searchParams.get('error_description') || '';

    if (error) {
      const redirect = `${APP_BASE_URL}/CRMSettings?oauth=error&message=${encodeURIComponent(errorDescription || error)}`;
      return Response.redirect(redirect, 302);
    }

    if (!state || !code) {
      return json({ success: false, error: 'Missing state or code' }, 400);
    }

    const stateRes = await fetch(
      `${supabaseUrl}/rest/v1/crm_oauth_states?select=state,user_id,provider,expires_at,redirect_to&state=eq.${encodeURIComponent(state)}&limit=1`,
      { headers: serviceHeaders(serviceRoleKey) },
    );

    const stateRows = await stateRes.json().catch(() => []);
    if (!stateRes.ok || !Array.isArray(stateRows) || !stateRows[0]) {
      return json({ success: false, error: 'Invalid OAuth state' }, 400);
    }

    const stateRow = stateRows[0] as Record<string, unknown>;
    const provider = String(stateRow.provider || '');
    const userId = String(stateRow.user_id || '');
    const expiresAt = String(stateRow.expires_at || '');
    const redirectTo = String(stateRow.redirect_to || `${APP_BASE_URL}/CRMSettings?oauth=success&provider=${provider}`);

    if (!provider || !userId) {
      return json({ success: false, error: 'Corrupt OAuth state payload' }, 400);
    }

    if (expiresAt && Date.parse(expiresAt) < Date.now()) {
      return json({ success: false, error: 'OAuth state has expired' }, 400);
    }

    const tokenData = await providerTokenExchange(provider, code);

    const upsertRes = await fetch(`${supabaseUrl}/rest/v1/crm_oauth_connections`, {
      method: 'POST',
      headers: {
        ...serviceHeaders(serviceRoleKey),
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        user_id: userId,
        provider,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_type: tokenData.token_type || null,
        scope: tokenData.scope || null,
        instance_url: tokenData.instance_url || null,
        expires_at: tokenData.expires_at || null,
        status: 'active',
        last_refreshed_at: new Date().toISOString(),
        metadata: tokenData.metadata || {},
      }),
    });

    if (!upsertRes.ok) {
      const upsertBody = await upsertRes.text();
      throw new Error(`Failed to store OAuth tokens: ${upsertBody}`);
    }

    // Update profile crm_config with active provider state (no token leakage in profile).
    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=id,crm_config&id=eq.${encodeURIComponent(userId)}&limit=1`,
      { headers: serviceHeaders(serviceRoleKey) },
    );

    const profileRows = await profileRes.json().catch(() => []);
    const profile = Array.isArray(profileRows) ? profileRows[0] : null;

    if (profile?.id) {
      const nextConfig = mergeCrmConfig((profile.crm_config as Record<string, unknown>) || {}, provider);
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: serviceHeaders(serviceRoleKey),
        body: JSON.stringify({ crm_config: nextConfig }),
      });
    }

    // Consume state
    await fetch(`${supabaseUrl}/rest/v1/crm_oauth_states?state=eq.${encodeURIComponent(state)}`, {
      method: 'DELETE',
      headers: serviceHeaders(serviceRoleKey),
    });

    return Response.redirect(redirectTo, 302);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('crmOAuthCallback error:', message);
    const redirect = `${APP_BASE_URL}/CRMSettings?oauth=error&message=${encodeURIComponent(message)}`;
    return Response.redirect(redirect, 302);
  }
});

export {};
