import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, useInView } from 'framer-motion';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import GetStartedSteps from '@/components/landing/GetStartedSteps';
import ProductPreviewModal from '@/components/store/ProductPreviewModal';
import LoginModal from '@/components/auth/LoginModal';
import DemoHomeMerged from './DemoHomeMerged';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Star, ShoppingCart, ArrowLeft, Check,
  Zap
} from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── data ─────────────────────────────────────────────────────────── */
const PRODUCTS = [
  {
    id: 1,
    nameAr: 'بطاقة الأعمال الاجتماعية NFC',
    nameEn: 'NFC Social Business Card',
    price: 35,
    originalPrice: 60,
    discount: 42,
    rating: 5,
    reviews: 29,
    image: 'https://beta.rawajcard.com/wp-content/uploads/2024/12/Google-NFC-Instagam-Facebook-WhatsApp-Youtube-Snapchat-Android-iPhone-450x450.webp',
    badgeAr: 'الأكثر مبيعاً', badgeEn: 'Best Seller',
    badgeColor: 'bg-cyan-600',
  },
  {
    id: 2,
    nameAr: 'بطاقة تعارف NFC – خشبي',
    nameEn: 'NFC Business Card – Wood',
    price: 100,
    originalPrice: null,
    discount: null,
    rating: 5,
    reviews: 14,
    image: 'https://beta.rawajcard.com/wp-content/uploads/2024/10/%D8%B9%D9%85%D8%A7%D8%AF-%D8%B1%D8%AF%D9%85%D8%A7%D9%86-3-450x450.png',
    badgeAr: 'فاخر', badgeEn: 'Luxury',
    badgeColor: 'bg-amber-500',
  },
  {
    id: 3,
    nameAr: 'بطاقة تعارف ممغنطة NFC – بلاستيك',
    nameEn: 'Magnetic NFC Card – Plastic',
    price: 50,
    originalPrice: null,
    discount: null,
    rating: 5,
    reviews: 8,
    image: 'https://beta.rawajcard.com/wp-content/uploads/2024/10/6-450x450.png',
    badgeAr: null, badgeEn: null,
    badgeColor: null,
  },
  {
    id: 4,
    nameAr: 'بطاقة تعارف معدنية NFC',
    nameEn: 'Metal NFC Business Card',
    price: 130,
    originalPrice: null,
    discount: null,
    rating: 5,
    reviews: 21,
    image: 'https://beta.rawajcard.com/wp-content/uploads/2024/12/Frame_44_1b99c720-5d9b-492e-b5fa-ea176d50a2ad-450x450.webp',
    badgeAr: 'بريميوم', badgeEn: 'Premium',
    badgeColor: 'bg-slate-700',
  },
  {
    id: 5,
    nameAr: 'بطاقة قيمنا على جوجل – NFC',
    nameEn: 'Google Review NFC Card',
    price: 35,
    originalPrice: 60,
    discount: 42,
    rating: 5,
    reviews: 47,
    image: 'https://beta.rawajcard.com/wp-content/uploads/2024/12/Google-NFC-Instagam-Facebook-WhatsApp-Youtube-Snapchat-Android-iPhone-450x450.webp',
    badgeAr: 'خصم 42%', badgeEn: '42% Off',
    badgeColor: 'bg-red-500',
  },
  {
    id: 6,
    nameAr: 'تعليقة مفاتيح NFC لزيادة المراجعات',
    nameEn: 'NFC Keychain – Boost Reviews',
    price: 35,
    originalPrice: null,
    discount: null,
    rating: 5,
    reviews: 69,
    image: 'https://beta.rawajcard.com/wp-content/uploads/2024/12/NFC-Epoxy-Keychain-NFC-Google-450x450.webp',
    badgeAr: null, badgeEn: null,
    badgeColor: null,
  },
  {
    id: 7,
    nameAr: 'ستاند طاولة فخامة – جوجل NFC',
    nameEn: 'Premium Table Stand – Google NFC',
    price: 149,
    originalPrice: 190,
    discount: 22,
    rating: 5,
    reviews: 33,
    image: 'https://beta.rawajcard.com/wp-content/uploads/2024/12/unnamed-file-12-450x450.webp',
    badgeAr: 'للمحلات', badgeEn: 'For Shops',
    badgeColor: 'bg-indigo-600',
  },
  {
    id: 8,
    nameAr: 'ستاند طاولة للمشاركة السريعة',
    nameEn: 'Quick-Share Table Stand',
    price: 129,
    originalPrice: 159,
    discount: 19,
    rating: 5,
    reviews: 18,
    image: 'https://beta.rawajcard.com/wp-content/uploads/2024/10/InstagramStandwhite_1800x1800-450x450.webp',
    badgeAr: null, badgeEn: null,
    badgeColor: null,
  },
];

