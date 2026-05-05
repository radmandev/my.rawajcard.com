# Rawajcard Audit Summary & Concrete Patch Plan

Date: 2026-05-04  
Scope: Frontend (React/Vite), serverless functions, Supabase SQL migrations, dependency/tooling health

---

## Executive summary

Top risks found:

1. **Critical data access risk**: Supabase RLS policies are overly permissive in core tables.
2. **High XSS risk**: Raw HTML/script injection paths exist in public/admin rendering.
3. **High redirect/trust issues**: Login redirect and payment origin handling can be abused.
4. **High reachability issue**: Build breaks due to missing route modules.
5. **Dependency risk**: Production audit reports critical/high vulnerabilities.
6. **Operational risk**: Lint/typecheck are currently failing heavily.
7. **Performance/privacy debt**: Duplicate runtime font imports and global trackers.

---

## Concrete patch list by file

## 1) Access control & authorization

### File: `supabase/migrations/021_harden_rls_core_tables.sql` (new)

Create a new migration that:

- Drops permissive policies currently allowing `using (true)` / `with check (true)` on sensitive tables.
- Recreates strict owner/admin policies with role checks from `profiles`.

Tables to harden in this migration:

- `business_cards`
  - select: own rows OR published public rows OR admin
  - insert/update/delete: own rows OR admin
- `card_views`
  - select: only owner via card join OR admin
  - insert: public allowed only for valid `card_id`
- `contact_submissions`
  - select: only card owner OR admin
  - insert: public allowed (if intended), scoped by valid `card_id`
- `subscriptions`
  - all ops: own subscription rows OR admin (writes ideally service role only)
- `orders`
  - select/update: own rows OR admin
  - insert: public insert allowed if needed for guest checkout
- `teams`, `team_members`, `activity_logs`
  - access only to team members/admin, not all authenticated users

Also include `notify pgrst, 'reload schema';` at end.

### File: `supabase/migrations/004_admin_policies.sql`

Patch:

- Replace hardcoded email checks with role-based checks from `public.profiles` where possible.
- Keep emergency fallback optional, but remove inline static admin list from policy predicates.

### File: `src/api/supabaseAPI.js`

Patch:

- Remove `ADMIN_EMAILS` hardcoded override for role assignment.
- In `api.auth.me()`, resolve role only from profile/JWT claims.
- Ensure frontend role is treated as UX hint only (DB RLS remains the real gate).

### File: `src/pages/Admin.jsx`

Patch:

- Remove local hardcoded `ADMIN_EMAILS` list.
- Use server/profile role check only.

---

## 2) XSS hardening

### File: `src/components/cards/CustomFormEmbed.jsx`

Patch:

- Remove `innerHTML` assignment and script execution (`createTextNode`/script replacement loop).
- Replace with one of:
  - sandboxed `<iframe>` render for trusted providers, or
  - strict HTML sanitizer with deny-by-default config and **no script execution**.
- If sanitizer route is used, add explicit allowlist for tags/attrs and block event handlers/JS URLs.

### File: `src/pages/PublicCard.jsx`

Patch:

- Ensure custom embed rendering only happens when embed source is validated/approved.
- Add fallback when embed is unsafe (render disabled state).

### File: `src/components/admin/TemplatePreview.jsx`

Patch:

- Replace direct `dangerouslySetInnerHTML` with sanitized preview output.
- Prevent preview content from executing active scripts.

---

## 3) Redirect safety & payment URL trust

### File: `src/pages/Login.jsx`

Patch:

- Harden `next`/stored redirect validation:
  - reject values starting with `//`
  - reject absolute URLs (`http://`, `https://`)
  - allow only known internal paths from an allowlist
- Add a helper such as `getSafeInternalRedirect(target)` and use it in all redirect decisions.

### File: `functions/createStripeCheckout.ts`

Patch:

- Replace wildcard CORS `Access-Control-Allow-Origin: *` with explicit allowed origin list.
- Stop trusting `req.headers.get('origin')` for checkout callback URLs.
- Use server-side env allowlist for base URL (`APP_BASE_URL` / `ALLOWED_ORIGINS`).
- Validate origin against allowlist before using.

### File: `functions/createStripeOrderCheckout.ts`

Patch:

- Same CORS/origin hardening as above.
- Build `success_url` and `cancel_url` from trusted env base URL only.

### Optional follow-up files (same CORS pattern)

