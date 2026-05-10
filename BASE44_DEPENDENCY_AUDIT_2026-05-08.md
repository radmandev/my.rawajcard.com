# Base44 Dependency Audit — 2026-05-08

> Follow-up rollout guide: `CRM_INTEGRATION_ENABLEMENT_GUIDE_2026-05-08.md`

## Phase 1 Execution Status (2026-05-08)

- **Status:** ✅ Executed in codebase
- **Scope completed:** All six Base44-dependent edge functions were migrated off Base44 runtime APIs.

### Updated files
- `functions/connectCRM.ts`
- `functions/testCRMConnection.ts`
- `functions/sendContactToCRM.ts`
- `functions/syncContactToCRM.ts`
- `functions/syncContactsToCRM.ts`
- `functions/trackQRScan.ts`

### What changed
- Removed `@base44/sdk` runtime usage (`createClientFromRequest`, `connectors`, `entities`, `functions.invoke` chaining).
- Replaced auth checks with Supabase JWT verification via `/auth/v1/user`.
- Replaced entity access with Supabase REST calls using `SUPABASE_SERVICE_ROLE_KEY`.
- Replaced QR tracking writes with direct writes to `business_cards` and `card_views`.
- Replaced CRM provider token lookup from Base44 connectors with credentials expected in CRM config/env.

### Post-migration requirement
- CRM OAuth token persistence/refresh must be managed by your own Supabase-backed flow (no Base44 connector fallback remains).

## Phase 2/3 Execution Status (2026-05-08)

- **Status:** ✅ Executed in codebase

### Phase 2 completed (package/tooling)
- Removed Base44 packages from dependency graph:
  - `@base44/sdk`
  - `@base44/vite-plugin`
- Removed Base44 aliasing from Vite configuration.

### Phase 3 completed (legacy compatibility cleanup)
- Archived legacy compatibility files to inert stubs:
  - `src/api/base44Client.js`
  - `src/lib/app-params.js`
  - `src/mocks/base44Sdk.js`
- Kept `src/mocks/axiosClient.js` as a generic helper (no Base44 coupling).

### Remaining from full plan
- Phase 5 production verification window and monitoring.

## Phase 4 Execution Status (2026-05-08)

- **Status:** ✅ Executed in codebase

### Phase 4 completed (docs/branding)
- Replaced Base44 README content with Supabase-native project instructions.
- Renamed npm package identity:
  - `package.json` name: `rawajcard-app`
  - `package-lock.json` name: `rawajcard-app`

### Remaining to close plan
- Phase 5 hard verification:
  - end-to-end workflow checks,
  - production log monitoring window.

## Phase 5 Execution Status (2026-05-08)

- **Status:** ✅ Code-level hard verification completed

### Completed verification checks
- Grep checks in active app code and functions:
  - no `@base44`
  - no `VITE_BASE44`
  - no `base44` platform references in active runtime paths
- Lint passed (`npm run lint`).
- Build passed (`npm run build`).

### Final operational follow-up (manual)
- Monitor production logs for CRM / OAuth / function errors for 7 days.
- Execute live E2E checks in deployed environment:
  - CRM connect path (enabled providers)
  - CRM test connection
  - contact sync and webhook send
  - QR scan tracking flow

## Executive Summary

Yes — your app is **still partially dependent on Base44**.

The dependency is concentrated in:
1. **Edge functions in `functions/`** (runtime dependency; highest risk)
2. **NPM dependencies in `package.json`** (install-time dependency)
3. **Legacy Base44 config/docs/code artifacts** (cleanup-level risk)

---

## Findings with Importance / Emergency

### 1) Base44 SDK used directly in production edge functions
- **Importance:** **Critical**
- **Emergency:** **P0 (Immediate)**
- **Why this is urgent:** CRM flows and QR tracking still call Base44 runtime APIs (`createClientFromRequest`, `asServiceRole.connectors`, `entities`). If Base44 behavior changes or is removed, these flows can fail.
- **Files:**
  - `functions/connectCRM.ts`
  - `functions/testCRMConnection.ts`
  - `functions/sendContactToCRM.ts`
  - `functions/syncContactToCRM.ts`
  - `functions/syncContactsToCRM.ts`
  - `functions/trackQRScan.ts`

### 2) Base44-specific connector usage for OAuth tokens
- **Importance:** **Critical**
- **Emergency:** **P0 (Immediate)**
- **Why this is urgent:** Calls like `base44.asServiceRole.connectors.getAccessToken('salesforce'|'hubspot')` are provider token plumbing owned by Base44.
- **Impact surface:** CRM connect/test/sync paths.
- **Files:**
  - `functions/connectCRM.ts`
  - `functions/testCRMConnection.ts`
  - `functions/syncContactToCRM.ts`

