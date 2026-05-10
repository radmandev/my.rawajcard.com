declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: corsHeaders });

const gatedProviders = new Set(['salesforce', 'hubspot', 'zoho', 'bitrix24']);
const crmIntegrationsEnabled = String(Deno.env.get('CRM_INTEGRATIONS_ENABLED') || '').toLowerCase() === 'true';

const getProviderEnabledMap = async (supabaseUrl: string, srvHeaders: Record<string, string>) => {
  const defaults: Record<string, boolean> = {
    salesforce: crmIntegrationsEnabled,
    hubspot: crmIntegrationsEnabled,
    zoho: crmIntegrationsEnabled,
    bitrix24: crmIntegrationsEnabled,
  };

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/app_settings?select=value&key=eq.crm_provider_flags&limit=1`,
      { headers: srvHeaders },
    );
    if (!response.ok) return defaults;
    const rows = await response.json().catch(() => []);
    const value = (Array.isArray(rows) ? rows?.[0]?.value : null) as Record<string, unknown> | null;
    if (!value || typeof value !== 'object') return defaults;

    return {
      ...defaults,
      salesforce: typeof value.salesforce === 'boolean' ? value.salesforce : defaults.salesforce,
      hubspot: typeof value.hubspot === 'boolean' ? value.hubspot : defaults.hubspot,
      zoho: typeof value.zoho === 'boolean' ? value.zoho : defaults.zoho,
      bitrix24: typeof value.bitrix24 === 'boolean' ? value.bitrix24 : defaults.bitrix24,
    };
  } catch {
    return defaults;
  }
};

const isProviderTemporarilyDisabled = (provider: string, enabledMap: Record<string, boolean>) =>
  gatedProviders.has(provider) && !Boolean(enabledMap[provider]);

const getEnv = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl) throw new Error('SUPABASE_URL is not configured.');
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured.');

  return { supabaseUrl, serviceRoleKey, supabaseAnonKey };
};

const serviceHeaders = (serviceRoleKey: string) => ({
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
});

const getAuthUser = async (req: Request) => {
  const { supabaseUrl, serviceRoleKey, supabaseAnonKey } = getEnv();
  const authHeader = req.headers.get('Authorization') ?? '';

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: missing bearer token.');
  }

  const apikey = supabaseAnonKey || serviceRoleKey;
  const jwt = authHeader.replace('Bearer ', '').trim();

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey,
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!userRes.ok) {
    throw new Error('Unauthorized: invalid or expired session token.');
  }

  const authUser = await userRes.json() as Record<string, unknown>;
  return {
    id: String(authUser.id || ''),
    email: String(authUser.email || ''),
  };
};

const fetchOwnerConfig = async (supabaseUrl: string, srvHeaders: Record<string, string>, user: { id: string; email: string }) => {
  const tryTable = async (table: string) => {
    if (user.id) {
      const byIdUrl = `${supabaseUrl}/rest/v1/${table}?select=id,email,crm_config,crm_webhook_url&id=eq.${encodeURIComponent(user.id)}&limit=1`;
      const byIdRes = await fetch(byIdUrl, { headers: srvHeaders });
      if (byIdRes.ok) {
        const rows = await byIdRes.json() as Array<Record<string, unknown>>;
        if (rows?.[0]) return rows[0];
      }
    }

    if (user.email) {
      const byEmailUrl = `${supabaseUrl}/rest/v1/${table}?select=id,email,crm_config,crm_webhook_url&email=eq.${encodeURIComponent(user.email)}&limit=1`;
      const byEmailRes = await fetch(byEmailUrl, { headers: srvHeaders });
      if (byEmailRes.ok) {
        const rows = await byEmailRes.json() as Array<Record<string, unknown>>;
        if (rows?.[0]) return rows[0];
      }
    }

    return null;
  };

  return (await tryTable('profiles')) || (await tryTable('users'));
};

const fetchOAuthConnection = async (supabaseUrl: string, srvHeaders: Record<string, string>, userId: string, provider: string) => {
  if (!userId || !provider) return null;

  const response = await fetch(
    `${supabaseUrl}/rest/v1/crm_oauth_connections?select=provider,access_token,refresh_token,token_type,scope,instance_url,expires_at,status,metadata&user_id=eq.${encodeURIComponent(userId)}&provider=eq.${encodeURIComponent(provider)}&status=eq.active&limit=1`,
    { headers: srvHeaders },
  );

  if (!response.ok) return null;
  const rows = await response.json() as Array<Record<string, unknown>>;
  return rows?.[0] || null;
};

const mergeOAuthCredentials = (crmConfig: Record<string, unknown>, oauthConnection: Record<string, unknown> | null) => {
  if (!oauthConnection) return crmConfig;

  return {
    ...crmConfig,
    api_credentials: {
      ...(((crmConfig.api_credentials as Record<string, unknown>) || {})),
      access_token: oauthConnection.access_token || '',
      refresh_token: oauthConnection.refresh_token || '',
      token_type: oauthConnection.token_type || '',
      scope: oauthConnection.scope || '',
      instance_url: oauthConnection.instance_url || '',
      expires_at: oauthConnection.expires_at || '',
    },
  };
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { supabaseUrl, serviceRoleKey } = getEnv();
    const user = await getAuthUser(req);
    const body = await req.json().catch(() => ({}));
    const crmTypeRaw = String(body?.crm_type || '').toLowerCase();

    const owner = await fetchOwnerConfig(supabaseUrl, serviceHeaders(serviceRoleKey), user);
    const baseCrmConfig = (owner?.crm_config as Record<string, unknown>) || {};
    const provider = crmTypeRaw || String(baseCrmConfig.provider || '').toLowerCase();
    const providerEnabledMap = await getProviderEnabledMap(supabaseUrl, serviceHeaders(serviceRoleKey));

    if (isProviderTemporarilyDisabled(provider, providerEnabledMap)) {
      return json({ success: false, coming_soon: true, message: `${provider} integration is coming soon` }, 503);
    }

    const oauthConnection = await fetchOAuthConnection(supabaseUrl, serviceHeaders(serviceRoleKey), String(owner?.id || ''), provider);
    const crmConfig = mergeOAuthCredentials(baseCrmConfig, oauthConnection);
    const apiCredentials = (crmConfig.api_credentials as Record<string, unknown>) || {};

    if (!provider) {
      return json({ success: false, message: 'CRM provider is not configured.' }, 400);
    }

    if (provider === 'salesforce') {
      const accessToken = String(apiCredentials.access_token || '');
      const instanceUrl = String(apiCredentials.instance_url || Deno.env.get('SALESFORCE_INSTANCE_URL') || 'https://login.salesforce.com');
      if (!accessToken) {
        return json({ success: false, message: 'Salesforce access token is not configured.' }, 400);
      }

      const response = await fetch(`${instanceUrl.replace(/\/$/, '')}/services/data/v58.0/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return json({
        success: response.ok,
        message: response.ok ? 'Connected to Salesforce' : 'Salesforce connection failed',
      });
    }

    if (provider === 'hubspot') {
      const accessToken = String(apiCredentials.access_token || '');
      if (!accessToken) {
        return json({ success: false, message: 'HubSpot access token is not configured.' }, 400);
      }

      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return json({
        success: response.ok,
        message: response.ok ? 'Connected to HubSpot' : 'HubSpot connection failed',
      });
    }

    if (provider === 'zoho') {
      const token = String(apiCredentials.access_token || apiCredentials.api_key || '');
      if (!token) {
        return json({ success: false, message: 'Zoho credentials are not configured.' }, 400);
      }

      const response = await fetch('https://www.zohoapis.com/crm/v3/Leads?per_page=1', {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });

      return json({
        success: response.ok,
        message: response.ok ? 'Connected to Zoho CRM' : 'Zoho CRM connection failed',
      });
    }

    if (provider === 'bitrix24' || provider === 'custom') {
      const webhook = String(apiCredentials.webhook_url || owner?.crm_webhook_url || '');
      if (!webhook) {
        return json({ success: false, message: 'Webhook URL is not configured.' }, 400);
      }

      const probe = await fetch(webhook, { method: 'GET' });
      return json({
        success: probe.ok,
        message: probe.ok ? 'Webhook endpoint is reachable' : 'Webhook endpoint is not reachable',
      });
    }

    return json({ success: false, message: 'Unsupported CRM provider' }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Connection test error:', message);
    return json({ success: false, message }, 500);
  }
});

export {};