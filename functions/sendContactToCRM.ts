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

const getServiceHeaders = (serviceRoleKey: string) => ({
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
});

const getOwnerRecord = async (supabaseUrl: string, headers: Record<string, string>, cardOwnerEmail: string) => {
  const emailFilter = encodeURIComponent(cardOwnerEmail);

  const loadFrom = async (table: string) => {
    const url = `${supabaseUrl}/rest/v1/${table}?select=id,email,crm_webhook_url,crm_config&email=eq.${emailFilter}&limit=1`;
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    const rows = await res.json() as Array<Record<string, unknown>>;
    return rows?.[0] || null;
  };

  return (await loadFrom('profiles')) || (await loadFrom('users'));
};

const normalizeContact = (contactData: Record<string, unknown>) => {
  const fullName = String(contactData.visitor_name || contactData.name || '');
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || 'Contact';

  return {
    fullName,
    firstName,
    lastName,
    email: String(contactData.visitor_email || contactData.email || ''),
    phone: String(contactData.visitor_phone || contactData.phone || ''),
    company: String(contactData.visitor_company || contactData.company || ''),
    notes: String(contactData.notes || contactData.message || ''),
    cardId: String(contactData.card_id || ''),
    createdAt: String(contactData.created_date || contactData.created_at || new Date().toISOString()),
  };
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { supabaseUrl, serviceRoleKey } = getServiceEnv();
    const body = await req.json().catch(() => ({}));
    const contactData = (body?.contactData || {}) as Record<string, unknown>;
    const cardOwner = String(contactData.card_owner || '');

    if (!cardOwner) {
      return json({ success: false, error: 'Missing contactData.card_owner' }, 400);
    }

    const owner = await getOwnerRecord(supabaseUrl, getServiceHeaders(serviceRoleKey), cardOwner);
    if (!owner) {
      return json({ success: true, message: 'No owner record found; skipping CRM send.' });
    }

    const crmConfig = (owner.crm_config as Record<string, unknown>) || {};
    const provider = String(crmConfig.provider || '').toLowerCase();
    const providerEnabledMap = await getProviderEnabledMap(supabaseUrl, getServiceHeaders(serviceRoleKey));
    if (isProviderTemporarilyDisabled(provider, providerEnabledMap)) {
      return json({ success: false, coming_soon: true, message: `${provider} integration is coming soon` }, 503);
    }

    const webhookFromConfig = String((crmConfig.api_credentials as Record<string, unknown> | undefined)?.webhook_url || '');
    const webhookUrl = String(owner.crm_webhook_url || webhookFromConfig || '');

    if (!webhookUrl) {
      return json({ success: true, message: 'No webhook configured' });
    }

    const mapped = normalizeContact(contactData);
    let payload: Record<string, unknown>;
    let url = webhookUrl;

    if (webhookUrl.includes('bitrix24.com')) {
      payload = {
        fields: {
          TITLE: `New contact: ${mapped.fullName || mapped.email || 'Visitor'}`,
          NAME: mapped.firstName || mapped.fullName,
          LAST_NAME: mapped.lastName,
          EMAIL: mapped.email ? [{ VALUE: mapped.email, VALUE_TYPE: 'WORK' }] : undefined,
          PHONE: mapped.phone ? [{ VALUE: mapped.phone, VALUE_TYPE: 'WORK' }] : undefined,
          COMPANY_TITLE: mapped.company || undefined,
          COMMENTS: mapped.notes || `Contact from Rawajcard - Card ID: ${mapped.cardId}`,
          SOURCE_ID: 'WEB',
          SOURCE_DESCRIPTION: 'Rawajcard Digital Business Card',
        },
      };

      const params = new URLSearchParams();
      params.append('fields', JSON.stringify(payload.fields));
      const separator = webhookUrl.includes('?') ? '&' : '?';
      url = `${webhookUrl}${separator}${params.toString()}`;

      const response = await fetch(url, { method: 'GET' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.result) {
        return json({
          success: false,
          error: result?.error_description || 'Bitrix24 API error',
          details: result,
        }, 500);
      }

      return json({
        success: true,
        message: 'Contact added to Bitrix24',
        lead_id: result.result,
      });
    }

    if (webhookUrl.includes('pipedrive.com')) {
      payload = {
        name: mapped.fullName,
        email: mapped.email,
        phone: mapped.phone,
        organization_name: mapped.company,
        notes: mapped.notes,
        visible_to: 3,
      };
    } else if (webhookUrl.includes('hubspot.com')) {
      payload = {
        properties: {
          firstname: mapped.firstName,
          lastname: mapped.lastName,
          email: mapped.email,
          phone: mapped.phone,
          company: mapped.company,
          notes: mapped.notes,
          hs_lead_status: 'NEW',
        },
      };
    } else {
      payload = {
        name: mapped.fullName,
        email: mapped.email,
        phone: mapped.phone,
        company: mapped.company,
        notes: mapped.notes,
        source: 'Rawajcard',
        card_id: mapped.cardId,
        created_at: mapped.createdAt,
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let result: unknown;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }

    if (!response.ok) {
      return json({ success: false, error: 'Webhook request failed', details: result }, 500);
    }

    return json({ success: true, message: 'Contact sent to CRM', response: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error sending to CRM:', message);
    return json({ success: false, error: message }, 500);
  }
});