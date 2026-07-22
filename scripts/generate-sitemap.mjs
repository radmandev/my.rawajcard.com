// Generates sitemap.xml from static routes + published products in Supabase.
// Runs automatically after `npm run build` (see package.json "postbuild").
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const SITE_URL = 'https://rawajcard.com';
const outPath = process.argv[2] || resolve(rootDir, 'dist/sitemap.xml');

function loadEnv() {
  const envPath = resolve(rootDir, '.env');
  if (!existsSync(envPath)) return {};
  const env = {};
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return env;
}

const env = { ...loadEnv(), ...process.env };
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const today = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/products', changefreq: 'daily', priority: '0.9' },
  { loc: '/Pricing', changefreq: 'weekly', priority: '0.8' },
  { loc: '/CardSamples', changefreq: 'weekly', priority: '0.6' },
  { loc: '/guides', changefreq: 'weekly', priority: '0.6' },
  { loc: '/PrivacyPolicy', changefreq: 'monthly', priority: '0.3' },
  { loc: '/PaymentsPolicy', changefreq: 'monthly', priority: '0.3' },
  { loc: '/Return', changefreq: 'monthly', priority: '0.3' },
];

// Kept in sync manually with the slugs in src/components/shared/guidesData.jsx
// (that file can't be imported here — it's loaded via Vite's JSX pipeline, not plain Node).
const guideSlugs = ['what-is-nfc-business-card', 'how-to-make-digital-business-card', 'nfc-vs-qr-business-card'];
for (const slug of guideSlugs) {
  staticRoutes.push({ loc: `/guides/${slug}`, changefreq: 'monthly', priority: '0.5' });
}

async function getProductRoutes() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[sitemap] Supabase env vars missing — skipping product URLs.');
    return [];
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from('products')
    .select('slug, id, updated_at')
    .eq('status', 'published');

  if (error) {
    console.warn('[sitemap] Could not fetch products:', error.message);
    return [];
  }

  return (data || [])
    .filter((p) => p.slug || p.id)
    .map((p) => ({
      loc: `/products/${encodeURIComponent(p.slug || p.id)}`,
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: p.updated_at ? p.updated_at.slice(0, 10) : today,
    }));
}

function buildXml(urls) {
  const body = urls
    .map(
      (u) => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

const productRoutes = await getProductRoutes();
const xml = buildXml([...staticRoutes, ...productRoutes]);

writeFileSync(outPath, xml, 'utf8');
console.log(`[sitemap] Wrote ${staticRoutes.length + productRoutes.length} URLs to ${outPath}`);