const PRODUCT_TABS = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'card', labelAr: 'سمارت بزنس كارد', labelEn: 'Business Card' },
  { id: 'stand', labelAr: 'ستاند طاولة', labelEn: 'Table Stand' },
  { id: 'sticker', labelAr: 'ملصق', labelEn: 'Sticker' },
  { id: 'keychain', labelAr: 'تعليقة مفاتيح', labelEn: 'Keychain' },
];

const PRODUCT_CATEGORY_MAP = {
  card: [1, 2, 3, 4],
  stand: [7, 8],
  sticker: [],
  keychain: [6],
  all: [1, 2, 3, 4, 5, 6, 7, 8],
};

/* ─── ProductCard ───────────────────────────────────────────────────── */
function ProductCard({ product, index, onAddToCart, onView, onBuyNow, isRTL }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={index * 0.07}>
      <div
        className="rounded-2xl p-[1px] bg-gradient-to-br from-cyan-400 to-fuchsia-400 shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onView}
      >
        <div className="bg-white rounded-[calc(1rem-1px)] overflow-hidden">
          <div className="relative overflow-hidden bg-slate-50 aspect-square">
            <motion.img
              src={product.image}
              alt={isRTL ? product.nameAr : product.nameEn}
              className="w-full h-full object-cover"
              animate={{ scale: hovered ? 1.06 : 1 }}
              transition={{ duration: 0.4 }}
              onError={(e) => { e.target.src = 'https://placehold.co/400x400/f1f5f9/94a3b8?text=Product'; }}
            />
            {(isRTL ? product.badgeAr : product.badgeEn) && (
              <span className={`absolute top-3 right-3 ${product.badgeColor} text-white text-xs font-bold px-2.5 py-1 rounded-full shadow`}>
                {isRTL ? product.badgeAr : product.badgeEn}
              </span>
            )}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-x-3 bottom-3 flex flex-col gap-2"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onAddToCart?.(); }}
                className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingCart className="h-4 w-4" />
                {isRTL ? 'أضف إلى السلة' : 'Add to Cart'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onBuyNow?.(); }}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <Zap className="h-4 w-4" />
                {isRTL ? 'اشتر الآن' : 'Buy Now'}
              </button>
            </motion.div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
              {isRTL ? product.nameAr : product.nameEn}
            </h3>
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs text-slate-500 mr-1">({product.reviews})</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">
                {product.price.toLocaleString(isRTL ? 'ar-SA' : 'en-US')} {isRTL ? 'ر.س' : 'SAR'}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-slate-500 line-through">
                  {product.originalPrice} {isRTL ? 'ر.س' : 'SAR'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────── */
export default function Home() {
  const [activeTab, setActiveTab] = useState('all');
  const [previewProduct, setPreviewProduct] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { lang, isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();

  const filteredIds = PRODUCT_CATEGORY_MAP[activeTab] || PRODUCT_CATEGORY_MAP.all;
  const filteredProducts = PRODUCTS.filter(p => filteredIds.includes(p.id));
  const primaryHeroCtaLabel = isAuthenticated
    ? (isRTL ? 'تسجيل الدخول' : 'Login')
    : (isRTL ? 'انشئ كرت رقمي مجاني' : 'Create Your Free Digital Card');
  const midPageCtaLabel = isAuthenticated
    ? (isRTL ? 'تسجيل الدخول' : 'Login')
    : (isRTL ? 'انشئ كرتك مجاناً الآن' : 'Create Your Free Card Now');
  const footerCtaLabel = isAuthenticated
    ? (isRTL ? 'تسجيل الدخول' : 'Login')
    : (isRTL ? 'ابدأ مجاناً' : 'Start for Free');
  const heroSectionBackground = { background: 'linear-gradient(135deg, #0C1429 0%, #1E1B4B 50%, #0C1429 100%)' };
  const heroGlassCardClass = 'bg-white/10 backdrop-blur-xl border border-white/15 shadow-[0_24px_80px_rgba(12,20,41,0.35)]';

  return (
    <div className="min-h-screen bg-slate-50 md:bg-indigo-950/60 pb-16 md:pb-0" dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: "'Tajawal', sans-serif" }}>

      {/* ── Announcement Bar ─────────────────────────────────────── */}
      <div className="bg-[#0C1429] text-white text-center py-2.5 text-sm font-medium tracking-wide">
        🚚&nbsp; توصيل مجاني لطلبات 250 ريال فأكثر &nbsp;|&nbsp; اطلب الآن واستلم خلال يومين
      </div>

      {/* ── Navbar (existing) ────────────────────────────────────── */}
      <Navbar onLoginClick={() => setLoginOpen(true)} />

      {/* ── Hero Section (Demo Hero) ────────────────────────────── */}
      <DemoHomeMerged heroOnly onLoginClick={() => setLoginOpen(true)} />

      {/* ── Shapes / Products Section ─────────────────────────────── */}
      <section className="py-24 bg-[#f8fafb]">
        <div className="container mx-auto px-4 md:px-10">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-block text-cyan-600 text-sm font-bold tracking-widest uppercase mb-3">
                {isRTL ? 'مجموعتنا' : 'Our Collection'}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                {isRTL ? 'أشكال فاخرة تليق بك' : 'Premium Designs Just for You'}
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                {isRTL ? 'اختر من بين أفضل الأشكال والألوان — كروت بجودة وفخامة عالية' : 'Choose from the finest shapes and colors — premium quality cards'}
              </p>
            </div>
          </Reveal>

          {/* Tabs */}
          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {PRODUCT_TABS.map(tab => (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white shadow-md shadow-fuchsia-500/30 border border-transparent'
                      : 'bg-white text-slate-900 hover:bg-slate-50 border border-transparent [background:linear-gradient(#fff,#fff)_padding-box,linear-gradient(135deg,#38BDF8,#E879F9)_border-box]'
                  }`}
                >
                  {isRTL ? tab.labelAr : tab.labelEn}
                </motion.button>
              ))}
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {(filteredProducts.length > 0 ? filteredProducts : PRODUCTS).map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                isRTL={isRTL}
                onAddToCart={() => addItem(product, { pageName: 'Home', source: 'home_collection' })}
                onView={() => setPreviewProduct(product)}
                onBuyNow={() => { addItem(product, { pageName: 'Home', source: 'home_buy_now', flow: 'buy_now' }); navigate(createPageUrl('Checkout')); }}
              />
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="text-center mt-12">
              <Link
                to={createPageUrl('Store')}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-fuchsia-500/30 transition-all text-base"
              >
                {isRTL ? 'عرض جميع المنتجات' : 'View All Products'}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Instant Access Feature ─────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden" style={heroSectionBackground}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-120px] right-[-80px] w-[420px] h-[420px] rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.55), transparent 70%)' }} />
          <div className="absolute bottom-[-110px] left-[-60px] w-[360px] h-[360px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(232, 121, 249, 0.48), transparent 70%)' }} />
        </div>
        <div className="container mx-auto px-4 md:px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Image */}
            <Reveal className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-50 rounded-3xl" />
                <div className="relative p-8 md:p-12">
                  <motion.img
                    src="https://beta.rawajcard.com/wp-content/uploads/2024/10/InstagramStandwhite_1800x1800-450x450.webp"
                    alt="الوصول بلمح البصر"
                    className="w-full max-w-sm mx-auto drop-shadow-2xl"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.4 }}
                    onError={(e) => { e.target.src = 'https://placehold.co/500x500/f0fdf4/16a34a?text=NFC'; }}
                  />
                </div>
                {/* floating chip */}
                <motion.div
                  className="absolute top-6 left-6 bg-cyan-600 text-white rounded-2xl px-4 py-2 shadow-xl text-sm font-bold"
                  animate={{ rotate: [-2, 2, -2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🔥 {isRTL ? 'الأكثر طلباً' : 'Best Seller'}
                </motion.div>
              </div>
            </Reveal>

            {/* Text */}
            <Reveal delay={0.15} className="order-1 lg:order-2">
              <span className="inline-block text-cyan-600 text-sm font-bold tracking-widest uppercase mb-4">
                {isRTL ? 'سهل وسريع' : 'Easy & Fast'}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-100 mb-6 leading-snug">
                {isRTL ? (
                  <>الوصول بلمح{' '}<span className="text-cyan-600">البصر</span></>
                ) : (
                  <>Access at the{' '}<span className="text-cyan-600">Speed of Light</span></>
                )}
              </h2>
              <p className="text-slate-200 text-lg leading-relaxed mb-8">
                {isRTL
                  ? 'باستخدام هذا الكرت يمكنك الوصول إلى هاتف عميلك بلمح البصر بدون الحاجة إلى فتح الكاميرا أو واجهة حفظ الأرقام'
                  : 'With this card, you can reach your client instantly — no camera or contact-saving screen needed'}
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { titleAr: 'بدون تطبيق', titleEn: 'No App Required', descAr: 'يعمل مع أي هاتف حديث بدون تحميل أي تطبيق', descEn: 'Works with any modern phone without installing an app' },
                  { titleAr: 'مشاركة لحظية', titleEn: 'Instant Sharing', descAr: 'معلوماتك، حساباتك، وموقعك — كلها بنقرة واحدة', descEn: 'Your info, socials, and location — all with one tap' },
                  { titleAr: 'تحديث مباشر', titleEn: 'Live Updates', descAr: 'غيّر بياناتك متى تشاء، الكرت يُحدَّث فوراً', descEn: 'Change your details anytime, the card updates instantly' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.2 }}
                    className={`flex items-start gap-4 rounded-2xl p-4 ${heroGlassCardClass}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{isRTL ? item.titleAr : item.titleEn}</div>
                      <div className="text-sm text-slate-200 mt-0.5">{isRTL ? item.descAr : item.descEn}</div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link
                to={createPageUrl('Store')}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl transition-colors"
              >
                {isRTL ? 'اختر كرتك الآن' : 'Choose Your Card'}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How It Works Steps ───────────────────────────────────────── */}
      <GetStartedSteps />

      {/* ── CTA Section "مع رواج كارد" ──────────────────────────────── */}
      <section
        className="py-28 relative overflow-hidden"
        style={heroSectionBackground}
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(ellipse, #38BDF8, transparent 70%)' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-[-120px] right-[-40px] w-[360px] h-[360px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #E879F9, transparent 70%)' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, delay: 1.5 }}
          />
        </div>

        <div className="container mx-auto px-4 md:px-10 relative z-10 text-center">
          <Reveal>
            <span className="inline-block text-cyan-300 text-sm font-bold tracking-widest uppercase mb-4 border border-cyan-400/30 rounded-full px-4 py-1.5">
              {isRTL ? 'مع رواج كارد' : 'With Rawajcard'}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              {isRTL ? (
                <>الوصول أصبح{' '}<span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-300 to-cyan-500">أسرع</span></>
                ) : (
                  <>Access is now{' '}<span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-300 to-cyan-500">Faster</span></>
              )}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-slate-300 text-lg max-w-xl mx-auto mb-12 leading-relaxed">
              {isRTL
                ? 'أنشئ كرتك الرقمي مجاناً — شارك معلوماتك، وسائل التواصل، وموقعك بنقرة واحدة مع أي شخص'
                : 'Create your digital card for free — share your info, socials, and location with one tap'}
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={createPageUrl('Login')}>
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-black px-10 py-5 rounded-2xl shadow-2xl shadow-fuchsia-500/30 transition-all text-lg cursor-pointer"
                  onClick={(e) => { e.preventDefault(); setLoginOpen(true); }}
                >
                  {midPageCtaLabel}
                  <ArrowLeft className="h-5 w-5" />
                </motion.span>
              </Link>
              <Link to={createPageUrl('Store')}>
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 bg-indigo-950/60/10 hover:bg-indigo-950/60/20 text-white font-bold px-10 py-5 rounded-2xl border border-white/20 transition-all text-lg cursor-pointer"
                >
                  {isRTL ? 'خصص كرتك المفضل' : 'Customize Your Favorite Card'}
                </motion.span>
              </Link>
            </div>
          </Reveal>

          {/* Trust badges */}
          <Reveal delay={0.45}>
            <div className="flex flex-wrap justify-center gap-8 mt-16">
              {[
                { icon: '🔒', textAr: 'مدفوعات آمنة 100%', textEn: '100% Secure Payments' },
                { icon: '🚚', textAr: 'توصيل سريع لجميع مناطق السعودية', textEn: 'Fast delivery across Saudi Arabia' },
                { icon: '📞', textAr: 'دعم على مدار الساعة', textEn: '24/7 customer support' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                  <span className="text-lg">{badge.icon}</span>
                  {isRTL ? badge.textAr : badge.textEn}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Table Stand Promo ────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Text */}
            <Reveal>
              <span className="inline-block text-cyan-600 text-sm font-bold tracking-widest uppercase mb-4">
                {isRTL ? 'للمطاعم والمحلات' : 'For Restaurants & Shops'}
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-snug">
                {isRTL ? (
                  <>خلّ عملاءك يتفاعلون{' '}<span className="text-cyan-600">أسرع</span></>
                ) : (
                  <>Let customers engage{' '}<span className="text-cyan-600">faster</span></>
                )}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                {isRTL
                  ? 'مع ستاند تفاعلي يصل إليك العميل بواسطته بلمح البصر — يصلح لطلبات الطعام، المراجعات على جوجل، مشاركة وسائل التواصل، وأكثر'
                  : 'With an interactive stand, customers reach you instantly — perfect for food orders, Google reviews, social sharing, and more'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                {[
                  { labelAr: 'مراجعات جوجل', labelEn: 'Google Reviews', icon: '⭐' },
                  { labelAr: 'مشاركة السوشيال', labelEn: 'Social Sharing', icon: '📱' },
                  { labelAr: 'منيو إلكتروني', labelEn: 'Digital Menu', icon: '🍽️' },
                  { labelAr: 'نموذج تواصل', labelEn: 'Contact Form', icon: '📋' },
                ].map((use, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 rounded-xl p-3 bg-white border border-slate-200 shadow-sm"
                  >
                    <span className="text-2xl">{use.icon}</span>
                    <span className="font-semibold text-slate-900 text-sm">{isRTL ? use.labelAr : use.labelEn}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to={createPageUrl('Store')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-fuchsia-500/30 transition-all"
                >
                  {isRTL ? 'خل عملاءك يتفاعلون أسرع' : 'Boost Customer Engagement'}
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <Link
                  to={createPageUrl('Store')}
                  className="inline-flex items-center gap-2 text-slate-900 font-semibold px-8 py-4 rounded-2xl transition-all bg-white border border-slate-200 shadow-sm hover:bg-slate-100"
                >
                  {isRTL ? 'عرض الكل' : 'View All'}
                </Link>
              </div>
            </Reveal>

            {/* Image */}
            <Reveal delay={0.15}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl -z-10" />
                <motion.img
                  src="https://beta.rawajcard.com/wp-content/uploads/2024/12/unnamed-file-12-450x450.webp"
                  alt="ستاند طاولة NFC"
                  className="w-full max-w-md mx-auto rounded-2xl drop-shadow-2xl"
                  whileHover={{ scale: 1.02, rotate: -1 }}
                  transition={{ duration: 0.4 }}
                  onError={(e) => { e.target.src = 'https://placehold.co/500x500/f0fdf4/16a34a?text=Stand'; }}
                />
                {/* Price badge */}
                <motion.div
                  className="absolute bottom-4 left-4 rounded-2xl px-5 py-3 bg-white border border-slate-200 shadow-md"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <div className="text-xs text-slate-400 line-through mb-0.5">{isRTL ? '190 ر.س' : '190 SAR'}</div>
                  <div className="text-2xl font-black text-cyan-700">{isRTL ? '149 ر.س' : '149 SAR'}</div>
                  <div className="text-xs text-red-500 font-bold">{isRTL ? 'وفّر 41 ر.س' : 'Save 41 SAR'}</div>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden" style={heroSectionBackground}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-120px] right-[5%] w-[380px] h-[380px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(56, 189, 248, 0.5), transparent 70%)' }} />
          <div className="absolute bottom-[-120px] left-[4%] w-[340px] h-[340px] rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(232, 121, 249, 0.45), transparent 70%)' }} />
        </div>
        <div className="container mx-auto px-4 md:px-10 relative z-10">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
                {isRTL ? 'ماذا يقول عملاؤنا؟' : 'What Our Customers Say'}
              </h2>
              <p className="text-slate-300">{isRTL ? 'آراء حقيقية من عملاء رواج كارد' : 'Real reviews from Rawajcard customers'}</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                nameAr: 'عبدالله الشمري', nameEn: 'Abdullah Al-Shamri',
                roleAr: 'مدير مبيعات', roleEn: 'Sales Manager',
                textAr: 'منتج رائع! وفّر عليّ الكثير من الوقت. أعطيته لعملائي وكلهم انبهروا. التوصيل كان سريع جداً.',
                textEn: 'Amazing product! Saved me so much time. Shared it with my clients and they were all impressed. Delivery was super fast.',
                stars: 5, avatar: 'ع', avatarBg: 'bg-cyan-600',
              },
              {
                nameAr: 'سارة الأحمدي', nameEn: 'Sara Al-Ahmadi',
                roleAr: 'صاحبة مطعم', roleEn: 'Restaurant Owner',
                textAr: 'الستاند الخاص بمطعمي ساعدنا كثيراً في زيادة المراجعات على جوجل. أنصح به كل صاحب محل.',
                textEn: 'The stand at my restaurant helped us get a lot more Google reviews. I recommend it to every business owner.',
                stars: 5, avatar: 'س', avatarBg: 'bg-purple-600',
              },
              {
                nameAr: 'محمد العتيبي', nameEn: 'Mohammed Al-Otaibi',
                roleAr: 'مستقل ومصمم', roleEn: 'Freelance Designer',
                textAr: 'جودة البطاقة ممتازة والكرت الرقمي احترافي جداً. الجميع يسألني عنه في الاجتماعات!',
                textEn: 'Excellent card quality and the digital card is very professional. Everyone asks me about it in meetings!',
                stars: 5, avatar: 'م', avatarBg: 'bg-blue-600',
              },
            ].map((review, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className={`rounded-2xl p-6 transition-all hover:-translate-y-1 ${heroGlassCardClass}`}>
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.stars)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-200 leading-relaxed mb-5 text-sm">"{isRTL ? review.textAr : review.textEn}"</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${review.avatarBg} flex items-center justify-center text-white font-bold text-sm`}>
                      {review.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{isRTL ? review.nameAr : review.nameEn}</div>
                      <div className="text-xs text-slate-300">{isRTL ? review.roleAr : review.roleEn}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <Footer />

      {/* Product Preview Modal */}
      <ProductPreviewModal
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />

      {/* Login Modal */}
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />

    </div>
  );
}