### 3) Base44 packages still installed in frontend project
- **Importance:** **High**
- **Emergency:** **P1 (This sprint)**
- **Why:** `@base44/sdk` and `@base44/vite-plugin` remain in dependencies. Even if not actively imported in `src/`, they keep your build graph and lockfile tied to Base44.
- **Files:**
  - `package.json`
  - `package-lock.json`

### 4) Vite alias for Base44 offline mock path
- **Importance:** **Medium**
- **Emergency:** **P2 (Planned cleanup)**
- **Why:** In offline mode, Vite aliases `@base44/sdk` to local mocks. This is non-production in normal mode, but keeps Base44 naming/coupling in tooling.
- **File:**
  - `vite.config.js`

### 5) Legacy Base44 client/config files appear unused
- **Importance:** **Medium**
- **Emergency:** **P2 (Planned cleanup)**
- **Why:** These files are Base44-era compatibility layers and likely dead code now that app runtime uses Supabase API client.
- **Likely unused artifacts:**
  - `src/api/base44Client.js`
  - `src/lib/app-params.js` (uses `VITE_BASE44_*`, `base44_*` localStorage keys)

### 6) Documentation and naming still refer to Base44
- **Importance:** **Low**
- **Emergency:** **P3 (Backlog/doc cleanup)**
- **Why:** Not runtime-critical, but can confuse onboarding and operations.
- **Files:**
  - `README.md`
  - `package.json` name: `base44-app`

### 7) Static asset URL includes `base44-prod` bucket naming
- **Importance:** **Low**
- **Emergency:** **P3 (Backlog/content cleanup)**
- **Why:** This is likely just bucket naming in Supabase URL, not direct Base44 platform dependency by itself.
- **File:**
  - `src/components/landing/Navbar.jsx`

---

## Current Dependency Risk Map

- **Direct runtime dependency on Base44:** **YES** (edge functions)
- **Frontend runtime dependency on Base44 SDK:** **NO clear active import found**
- **Build/install dependency on Base44 packages:** **YES**
- **Docs/config branding dependency:** **YES**

---

## Elimination Plan (Base44 → Fully Supabase/Native)

## Phase 0 — Safety Net (before changes)
- Add smoke checks for:
  - `connectCRM`
  - `testCRMConnection`
  - `syncContactsToCRM`
  - `sendContactToCRM`
  - QR redirect/scan tracking flow
- Define rollback path (feature flags or function aliasing).

## Phase 1 — Replace P0 runtime dependencies (highest priority)

### A) Replace Base44 auth/context inside edge functions
- Replace `createClientFromRequest(req)` with Supabase edge function auth verification pattern.
- Extract user identity from JWT and query `profiles`/`users` directly.

### B) Remove Base44 connector token acquisition
- Replace `asServiceRole.connectors.getAccessToken(...)` with your own OAuth token storage/refresh flow.
- Store encrypted provider tokens (Salesforce/HubSpot) in your DB (service-role access only).
- Implement token refresh logic per provider.

### C) Rework data access in edge functions
- Replace `base44.entities.*` with Supabase client queries and/or secure RPC.
- Keep all writes under explicit RLS/service-role boundaries.

## Phase 2 — Remove package-level coupling
- Remove from dependencies:
  - `@base44/sdk`
  - `@base44/vite-plugin`
- Remove any Vite aliasing that references `@base44/sdk`.
- Re-run build and lint and verify no missing imports.

## Phase 3 — Remove legacy compatibility files
- Delete or archive after confirming no imports/usages:
  - `src/api/base44Client.js`
  - `src/lib/app-params.js`
  - `src/mocks/base44Sdk.js` (or rename to generic offline API mock)
- Replace Base44 env names (`VITE_BASE44_*`) with neutral names if still needed.

## Phase 4 — Documentation / naming cleanup
- Rewrite `README.md` for Supabase-native architecture.
- Rename package from `base44-app` to your product name.
- Remove Base44 links and operational instructions.

## Phase 5 — Hard verification before declaring done
- `grep` check: no `@base44`, `base44`, `VITE_BASE44` in source/functions/docs except migration notes.
- End-to-end verify:
  - CRM connect
  - CRM test
  - Contact sync
  - Contact webhook send
  - QR scan tracking
- Monitor production logs for token/CRM/edge-function errors for 7 days.

---

## Suggested Priority Queue

1. **P0:** Refactor all six edge functions off Base44 SDK/connectors.
2. **P1:** Remove Base44 packages from dependency graph.
3. **P2:** Remove legacy client/config/mock files and Base44 aliases.
4. **P3:** Docs/name/content cleanup.

---

## Exit Criteria ("Base44-free")

You can consider the app Base44-independent only when all are true:
- No runtime Base44 calls in edge functions.
- No `@base44/*` dependencies in `package.json`.
- No Base44 aliasing in Vite config.
- No `VITE_BASE44_*` app config paths in active code.
- CRM and QR workflows validated in production without Base44.
