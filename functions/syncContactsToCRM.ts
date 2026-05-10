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

  const user = await userRes.json() as Record<string, unknown>;
  return {
    id: String(user.id || ''),
    email: String(user.email || ''),
  };
};

const fetchOwner = async (supabaseUrl: string, headers: Record<string, string>, email: string) => {
  const encodedEmail = encodeURIComponent(email);

  const tryTable = async (table: string) => {
    const url = `${supabaseUrl}/rest/v1/${table}?select=id,email,crm_config,crm_webhook_url&email=eq.${encodedEmail}&limit=1`;
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const rows = await res.json() as Array<Record<string, unknown>>;
    return rows?.[0] || null;
  };

  return (await tryTable('profiles')) || (await tryTable('users'));
};

const fetchContacts = async (supabaseUrl: string, headers: Record<string, string>, email: string) => {
  const encodedEmail = encodeURIComponent(email);
  const url = `${supabaseUrl}/rest/v1/contact_submissions?select=*&card_owner=eq.${encodedEmail}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to fetch contacts: ${body}`);
  }
  const rows = await res.json() as Array<Record<string, unknown>>;
  return Array.isArray(rows) ? rows : [];
};

const mapFields = (data: Record<string, unknown>, mapping: Record<string, unknown>) => {
  const mapped: Record<string, unknown> = {};
  for (const [cardField, crmField] of Object.entries(mapping || {})) {
    const key = String(crmField || '').trim();
    if (!key) continue;
    const value = data[cardField];
    if (value !== undefined && value !== null && value !== '') mapped[key] = value;
  }
  return mapped;
};

const syncOne = async (crmConfig: Record<string, unknown>, owner: Record<string, unknown>, contact: Record<string, unknown>) => {
  const provider = String(crmConfig.provider || '').toLowerCase();
  const credentials = (crmConfig.api_credentials as Record<string, unknown>) || {};
  const fieldMapping = (crmConfig.field_mapping as Record<string, unknown>) || {};
  const mapped = mapFields(contact, fieldMapping);

  const fullName = String(mapped.name || contact.visitor_name || contact.name || '');
  const firstName = fullName.split(' ')[0] || '';
  const lastName = fullName.split(' ').slice(1).join(' ') || 'Contact';
  const email = String(mapped.email || contact.visitor_email || contact.email || '');
  const phone = String(mapped.phone || contact.visitor_phone || contact.phone || '');
  const company = String(mapped.company || contact.visitor_company || contact.company || '');
  const notes = String(mapped.notes || contact.notes || contact.message || '');

  if (provider === 'salesforce') {
    const accessToken = String(credentials.access_token || '');
    const instanceUrl = String(credentials.instance_url || Deno.env.get('SALESFORCE_INSTANCE_URL') || 'https://login.salesforce.com');
    if (!accessToken) throw new Error('Salesforce access token is not configured.');

    const res = await fetch(`${instanceUrl.replace(/\/$/, '')}/services/data/v58.0/sobjects/Lead`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
        Company: company || 'Unknown',
        Description: notes,
        LeadSource: 'Rawajcard',
        Status: 'Open - Not Contacted',
      }),
    });
    if (!res.ok) throw new Error(`Salesforce sync failed (${res.status})`);
    return;
  }

  if (provider === 'hubspot') {
    const accessToken = String(credentials.access_token || '');
    if (!accessToken) throw new Error('HubSpot access token is not configured.');

    const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          firstname: firstName,
          lastname: lastName,
          email,
          phone,
          company,
          notes,
          hs_lead_status: 'NEW',
        },
      }),
    });
    if (!res.ok) throw new Error(`HubSpot sync failed (${res.status})`);
    return;
  }

  if (provider === 'zoho') {
    const token = String(credentials.access_token || credentials.api_key || '');
    if (!token) throw new Error('Zoho credentials are not configured.');

    const res = await fetch('https://www.zohoapis.com/crm/v3/Leads', {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [{
          First_Name: firstName,
          Last_Name: lastName,
          Email: email,
          Phone: phone,
          Company: company,
          Description: notes,
          Lead_Source: 'Rawajcard',
        }],
      }),
    });
    if (!res.ok) throw new Error(`Zoho sync failed (${res.status})`);
    return;
  }

  if (provider === 'bitrix24' || provider === 'custom') {
    const webhookUrl = String(credentials.webhook_url || owner.crm_webhook_url || '');
    if (!webhookUrl) throw new Error('Webhook URL is not configured.');

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fullName,
        email,
        phone,
        company,
        notes,
        source: 'Rawajcard',
        card_id: String(contact.card_id || ''),
      }),
    });
    if (!res.ok) throw new Error(`Webhook sync failed (${res.status})`);
    return;
  }

  throw new Error('Unsupported CRM provider');
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { supabaseUrl, serviceRoleKey } = getEnv();
    const user = await getAuthUser(req);

    if (!user.email) {
      return json({ success: false, message: 'User email not found' }, 400);
    }

    const owner = await fetchOwner(supabaseUrl, serviceHeaders(serviceRoleKey), user.email);
    const crmConfig = (owner?.crm_config as Record<string, unknown>) || null;
    const provider = String(crmConfig?.provider || '').toLowerCase();
    const providerEnabledMap = await getProviderEnabledMap(supabaseUrl, serviceHeaders(serviceRoleKey));

    if (!crmConfig || String(crmConfig.status || '') !== 'active') {
      return json({ success: false, message: 'No active CRM integration' }, 400);
    }

    if (isProviderTemporarilyDisabled(provider, providerEnabledMap)) {
      return json({ success: false, coming_soon: true, message: `${provider} integration is coming soon` }, 503);
    }

    const contacts = await fetchContacts(supabaseUrl, serviceHeaders(serviceRoleKey), user.email);
    let synced = 0;
    let failed = 0;

    for (const contact of contacts) {
      try {
        await syncOne(crmConfig, owner || {}, contact);
        synced++;
      } catch (error) {
        console.error(`Failed to sync contact ${String(contact.id || '')}:`, error);
        failed++;
      }
    }

    return json({
      success: true,
      message: `Synced ${synced} contacts, ${failed} failed`,
      synced_count: synced,
      failed_count: failed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Bulk sync error:', message);
    return json({ success: false, error: message }, 500);
  }
});