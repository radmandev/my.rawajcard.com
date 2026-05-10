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

const getAuthUser = async (req: Request) => {
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: missing bearer token.');
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl) throw new Error('SUPABASE_URL is not configured.');
  const apikey = supabaseAnonKey || serviceRoleKey;
  if (!apikey) throw new Error('SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) is not configured.');

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

  const user = await userRes.json() as Record<string, unknown>;
  return {
    id: String(user.id || ''),
    email: String(user.email || ''),
  };
};

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
});

const getProviderEnabledMap = async () => {
  const defaults: Record<string, boolean> = {
    salesforce: crmIntegrationsEnabled,
    hubspot: crmIntegrationsEnabled,
    zoho: crmIntegrationsEnabled,
    bitrix24: crmIntegrationsEnabled,
  };

  try {
    const { supabaseUrl, serviceRoleKey } = getServiceEnv();
    const response = await fetch(
      `${supabaseUrl}/rest/v1/app_settings?select=value&key=eq.crm_provider_flags&limit=1`,
      { headers: serviceHeaders(serviceRoleKey) },
    );

    if (!response.ok) return defaults;
    const rows = await response.json().catch(() => []);
    const raw = Array.isArray(rows) ? rows?.[0]?.value : null;
    if (!raw || typeof raw !== 'object') return defaults;

    return {
      ...defaults,
      salesforce: typeof raw.salesforce === 'boolean' ? raw.salesforce : defaults.salesforce,
      hubspot: typeof raw.hubspot === 'boolean' ? raw.hubspot : defaults.hubspot,
      zoho: typeof raw.zoho === 'boolean' ? raw.zoho : defaults.zoho,
      bitrix24: typeof raw.bitrix24 === 'boolean' ? raw.bitrix24 : defaults.bitrix24,
    };
  } catch {
    return defaults;
  }
};

const isProviderTemporarilyDisabled = (provider: string, enabledMap: Record<string, boolean>) =>
  gatedProviders.has(provider) && !Boolean(enabledMap[provider]);

const saveOAuthState = async (provider: 'salesforce' | 'hubspot', state: string, userId: string) => {
  const { supabaseUrl, serviceRoleKey } = getServiceEnv();
  const appBaseUrl = Deno.env.get('APP_BASE_URL') || 'https://rawajcard.com';
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const res = await fetch(`${supabaseUrl}/rest/v1/crm_oauth_states`, {
    method: 'POST',
    headers: {
      ...serviceHeaders(serviceRoleKey),
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      state,
      user_id: userId,
      provider,
      expires_at: expiresAt,
      redirect_to: `${appBaseUrl}/CRMSettings?oauth=success&provider=${provider}`,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to persist OAuth state: ${body}`);
  }
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const user = await getAuthUser(req);
    if (!user.id) {
      return json({ success: false, error: 'Unauthorized' }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const crmType = String(body?.crm_type || '').toLowerCase();
    const enabledMap = await getProviderEnabledMap();

    if (isProviderTemporarilyDisabled(crmType, enabledMap)) {
      return json({
        success: false,
        coming_soon: true,
        message: `${crmType} integration is coming soon`,
      }, 503);
    }

    const state = crypto.randomUUID();

    if (crmType === 'salesforce') {
      await saveOAuthState('salesforce', state, user.id);

      const clientId = Deno.env.get('SALESFORCE_CLIENT_ID');
      const redirectUri = Deno.env.get('SALESFORCE_REDIRECT_URI');
      const scope = Deno.env.get('SALESFORCE_SCOPES') || 'api refresh_token';

      if (!clientId || !redirectUri) {
        return json({
          success: true,
          requires_manual_setup: true,
          message: 'Salesforce OAuth env vars are missing. Configure SALESFORCE_CLIENT_ID and SALESFORCE_REDIRECT_URI.',
        });
      }

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope,
        state,
        prompt: 'login',
      });

      return json({
        success: true,
        auth_url: `https://login.salesforce.com/services/oauth2/authorize?${params.toString()}`,
        state,
        user_id: user.id,
        message: 'Redirecting to Salesforce authorization...',
      });
    }

    if (crmType === 'hubspot') {
      await saveOAuthState('hubspot', state, user.id);

      const clientId = Deno.env.get('HUBSPOT_CLIENT_ID');
      const redirectUri = Deno.env.get('HUBSPOT_REDIRECT_URI');
      const scope = Deno.env.get('HUBSPOT_SCOPES') || 'crm.objects.contacts.read crm.objects.contacts.write oauth';

      if (!clientId || !redirectUri) {
        return json({
          success: true,
          requires_manual_setup: true,
          message: 'HubSpot OAuth env vars are missing. Configure HUBSPOT_CLIENT_ID and HUBSPOT_REDIRECT_URI.',
        });
      }

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope,
        state,
      });

      return json({
        success: true,
        auth_url: `https://app.hubspot.com/oauth/authorize?${params.toString()}`,
        state,
        user_id: user.id,
        message: 'Redirecting to HubSpot authorization...',
      });
    }

    if (crmType === 'zoho' || crmType === 'bitrix24' || crmType === 'custom') {
      return json({
        success: true,
        requires_api_key: true,
        message: 'Please provide your CRM API credentials in CRM settings.',
      });
    }

    return json({ success: false, error: 'Unsupported CRM type' }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('CRM connection error:', message);
    return json({ success: false, error: message }, 500);
  }
});

export {};