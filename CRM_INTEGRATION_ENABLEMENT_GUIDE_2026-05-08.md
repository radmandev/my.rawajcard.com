# CRM Integration Enablement Guide — 2026-05-08

This note documents how to re-enable Salesforce, HubSpot, Zoho, and Bitrix24 later.

## Current status (temporary hold)

Integrations are feature-gated by:

- Backend edge functions env: `CRM_INTEGRATIONS_ENABLED`
- Frontend env: `VITE_CRM_INTEGRATIONS_ENABLED`

When these are not `true`, the dashboard shows **Soon** and API routes return `coming_soon` for:

- `salesforce`
- `hubspot`
- `zoho`
- `bitrix24`

---

## 1) Supabase steps to prepare

1. Run DB migration:
   - `supabase/migrations/022_crm_oauth.sql`
2. Deploy edge functions:
   - `connectCRM`
   - `crmOAuthCallback`
   - `refreshCRMTokens`
   - `testCRMConnection`
   - `syncContactToCRM`
   - `syncContactsToCRM`
   - `sendContactToCRM`
3. Create edge function secrets:
   - `APP_BASE_URL`
   - `CRM_INTEGRATIONS_ENABLED`
   - `SALESFORCE_CLIENT_ID`
   - `SALESFORCE_CLIENT_SECRET`
   - `SALESFORCE_REDIRECT_URI`
   - `SALESFORCE_SCOPES`
   - `HUBSPOT_CLIENT_ID`
   - `HUBSPOT_CLIENT_SECRET`
   - `HUBSPOT_REDIRECT_URI`
   - `HUBSPOT_SCOPES`
4. Keep `SUPABASE_SERVICE_ROLE_KEY` already configured (required for secure token writes).

---

## 2) Provider app setup (one app per provider)

Use one app-level OAuth client per provider. Each user then authorizes their own CRM account.

### Salesforce (Connected App)

- Callback URL:
  - `https://<project-ref>.supabase.co/functions/v1/crmOAuthCallback`
- Collect:
  - Consumer Key -> `SALESFORCE_CLIENT_ID`
  - Consumer Secret -> `SALESFORCE_CLIENT_SECRET`
- Scopes (minimum):
  - `api refresh_token`

### HubSpot (Public App)

- Redirect URL:
  - `https://<project-ref>.supabase.co/functions/v1/crmOAuthCallback`
- Collect:
  - Client ID -> `HUBSPOT_CLIENT_ID`
  - Client Secret -> `HUBSPOT_CLIENT_SECRET`
- Scopes (minimum):
  - `crm.objects.contacts.read crm.objects.contacts.write oauth`

### Zoho / Bitrix24 (later)

- Current code path is intentionally gated.
- When re-activating, decide final auth mode:
  - OAuth flow, or
  - webhook/API key mode
- Then add required secrets and callback setup before enabling the flag.

---

## 3) Frontend environment

Set in web app env:

- `VITE_CRM_INTEGRATIONS_ENABLED=true` (when ready)

Current hold value:

- `VITE_CRM_INTEGRATIONS_ENABLED=false`

---

## 4) Re-enable rollout checklist

1. Set backend flag:
   - `CRM_INTEGRATIONS_ENABLED=true`
2. Set frontend flag:
   - `VITE_CRM_INTEGRATIONS_ENABLED=true`
3. Confirm provider callback/redirect URL is configured in Salesforce and HubSpot.
4. Schedule token refresh worker every 5–10 min:
   - invoke `refreshCRMTokens`
5. Test in order:
   - connect -> callback success
   - test connection
   - single contact sync
   - bulk sync
6. Monitor logs for 24–48h.

---

## 5) Security notes

- Do not store OAuth secrets in frontend env vars.
- Keep access/refresh tokens in `crm_oauth_connections` only.
- `profiles.crm_config` should contain non-secret integration metadata only.
- Rotate provider client secrets periodically and after personnel changes.
