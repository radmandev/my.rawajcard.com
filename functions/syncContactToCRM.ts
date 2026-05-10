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

const getProviderEnabledMap = async (supabaseUrl: string, headers: Record<string, string>) => {
  const defaults: Record<string, boolean> = {
    salesforce: crmIntegrationsEnabled,
    hubspot: crmIntegrationsEnabled,
    zoho: crmIntegrationsEnabled,
    bitrix24: crmIntegrationsEnabled,
  };

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/app_settings?select=value&key=eq.crm_provider_flags&limit=1`,
      { headers },
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

const mapFields = (data: Record<string, unknown>, mapping: Record<string, unknown>) => {
  const mapped: Record<string, unknown> = {};
  for (const [cardField, crmField] of Object.entries(mapping || {})) {
    const key = String(crmField || '').trim();
    if (!key) continue;
    const value = data[cardField];
    if (value !== undefined && value !== null && value !== '') {
      mapped[key] = value;
    }
  }
  return mapped;
};

const ownerFromEmail = async (supabaseUrl: string, headers: Record<string, string>, email: string) => {
  const encoded = encodeURIComponent(email);

  const loadFrom = async (table: string) => {
    const url = `${supabaseUrl}/rest/v1/${table}?select=id,email,crm_config,crm_webhook_url&email=eq.${encoded}&limit=1`;
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const rows = await res.json() as Array<Record<string, unknown>>;
    return rows?.[0] || null;
  };

  return (await loadFrom('profiles')) || (await loadFrom('users'));
};

const getOAuthConnection = async (supabaseUrl: string, headers: Record<string, string>, userId: string, provider: string) => {
  if (!userId || !provider) return null;

  const url = `${supabaseUrl}/rest/v1/crm_oauth_connections?select=provider,access_token,refresh_token,token_type,scope,instance_url,expires_at,status,metadata&user_id=eq.${encodeURIComponent(userId)}&provider=eq.${encodeURIComponent(provider)}&status=eq.active&limit=1`;
  const res = await fetch(url, { headers });
  if (!res.ok) return null;
  const rows = await res.json() as Array<Record<string, unknown>>;
  return rows?.[0] || null;
};

const withOAuthCredentials = (crmConfig: Record<string, unknown>, oauthConnection: Record<string, unknown> | null) => {
  if (!oauthConnection) return crmConfig;

  const apiCredentials = {
    ...(((crmConfig.api_credentials as Record<string, unknown>) || {})),
    access_token: oauthConnection.access_token || '',
    refresh_token: oauthConnection.refresh_token || '',
    token_type: oauthConnection.token_type || '',
    scope: oauthConnection.scope || '',
    instance_url: oauthConnection.instance_url || '',
    expires_at: oauthConnection.expires_at || '',
  };

  return {
    ...crmConfig,
    api_credentials: apiCredentials,
  };
};

const syncToSalesforce = async (crmConfig: Record<string, unknown>, mappedData: Record<string, unknown>, originalData: Record<string, unknown>) => {
  const creds = (crmConfig.api_credentials as Record<string, unknown>) || {};
  const accessToken = String(creds.access_token || '');
  const instanceUrl = String(creds.instance_url || Deno.env.get('SALESFORCE_INSTANCE_URL') || 'https://login.salesforce.com');

  if (!accessToken) {
    throw new Error('Salesforce access token is not configured.');
  }

  const fullName = String(mappedData.name || originalData.visitor_name || originalData.name || '');
  const first = fullName.split(' ')[0] || '';
  const last = fullName.split(' ').slice(1).join(' ') || 'Contact';

  const leadData = {
    FirstName: first,
    LastName: last,
    Email: String(mappedData.email || originalData.visitor_email || originalData.email || ''),
    Phone: String(mappedData.phone || originalData.visitor_phone || originalData.phone || ''),
    Company: String(mappedData.company || originalData.visitor_company || originalData.company || 'Unknown'),
    Description: String(mappedData.notes || originalData.notes || originalData.message || `Contact from Rawajcard - Card ID: ${String(originalData.card_id || '')}`),
    LeadSource: 'Rawajcard',
    Status: 'Open - Not Contacted',
  };

  const response = await fetch(`${instanceUrl.replace(/\/$/, '')}/services/data/v58.0/sobjects/Lead`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadData),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = Array.isArray(result) ? result[0]?.message : result?.message;
    throw new Error(`Salesforce API error: ${msg || 'Unknown error'}`);
  }

  return result;
};

const syncToHubSpot = async (crmConfig: Record<string, unknown>, mappedData: Record<string, unknown>, originalData: Record<string, unknown>) => {
  const creds = (crmConfig.api_credentials as Record<string, unknown>) || {};
  const accessToken = String(creds.access_token || '');

  if (!accessToken) {
    throw new Error('HubSpot access token is not configured.');
  }

  const fullName = String(mappedData.name || originalData.visitor_name || originalData.name || '');
  const first = fullName.split(' ')[0] || '';
  const last = fullName.split(' ').slice(1).join(' ') || 'Contact';

  const contactPayload = {
    properties: {
      firstname: first,
      lastname: last,
      email: String(mappedData.email || originalData.visitor_email || originalData.email || ''),
      phone: String(mappedData.phone || originalData.visitor_phone || originalData.phone || ''),
      company: String(mappedData.company || originalData.visitor_company || originalData.company || ''),
      notes: String(mappedData.notes || originalData.notes || originalData.message || ''),
      hs_lead_status: 'NEW',
      lifecyclestage: 'lead',
    },
  };

  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contactPayload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`HubSpot API error: ${String(result?.message || 'Unknown error')}`);
  }

  return result;
};

const syncToZoho = async (crmConfig: Record<string, unknown>, mappedData: Record<string, unknown>, originalData: Record<string, unknown>) => {
  const creds = (crmConfig.api_credentials as Record<string, unknown>) || {};
  const token = String(creds.access_token || creds.api_key || '');

  if (!token) {
    throw new Error('Zoho CRM credentials not configured');
  }

  const fullName = String(mappedData.name || originalData.visitor_name || originalData.name || '');
  const first = fullName.split(' ')[0] || '';
  const last = fullName.split(' ').slice(1).join(' ') || 'Contact';

  const leadData = {
    data: [{
      First_Name: first,
      Last_Name: last,
      Email: String(mappedData.email || originalData.visitor_email || originalData.email || ''),
      Phone: String(mappedData.phone || originalData.visitor_phone || originalData.phone || ''),
      Company: String(mappedData.company || originalData.visitor_company || originalData.company || ''),
      Description: String(mappedData.notes || originalData.notes || originalData.message || ''),
      Lead_Source: 'Rawajcard',
      Lead_Status: 'Not Contacted',
    }],
  };

  const response = await fetch('https://www.zohoapis.com/crm/v3/Leads', {
    method: 'POST',
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadData),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Zoho API error: ${String(result?.message || 'Unknown error')}`);
  }

  return result;
};

