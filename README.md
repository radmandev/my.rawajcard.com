# Rawajcard — Frontend App

Supabase-native web application for Rawajcard.

## Prerequisites

- Node.js 18.18+
- npm

## Local development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` and set required values:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PUBLIC_BASE_PATH=/

# Optional frontend CRM flag (admin can also override per provider in app_settings)
VITE_CRM_INTEGRATIONS_ENABLED=false
```

3. Start development server:

```bash
npm run dev
```

## Build

```bash
npm run build
```

## CRM notes

- Runtime CRM provider availability is controlled by:
	- Edge function env: `CRM_INTEGRATIONS_ENABLED`
	- Frontend env: `VITE_CRM_INTEGRATIONS_ENABLED`
	- Admin per-provider overrides in `app_settings.crm_provider_flags`
- See `CRM_INTEGRATION_ENABLEMENT_GUIDE_2026-05-08.md` for full rollout steps.
