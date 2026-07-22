// One-time content migration: pushes rewritten product descriptions (AR+EN) to the
// live Supabase `products` table. The anon key can't do this (RLS correctly restricts
// writes to admins), so this needs the service_role key — passed ONLY as an ephemeral
// shell env var, never written to .env/disk, to avoid repeating the earlier VITE_ leak.
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=<key from Supabase dashboard> node scripts/update-product-copy.mjs
//
// Get the key from: Supabase dashboard → Project Settings → API → service_role.
// Do NOT put it in .env, and do NOT prefix it with VITE_ — that's exactly what exposed
// the database publicly before.
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

function loadEnvUrl() {
  // Only ever reads the (public, non-sensitive) project URL from .env — never a key.
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
    '[update-product-copy] Missing SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Run it like: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/update-product-copy.mjs\n' +
      'Get the key from Supabase dashboard -> Project Settings -> API -> service_role.\n' +
      'Never save it to .env or a VITE_-prefixed variable.'
  );
  process.exit(1);
}
if (!supabaseUrl) {
  console.error('[update-product-copy] Missing VITE_SUPABASE_URL (checked env and .env).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const updates = [
  {
    slug: 'metal-nfc-card',
    description:
      "A full-metal NFC business card built for people who want their first impression to last. One tap against any modern iPhone or Android shares your contact details, social profiles, and website instantly — no app required, no paper card to run out of. Your name or logo is precision-engraved into the metal surface, giving it the weight and finish that suits executives and business owners who meet clients face to face. No battery, no charging, works for years.",
    description_ar:
      'بطاقة أعمال ذكية NFC مصنوعة من معدن فاخر بالكامل، مصممة لمن يريد انطباعاً أولاً لا يُنسى في الاجتماعات وفعاليات الأعمال. بلمسة واحدة من الهاتف، تُشارك بياناتك الكاملة: رقم الجوال، البريد الإلكتروني، حساباتك على وسائل التواصل، وموقعك الإلكتروني، دون الحاجة لتطبيق أو طباعة بطاقات ورقية تنتهي صلاحيتها. نقش تصميمك أو شعار شركتك على سطح المعدن بدقة عالية، ويناسب المدراء التنفيذيين وأصحاب الأعمال. متوافقة مع جميع هواتف آيفون وأندرويد الحديثة، ولا تحتاج شحن أو بطارية.',
  },
  {
    slug: 'wooden-nfc-card',
    description:
      "A genuine wooden NFC business card for people who want something warmer and more sustainable than plastic. Your design or logo is laser-engraved straight into the wood grain, so no two cards look quite the same. Tap it against any phone and the person you're meeting instantly gets your number, email, and social profiles — no app needed. A natural fit for creative founders, cafés, and brands built around an eco-friendly identity. Lightweight, durable, and needs no battery.",
    description_ar:
      'بطاقة تعارف NFC مصنوعة من خشب طبيعي بالكامل، لكل من يبحث عن بديل أنيق ومستدام عن البطاقات البلاستيكية والورقية التقليدية. يُحفر تصميمك أو شعارك بالليزر مباشرة على سطح الخشب بدقة عالية، فتحصل على بطاقة فريدة لا تتكرر لدى أحد غيرك. بلمسة واحدة على الهاتف، يستقبل من تقابله رقمك وبريدك الإلكتروني وحساباتك على مواقع التواصل الاجتماعي دون تحميل أي تطبيق. خيار مثالي لأصحاب المشاريع الإبداعية والمقاهي والعلامات التجارية ذات الهوية الطبيعية الصديقة للبيئة.',
  },
  {
    slug: 'magnetic-nfc-card',
    description:
      "A premium plastic NFC card with a magnetic back that makes it easier to carry and store than a standard card. It's the practical pick for anyone who wants a smart business card without the premium price tag — one tap shares your number, email, and social profiles (Instagram, Snapchat, WhatsApp) directly to the other person's phone. Customize it with your own colors and logo — a good fit for sales teams who need several cards at once.",
    description_ar:
      'بطاقة أعمال NFC بلاستيكية فاخرة بميزة مغناطيسية تجعل حفظها في المحفظة أسهل من أي بطاقة تقليدية. صُممت لتكون الخيار العملي لمن يحتاج بطاقة تعارف ذكية بسعر مناسب دون التنازل عن الجودة: بلمسة واحدة من الهاتف تنتقل بياناتك كاملة، أرقام التواصل، البريد الإلكتروني، وحساباتك على إنستقرام وسناب شات وواتساب، مباشرة لهاتف من تقابله. صممها بألوانك وشعارك الخاص، وتناسب فرق المبيعات والموظفين الذين يحتاجون بطاقات متعددة بأسعار معقولة.',
  },
  {
    slug: 'google-review-card',
    description:
      'An NFC card built specifically to collect Google reviews on the spot, before a customer leaves and forgets. Instead of asking someone to remember to review you later, tap the card against their phone and your Google review page opens instantly, ready to write and post in seconds. One of the fastest ways to raise your review count and improve how your business ranks on Google Search and Maps. A natural fit for shops, clinics, restaurants, and salons.',
    description_ar:
      'بطاقة NFC مخصصة لمساعدتك على جمع تقييمات جوجل بسرعة من عملائك داخل متجرك أو عيادتك أو مطعمك. بدلاً من طلب التقييم شفهياً وانتظار أن يتذكر العميل كتابته لاحقاً، تُقرّب البطاقة من هاتفه فيُفتح رابط تقييم جوجل مباشرة، جاهزاً للكتابة والنشر خلال ثوانٍ. الحل الأسرع لرفع عدد تقييماتك وتحسين ترتيب نشاطك التجاري في نتائج بحث جوجل والخرائط. مثالية للمحلات والعيادات والمطاعم والصالونات التي تعتمد على السمعة الرقمية لجذب عملاء جدد.',
  },
  {
    slug: 'review-keychain',
    description:
      'An NFC keychain that makes asking for a Google review possible anywhere, not just at a checkout counter. Clip it to your keys or leave it in the car, and whenever a happy customer is in front of you, tap it against their phone to open your review page instantly. Its small size makes it practical for people who work on the move — sales reps, home service providers, delivery drivers. Needs no charging or maintenance.',
    description_ar:
      'تعليقة مفاتيح بتقنية NFC مصممة لتسهّل عليك طلب تقييم جوجل من عملائك في أي مكان، حتى خارج المتجر. علّقها بمفاتيحك أو في سيارتك، وعند كل عميل راضٍ عن خدمتك، قرّبها من هاتفه ليفتح رابط التقييم مباشرة دون كتابة أو بحث. حجمها الصغير يجعلها عملية لأصحاب الأعمال المتنقلين مثل مندوبي المبيعات وأصحاب الخدمات المنزلية وسائقي التوصيل. متوفرة بعدة ألوان، متينة للاستخدام اليومي، ولا تحتاج شحن أو صيانة.',
  },
  {
    slug: 'social-keychain',
    description:
      "An NFC keychain built to share every social profile you have with one tap — no typing a username, no scanning a QR code. Link it to your Instagram, Snapchat, TikTok, and WhatsApp, and tapping it against any phone opens them all at once. A solid pick for influencers and small business owners who want a fast way to pick up new followers at events and in-person meetings. Compact and easy to carry on your everyday keychain.",
    description_ar:
      'تعليقة مفاتيح NFC لمشاركة جميع حساباتك على وسائل التواصل الاجتماعي بلمسة واحدة، دون الحاجة لطلب اليوزر أو مسح رمز QR. اربطها بحساباتك على إنستقرام، سناب شات، تيك توك، وواتساب، وعند تقريبها من أي هاتف يفتح كل شيء دفعة واحدة. خيار مثالي للمؤثرين وأصحاب الأعمال الصغيرة الذين يريدون طريقة سريعة لكسب متابعين جدد في اللقاءات والفعاليات. تصميم أنيق وعملي يناسب حلقة المفاتيح اليومية.',
  },
  {
    slug: 'premium-table-stand',
    description:
      'A premium acrylic table stand with built-in NFC, made to collect Google reviews from customers right where they sit or pay. Place it on a table or next to the register, and a single tap opens your Google review page, ready to write. Its clean acrylic design fits naturally into a shop, café, or clinic without taking up counter space. Built for businesses with daily walk-in traffic that want more reviews with the least friction for the customer.',
    description_ar:
      'ستاند طاولة فاخر بتقنية NFC مخصص لجمع تقييمات جوجل من عملائك داخل محلك أو مطعمك أو عيادتك. ضعه على الطاولة أو بجانب الكاشير، وبمجرد أن يقرّب العميل هاتفه منه يفتح رابط تقييم جوجل جاهزاً للكتابة مباشرة. مصنوع من أكريليك فاخر بتصميم أنيق يليق بواجهة عملك ولا يشغل مساحة كبيرة. الحل الأمثل للأنشطة التي تستقبل عملاء يومياً وتريد رفع عدد تقييماتها بأقل جهد ممكن، من مطاعم وكافيهات إلى عيادات وصالونات تجميل.',
  },
  {
    slug: 'quick-share-stand',
    description:
      "A multi-purpose NFC table stand for sharing whatever you need with a single tap: your menu, website, social profiles, or an order form. When a customer taps their phone against it, whatever link you've set opens instantly. Fully customizable, so it can serve a different purpose depending on your business — a flexible option for restaurants and cafés looking to replace paper menus or QR codes with something faster and more professional.",
    description_ar:
      'ستاند طاولة متعدد الاستخدامات بتقنية NFC، لمشاركة أي معلومة تريدها بلمسة واحدة: منيو المطعم، رابط الموقع الإلكتروني، حسابات التواصل الاجتماعي، أو نموذج طلب. عند تقريب العميل هاتفه من الستاند، يفتح مباشرة الرابط الذي تحدده أنت. يمكن تخصيصه ليعرض معلومات مختلفة حسب طبيعة نشاطك، ما يجعله خياراً مرناً للمطاعم والمقاهي التي تريد استبدال قوائم الطعام الورقية أو رموز QR بتجربة أسرع وأكثر احترافية.',
  },
];

let ok = 0;
let failed = 0;
for (const { slug, description, description_ar } of updates) {
  const { data, error } = await supabase
    .from('products')
    .update({ description, description_ar })
    .eq('slug', slug)
    .select('id, slug');

  if (error) {
    console.error(`[update-product-copy] FAILED ${slug}:`, error.message);
    failed++;
  } else if (!data?.length) {
    console.warn(`[update-product-copy] No row matched slug "${slug}" — skipped.`);
    failed++;
  } else {
    console.log(`[update-product-copy] Updated ${slug}`);
    ok++;
  }
}

console.log(`[update-product-copy] Done: ${ok} updated, ${failed} failed/skipped.`);
