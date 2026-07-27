// One-time data fix: 6 products in the live `products` table have `main_image`
// pointing at rawaj.click, a domain with no DNS record at all (verified via dig/curl).
// Every one of those paths has an identical, working counterpart on beta.rawajcard.com
// (see src/components/shared/productsData.jsx), so this just swaps the dead host back
// to the known-good one. The anon key can't write (RLS restricts writes to admins), so
// this needs the service_role key — passed ONLY as an ephemeral shell env var, never
// written to .env/disk.
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=<key from Supabase dashboard> node scripts/fix-broken-product-images.mjs
//
// Get the key from: Supabase dashboard -> Project Settings -> API -> service_role.
// Do NOT put it in .env, and do NOT prefix it with VITE_.
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

function loadEnvUrl() {
  const envPath = resolve(rootDir, '.env');
  if (!existsSync(envPath)) return undefined;
  const line = readFileSync(envPath, 'utf8')
    .split('\n')
    .find((l) => l.trim().startsWith('VITE_SUPABASE_URL='));
  return line ? line.split('=').slice(1).join('=').trim() : undefined;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || loadEnvUrl();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error(
    '[fix-broken-product-images] Missing SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Run it like: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-broken-product-images.mjs\n' +
      'Get the key from Supabase dashboard -> Project Settings -> API -> service_role.\n' +
      'Never save it to .env or a VITE_-prefixed variable.'
  );
  process.exit(1);
}
if (!supabaseUrl) {
  console.error('[fix-broken-product-images] Missing VITE_SUPABASE_URL (checked env and .env).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const fixes = [
  {
    slug: 'google-review-card',
    main_image:
      'https://beta.rawajcard.com/wp-content/uploads/2024/12/Google-NFC-Instagam-Facebook-WhatsApp-Youtube-Snapchat-Android-iPhone-450x450.webp',
  },
  {
    slug: 'magnetic-nfc-card',
    main_image: 'https://beta.rawajcard.com/wp-content/uploads/2024/10/6-450x450.png',
  },
  {
    slug: 'review-keychain',
    main_image:
      'https://beta.rawajcard.com/wp-content/uploads/2024/12/NFC-Epoxy-Keychain-NFC-Google-450x450.webp',
  },
  {
    slug: 'social-keychain',
    main_image:
      'https://beta.rawajcard.com/wp-content/uploads/2024/12/Instagram-NFC-Epoxy-Tag-NFC-Key-Card-13-56MHz-URL-Link-450x450.webp',
  },
  {
    slug: 'premium-table-stand',
    main_image:
      'https://beta.rawajcard.com/wp-content/uploads/2024/12/unnamed-file-12-450x450.webp',
  },
  {
    slug: 'quick-share-stand',
    main_image:
      'https://beta.rawajcard.com/wp-content/uploads/2024/10/InstagramStandwhite_1800x1800-450x450.webp',
  },
];

let ok = 0;
let failed = 0;
for (const { slug, main_image } of fixes) {
  const { data, error } = await supabase
    .from('products')
    .update({ main_image })
    .eq('slug', slug)
    .select('id, slug, main_image');

  if (error) {
    console.error(`[fix-broken-product-images] FAILED ${slug}:`, error.message);
    failed++;
  } else if (!data?.length) {
    console.warn(`[fix-broken-product-images] No row matched slug "${slug}" — skipped.`);
    failed++;
  } else {
    console.log(`[fix-broken-product-images] Fixed ${slug} -> ${main_image}`);
    ok++;
  }
}

console.log(`[fix-broken-product-images] Done: ${ok} fixed, ${failed} failed/skipped.`);
