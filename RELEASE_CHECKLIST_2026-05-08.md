# Release Checklist — 2026-05-08

## 1) Pre-deploy

- [ ] Confirm branch is up to date and build is green.
- [ ] Confirm lint is green.
- [ ] Confirm migrations are committed:
  - [ ] `022_crm_oauth.sql` applied in target Supabase project.

## 2) Supabase Edge Function secrets

Set these in Supabase project secrets:

- [ ] `APP_BASE_URL`
- [ ] `CRM_INTEGRATIONS_ENABLED`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SALESFORCE_CLIENT_ID`
- [ ] `SALESFORCE_CLIENT_SECRET`
- [ ] `SALESFORCE_REDIRECT_URI`
- [ ] `SALESFORCE_SCOPES`
- [ ] `HUBSPOT_CLIENT_ID`
- [ ] `HUBSPOT_CLIENT_SECRET`
- [ ] `HUBSPOT_REDIRECT_URI`
- [ ] `HUBSPOT_SCOPES`

## 3) Frontend env

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_PUBLIC_BASE_PATH`
- [ ] `VITE_CRM_INTEGRATIONS_ENABLED`

## 4) Deploy functions

Deploy/verify these functions are active:

- [ ] `connectCRM`
- [ ] `crmOAuthCallback`
- [ ] `refreshCRMTokens`
- [ ] `testCRMConnection`
- [ ] `syncContactToCRM`
- [ ] `syncContactsToCRM`
- [ ] `sendContactToCRM`
- [ ] `trackQRScan`

## 5) Provider app settings

### Salesforce
- [ ] Connected App callback URL:
  - `https://<project-ref>.supabase.co/functions/v1/crmOAuthCallback`
- [ ] Scopes include `api` + `refresh_token`

### HubSpot
- [ ] App redirect URL:
  - `https://<project-ref>.supabase.co/functions/v1/crmOAuthCallback`
- [ ] Scopes include contacts read/write

## 6) Admin platform controls

In app admin CRM controls:

- [ ] Enable only desired providers (Salesforce/HubSpot/Zoho/Bitrix24)
- [ ] Save `crm_provider_flags`
- [ ] Verify user-facing "Soon" badges match admin settings

## 7) Scheduler

- [ ] Schedule `refreshCRMTokens` every 5–10 minutes
- [ ] Verify first execution succeeds (no token refresh errors)

## 8) Post-deploy smoke tests

### CRM
- [ ] Connect CRM (OAuth redirect + callback success)
- [ ] Test CRM connection from dashboard
- [ ] Single contact sync succeeds
- [ ] Bulk contact sync succeeds
- [ ] Disabled provider returns `coming_soon`

### QR + tracking
- [ ] Public card slug opens correctly
- [ ] QR scan inserts card view
- [ ] `scan_count` increments

### General
- [ ] Login/logout works
- [ ] Dashboard loads
- [ ] Checkout flow unaffected

## 9) Monitoring (7 days)

- [ ] Check function logs daily for:
  - OAuth callback errors
  - Token refresh failures
  - CRM sync failures
  - QR tracking errors
- [ ] Track error rate trend and capture recurring provider-specific issues

## 10) Rollback plan

- [ ] Disable CRM providers via admin controls if needed
- [ ] Set `CRM_INTEGRATIONS_ENABLED=false` to globally pause gated providers
- [ ] Redeploy previous known-good commit if critical flow breaks

## References

- `BASE44_DEPENDENCY_AUDIT_2026-05-08.md`
- `CRM_INTEGRATION_ENABLEMENT_GUIDE_2026-05-08.md`