- `functions/activateSubscription.ts`
- `functions/confirmStripeOrder.ts`

Patch these to remove wildcard CORS and adopt allowlist headers.

---

## 4) Reachability/build breakages

### File: `src/App.jsx`

Patch:

- Remove or guard import/route for missing page:
  - `@/pages/MuchHero`
- If route is needed, add actual file; otherwise remove `/much-hero` route and public-route entry.

### File: `src/pages.config.js`

Patch:

- Remove stale lazy imports and `PAGES` entries for missing files:
  - `./pages/Demo3D`
  - `./pages/HeaderVariants`
- Or add those page files if intentionally required.

### Files: `src/pages/Demo3D.jsx`, `src/pages/HeaderVariants.jsx`, `src/pages/MuchHero.jsx` (optional new)

If these routes are intended, add minimal page modules to restore reachability.

---

## 5) Dependency & package security

### File: `package.json`

Patch:

- Upgrade direct dependencies with advisories:
  - `react-router-dom` (to patched major/minor)
  - `axios`
  - `lodash`
  - `jspdf`
- Re-evaluate `xlsx` usage in `src/pages/MyContacts.jsx` and migrate if no fix available.
- Add a script:
  - `"audit:prod": "npm audit --omit=dev"`

### File: `src/pages/MyContacts.jsx`

Patch options:

- Replace `xlsx` with safer maintained export path (CSV preferred where feasible), or
- Isolate/limit parsing capabilities and keep export-only logic with strict inputs.

---

## 6) Tooling reliability (CI quality gate)

### File: `eslint.config.js`

Patch:

- Keep rules strict, but make lint pass by cleaning current unused imports incrementally.
- Optionally add focused ignore patterns for generated files only (not app logic).

### File: `jsconfig.json`

Patch:

- Current `checkJs: true` with broad include produces excessive noise.
- Narrow include scope or add staged typecheck config for critical paths first.
- Create a separate `jsconfig.strict.json` for gradual rollout if needed.

### Files across `src/**`

Patch:

- Fix top failing lint/typecheck errors (starting with route-critical and security-critical pages):
  - `src/pages/Analytics.jsx`
  - `src/pages/TemplateAnalytics.jsx`
  - `src/pages/TeamManagement.jsx`
  - `src/pages/TemplateEditor.jsx`
  - `src/Layout.jsx` unused imports

---

## 7) Performance/privacy improvements

### File: `src/Layout.jsx`

Patch:

- Remove inline `<style>@import ...fonts...</style>` runtime font loading.
- Keep typography in static CSS loaded once.

### Files with runtime font imports to clean

- `src/pages/Home.jsx`
- `src/pages/AlternateLanding.jsx`
- `src/pages/DemoHomeMerged.jsx`
- `src/pages/PhysicalCards.jsx`
- `src/pages/MyOrders.jsx`
- `src/components/store/PhysicalCardCustomizationModule.jsx`

Patch:

- Move all font declarations to `src/index.css` or static `<link>` in `index.html` only.

### File: `index.html`

Patch:

- Add consent gate before loading tracking scripts (GTM/Meta/Snap/Ads).
- Add security headers via hosting config (preferred) or meta fallback where applicable:
  - CSP
  - Referrer-Policy
  - Permissions-Policy
- Keep deferred loading strategy, but avoid unconditional tracker boot for all users/regions.

---

## Implementation order (recommended)

1. **RLS hardening migration** (critical)
2. **XSS removal in embed/preview paths**
3. **Redirect + Stripe origin trust fixes**
4. **Build reachability fixes (missing route modules)**
5. **Dependency upgrades and `xlsx` decision**
6. **Lint/typecheck stabilization**
7. **Font/tracker performance & privacy cleanup**

---

## Validation checklist after patching

- `npm run build` passes.
- `npm run lint` passes (or only known accepted warnings).
- `npm run typecheck` passes for enforced scope.
- Verify unauthorized users cannot read/edit other users’ data by direct Supabase queries.
- Verify login `next` rejects unsafe redirect payloads.
- Verify Stripe checkout success/cancel URLs always stay on trusted domain.
- Verify custom embeds no longer execute arbitrary script.
- Lighthouse pass on main public pages after font/tracker cleanup.

---

## Notes

This document is a concrete plan derived from static code/build/audit inspection. It is not a full dynamic penetration test.