const syncViaWebhook = async (webhookUrl: string, mappedData: Record<string, unknown>, originalData: Record<string, unknown>) => {
  const payload = {
    name: String(mappedData.name || originalData.visitor_name || originalData.name || ''),
    email: String(mappedData.email || originalData.visitor_email || originalData.email || ''),
    phone: String(mappedData.phone || originalData.visitor_phone || originalData.phone || ''),
    company: String(mappedData.company || originalData.visitor_company || originalData.company || ''),
    notes: String(mappedData.notes || originalData.notes || originalData.message || ''),
    source: 'Rawajcard',
    card_id: String(originalData.card_id || ''),
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Webhook API error: ${String(result?.message || 'Request failed')}`);
  return result;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { supabaseUrl, serviceRoleKey } = getServiceEnv();
    const body = await req.json().catch(() => ({}));
    const contactData = (body?.contactData || {}) as Record<string, unknown>;
    const cardOwnerEmail = String(contactData.card_owner || '');

    if (!cardOwnerEmail) {
      return json({ success: false, error: 'Missing contactData.card_owner' }, 400);
    }

    const owner = await ownerFromEmail(supabaseUrl, serviceHeaders(serviceRoleKey), cardOwnerEmail);
    if (!owner) {
      return json({ success: true, message: 'No user record found for contact owner' });
    }

    const baseCrmConfig = (owner.crm_config as Record<string, unknown>) || {};
    const provider = String(baseCrmConfig.provider || '').toLowerCase();
    const providerEnabledMap = await getProviderEnabledMap(supabaseUrl, serviceHeaders(serviceRoleKey));
    if (isProviderTemporarilyDisabled(provider, providerEnabledMap)) {
      return json({ success: false, coming_soon: true, error: `${provider} integration is coming soon` }, 503);
    }

    const oauthConnection = await getOAuthConnection(supabaseUrl, serviceHeaders(serviceRoleKey), String(owner.id || ''), provider);
    const crmConfig = withOAuthCredentials(baseCrmConfig, oauthConnection);
    if (!crmConfig || String(crmConfig.status || '') !== 'active') {
      return json({ success: true, message: 'No active CRM integration' });
    }

    const fieldMapping = (crmConfig.field_mapping as Record<string, unknown>) || {};
    const mappedData = mapFields(contactData, fieldMapping);

    let result: Record<string, unknown> | null = null;

    if (provider === 'salesforce') {
      result = await syncToSalesforce(crmConfig, mappedData, contactData) as Record<string, unknown>;
    } else if (provider === 'hubspot') {
      result = await syncToHubSpot(crmConfig, mappedData, contactData) as Record<string, unknown>;
    } else if (provider === 'zoho') {
      result = await syncToZoho(crmConfig, mappedData, contactData) as Record<string, unknown>;
    } else if (provider === 'bitrix24' || provider === 'custom') {
      const webhookUrl = String((crmConfig.api_credentials as Record<string, unknown> | undefined)?.webhook_url || owner.crm_webhook_url || '');
      if (!webhookUrl) {
        return json({ success: false, error: 'Webhook URL is not configured for this provider.' }, 400);
      }
      result = await syncViaWebhook(webhookUrl, mappedData, contactData) as Record<string, unknown>;
    } else {
      return json({ success: false, error: 'Unsupported CRM provider' }, 400);
    }

    return json({
      success: true,
      message: 'Contact synced to CRM',
      crm_record_id: result?.id || result?.result || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('CRM sync error:', message);
    return json({ success: false, error: message }, 500);
  }
});

export {};