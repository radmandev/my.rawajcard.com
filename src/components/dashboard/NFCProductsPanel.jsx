import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Upload, X, ShoppingCart, Check,
  RotateCcw, Image, Palette, Phone, Mail, Globe,
} from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { buildProductTrackingData, trackWebsiteEvent } from '@/lib/websiteTracker';
import { useCart } from '@/contexts/CartContext';
import { productsData } from '@/components/shared/productsData';
import { createPageUrl } from '@/utils';

/* ─── Constants ─────────────────────────────────────────────── */

const PRODUCT_TYPES = [
  { key: 'card',     icon: '💳', labelEn: 'NFC Card',     labelAr: 'بطاقة NFC' },
  { key: 'sticker',  icon: '🏷️', labelEn: 'NFC Sticker',  labelAr: 'ملصق NFC' },
  { key: 'keychain', icon: '🔑', labelEn: 'Keychain',      labelAr: 'تعليقة مفاتيح' },
  { key: 'stand',    icon: '🪧', labelEn: 'Table Stand',   labelAr: 'ستاند طاولة' },
];

const CARD_MATERIALS = [
  { key: 'metal', labelEn: 'Metal',        labelAr: 'معدني',       price: 130, productId: 'metal-nfc-card' },
  { key: 'wood',  labelEn: 'Wood',         labelAr: 'خشبي',        price: 100, productId: 'wooden-nfc-card' },
  { key: 'pvc',   labelEn: 'PVC (Plastic)',labelAr: 'بلاستيك PVC', price: 50,  productId: 'magnetic-nfc-card' },
];

const METAL_COLORS = [
  { key: 'gold',   labelEn: 'Gold',   labelAr: 'ذهبي',  hex: '#D4AF37', ring: '#B8960F' },
  { key: 'silver', labelEn: 'Silver', labelAr: 'فضي',   hex: '#C0C0C0', ring: '#8E8E8E' },
  { key: 'black',  labelEn: 'Black',  labelAr: 'أسود',  hex: '#1a1a1a', ring: '#000' },
];

const WOOD_COLORS = [
  { key: 'light', labelEn: 'Light Wood', labelAr: 'خشب فاتح', hex: '#D2B48C', ring: '#A0845C' },
  { key: 'dark',  labelEn: 'Dark Wood',  labelAr: 'خشب غامق', hex: '#5C3A1E', ring: '#3E2510' },
];

const STEPS = {
  en: ['Product Type', 'Options', 'Design', 'Preview'],
  ar: ['نوع المنتج', 'الخيارات', 'التصميم', 'المعاينة'],
};

function resolveProductId(type, material) {
  if (type === 'card') {
    const m = CARD_MATERIALS.find(cm => cm.key === material);
    return m?.productId || 'metal-nfc-card';
  }
  if (type === 'sticker')  return 'google-review-card';
  if (type === 'keychain') return 'review-keychain';
  if (type === 'stand')    return 'quick-share-stand';
  return 'metal-nfc-card';
}

/* ─── Preview Mockup ─────────────────────────────────────────── */
function CardPreview({ config, isRTL }) {
  const { productType, material, color, name, title, phone, email, website, logoPreview } = config;

  const isCircle = productType === 'sticker' || productType === 'keychain';
  const isStand  = productType === 'stand';
  const isCard   = productType === 'card';

  let bg = '#1a1a1a';
  let textColor = '#fff';
  if (isCard) {
    if (material === 'pvc') { bg = '#fff'; textColor = '#1a1a1a'; }
  } else if (isStand) {
    bg = '#0f172a'; textColor = '#fff';
  }

  const cardSurfaceStyle = (() => {
    if (material === 'metal' && color === 'gold')
      return { background: 'linear-gradient(135deg, #f7e6b2 0%, #e4c56a 24%, #c99b2c 52%, #f1d889 78%, #b8860b 100%)', color: '#1a1a1a' };
    if (material === 'metal' && color === 'silver')
      return { background: 'linear-gradient(135deg, #f1f5f9 0%, #d6dee6 30%, #b8c2cf 56%, #e8edf3 80%, #9aa7b8 100%)', color: '#111827' };
    if (material === 'metal' && color === 'black')
      return { background: 'linear-gradient(135deg, #2d2d2d 0%, #1c1c1c 38%, #0f0f0f 62%, #2b2b2b 100%)', color: '#f8fafc' };
    if (material === 'wood')
      return {
        background: color === 'dark'
          ? 'repeating-linear-gradient(110deg, #6f4525 0px, #6f4525 12px, #5d361c 12px, #5d361c 24px, #7b4f2e 24px, #7b4f2e 36px)'
          : 'repeating-linear-gradient(110deg, #d8b58a 0px, #d8b58a 12px, #cda577 12px, #cda577 24px, #e1c298 24px, #e1c298 36px)',
        color: color === 'dark' ? '#f8fafc' : '#1a1a1a',
      };
    return { background: 'linear-gradient(135deg, #f8fafc 0%, #eef2f7 50%, #e2e8f0 100%)', color: '#111827' };
  })();

  const containerClass = isCircle ? 'w-52 h-52 rounded-full' : isStand ? 'w-64 h-64 rounded-full' : 'w-80 h-48 rounded-2xl';

  if (isCard) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="relative w-full max-w-[340px] h-[250px]">
          {/* Back card */}
          <div className="absolute left-1/2 -translate-x-1/2 top-[96px] w-[86%] h-[150px] rounded-2xl border shadow-[0_16px_28px_rgba(15,23,42,0.28)] overflow-hidden"
            style={{ ...cardSurfaceStyle, filter: 'brightness(0.96)', borderColor: 'rgba(255,255,255,0.22)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />
          </div>
          {/* Front card */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[92%] h-[168px] rounded-2xl border overflow-hidden shadow-[0_20px_38px_rgba(15,23,42,0.34)]"
            style={{ ...cardSurfaceStyle, borderColor: 'rgba(255,255,255,0.3)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10" />
            <div className="absolute inset-[1px] rounded-2xl border border-white/20 pointer-events-none" />
            <div className="absolute top-3 right-3 opacity-30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>
              </svg>
            </div>
            <div className="h-full flex flex-col items-center justify-center px-4 text-center">
              {logoPreview
                ? <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain rounded-lg mb-2" />
                : <div className="w-12 h-12 rounded-lg mb-2 flex items-center justify-center border-2 border-dashed" style={{ borderColor: 'currentColor', opacity: 0.28 }}><Image className="w-5 h-5" style={{ color: 'currentColor' }} /></div>
              }
              <p className="text-sm font-extrabold tracking-wide truncate max-w-[92%]" style={{ color: cardSurfaceStyle.color }}>
                {name || (isRTL ? 'اسمك هنا' : 'YOUR NAME HERE')}
              </p>
              <p className="text-[11px] opacity-75 truncate max-w-[92%] mt-0.5" style={{ color: cardSurfaceStyle.color }}>
                {title || (isRTL ? 'المسمى الوظيفي' : 'JOB TITLE')}
              </p>
              <div className="flex gap-2.5 mt-2.5 opacity-70" style={{ color: cardSurfaceStyle.color }}>
                {[0,1,2,3,4].map(i => <span key={i} className="w-2 h-2 rounded-full bg-current" />)}
              </div>
            </div>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
          {material === 'metal' ? (METAL_COLORS.find(c => c.key === color)?.labelEn || 'Gold') + ' Metal'
           : material === 'wood' ? (WOOD_COLORS.find(c => c.key === color)?.labelEn || 'Light') + ' Wood'
           : 'PVC — UV Print'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`${containerClass} relative overflow-hidden shadow-2xl flex flex-col items-center justify-center transition-all duration-500`}
        style={{ backgroundColor: bg, color: textColor }}>
        <div className="absolute top-3 right-3 opacity-20">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/>
          </svg>
        </div>
        {logoPreview
          ? <img src={logoPreview} alt="Logo" className={`${isCircle ? 'w-16 h-16' : isStand ? 'w-20 h-20' : 'w-14 h-14'} object-contain rounded-lg mb-2`} />
          : <div className={`${isCircle ? 'w-16 h-16' : isStand ? 'w-20 h-20' : 'w-14 h-14'} rounded-lg mb-2 flex items-center justify-center border-2 border-dashed`} style={{ borderColor: textColor, opacity: 0.3 }}><Image className="w-6 h-6" style={{ color: textColor }} /></div>
        }
        <p className="text-sm font-bold truncate max-w-[90%] leading-tight" style={{ color: textColor }}>
          {name || (isRTL ? 'اسمك هنا' : 'Your Name')}
        </p>
        {!isCircle && (
          <p className="text-xs opacity-70 truncate max-w-[90%]" style={{ color: textColor }}>
            {title || (isRTL ? 'المسمى الوظيفي' : 'Job Title')}
          </p>
        )}
        {isStand && (
          <div className="flex gap-3 mt-3 opacity-60">
            {phone && <Phone className="w-4 h-4" />}
            {email && <Mail className="w-4 h-4" />}
            {website && <Globe className="w-4 h-4" />}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Panel (embeddable, no page chrome) ─────────────────── */
export default function NFCProductsPanel() {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [productType, setProductType] = useState('card');
  const [material, setMaterial]       = useState('metal');
  const [color, setColor]             = useState('gold');
  const [name, setName]               = useState('');
  const [title, setTitle]             = useState('');
  const [phone, setPhone]             = useState('');
  const [email, setEmail]             = useState('');
  const [website, setWebsite]         = useState('');
  const [logoFile, setLogoFile]       = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [notes, setNotes]             = useState('');

  const tt = (en, ar) => isRTL ? ar : en;
  const stepsLabels = isRTL ? STEPS.ar : STEPS.en;
  const totalSteps = 4;

  useEffect(() => {
    if (productType === 'card') { setMaterial('metal'); setColor('gold'); }
  }, [productType]);

  useEffect(() => {
    if (material === 'metal' && !['gold','silver','black'].includes(color)) setColor('gold');
    if (material === 'wood'  && !['light','dark'].includes(color))          setColor('light');
    if (material === 'pvc'   && color !== 'white')                          setColor('white');
  }, [material]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const productId      = resolveProductId(productType, material);
  const matchedProduct = productsData.find(p => p.id === productId);
  const price          = matchedProduct?.price || 99;

  const handleSave = () => {
    const customization = { productType, material, color, name, title, phone, email, website, notes, logoPreview, productId, timestamp: Date.now() };
    localStorage.setItem('rawaj_pending_customization', JSON.stringify(customization));

    if (matchedProduct) {
      void trackWebsiteEvent('customization_submit', {
        pageName: 'NFC Products',
        path: '/NFCProducts',
        metadata: buildProductTrackingData(matchedProduct, { product_type: productType, material, color, has_logo: Boolean(logoPreview) }),
      });
      addItem({
        id: matchedProduct.id,
        name: matchedProduct.name_en,
        name_en: matchedProduct.name_en,
        name_ar: matchedProduct.name_ar,
        price: matchedProduct.price,
        image: matchedProduct.image_url,
        image_url: matchedProduct.image_url,
      }, { pageName: 'NFC Products', source: 'nfc_products_page', flow: 'customization' });
    }
    navigate(createPageUrl('Checkout'));
  };

  const canGoNext = () => {
    if (step === 0) return !!productType;
    if (step === 1) return productType !== 'card' || !!material;
    if (step === 2) return !!name;
    return true;
  };

  const config = { productType, material, color, name, title, phone, email, website, logoFile, logoPreview };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {stepsLabels.map((label, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div className="h-px w-6 md:w-12 transition-colors"
                style={{ backgroundColor: i <= step ? '#38BDF8' : 'rgba(255,255,255,0.12)' }} />
            )}
            <button
              onClick={() => i <= step && setStep(i)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                i === step
                  ? { background: 'linear-gradient(135deg,#38BDF8,#E879F9)', color: '#fff', boxShadow: '0 0 16px rgba(56,189,248,0.35)' }
                  : i < step
                  ? { backgroundColor: 'rgba(56,189,248,0.15)', color: '#38BDF8', cursor: 'pointer', border: '1px solid rgba(56,189,248,0.3)' }
                  : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.1)' }
              }
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Content grid */}
      <div className={`grid gap-6 items-start ${step === 0 ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>

        {/* Left: Form panel */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl p-6"
          style={{ backgroundColor: 'rgba(12,20,41,0.6)', border: '1px solid rgba(56,189,248,0.18)' }}
        >
          {/* STEP 0 */}
          {step === 0 && (
            <div>
              <h3 className="text-base font-bold text-white mb-1">{tt('Select Product Type','اختر نوع المنتج')}</h3>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>{tt('What would you like to customize?','ماذا تود أن تخصص؟')}</p>
              <div className="mb-5 overflow-x-auto pb-1">
                <div className="flex flex-nowrap gap-2 min-w-max">
                  {PRODUCT_TYPES.map(pt => (
                    <button key={pt.key} onClick={() => setProductType(pt.key)}
                      className="relative min-w-[130px] px-4 py-3 rounded-xl transition-all duration-200 text-center"
                      style={productType === pt.key
                        ? { border: '2px solid #38BDF8', backgroundColor: 'rgba(56,189,248,0.12)', boxShadow: '0 0 16px rgba(56,189,248,0.2)' }
                        : { border: '2px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)' }
                      }
                    >
                      {productType === pt.key && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#38BDF8,#E879F9)' }}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <span className="text-2xl block mb-1">{pt.icon}</span>
                      <span className="text-xs font-semibold text-white">{isRTL ? pt.labelAr : pt.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(12,20,41,0.6)', border: '1px solid rgba(56,189,248,0.15)' }}>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-center" style={{ color: '#38BDF8' }}>
                  {tt('Live Preview','معاينة مباشرة')}
                </h4>
                <div className="flex justify-center py-4">
                  <CardPreview config={config} isRTL={isRTL} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h3 className="text-base font-bold text-white mb-1">
                {productType === 'card' ? tt('Card Material & Color','خامة البطاقة واللون') : tt('Product Options','خيارات المنتج')}
              </h3>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {productType === 'card' ? tt('Choose material and finish','اختر الخامة واللمسة') : tt('Your selection details','تفاصيل اختيارك')}
              </p>
              {productType === 'card' && (
                <>
                  <label className="text-sm font-semibold mb-3 block" style={{ color: '#38BDF8' }}>{tt('Material','الخامة')}</label>
                  <div className="flex gap-2 mb-5">
                    {CARD_MATERIALS.map(m => (
                      <button key={m.key} onClick={() => setMaterial(m.key)}
                        className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                        style={material === m.key
                          ? { border: '2px solid #38BDF8', backgroundColor: 'rgba(56,189,248,0.12)', color: '#38BDF8' }
                          : { border: '2px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(255,255,255,0.04)' }
                        }
                      >
                        {isRTL ? m.labelAr : m.labelEn}
                        <span className="block text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{m.price} SAR</span>
                      </button>
                    ))}
                  </div>
                  <label className="text-sm font-semibold mb-3 block" style={{ color: '#38BDF8' }}>{tt('Color','اللون')}</label>
                  <div className="flex gap-3 mb-4">
                    {(material === 'metal' ? METAL_COLORS : material === 'wood' ? WOOD_COLORS : []).map(c => (
                      <button key={c.key} onClick={() => setColor(c.key)}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                        style={color === c.key
                          ? { border: '2px solid #38BDF8', boxShadow: '0 0 12px rgba(56,189,248,0.25)', backgroundColor: 'rgba(56,189,248,0.08)' }
                          : { border: '2px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }
                        }
                      >
                        <div className="w-10 h-10 rounded-full border-2 shadow-inner" style={{ backgroundColor: c.hex, borderColor: c.ring }} />
                        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{isRTL ? c.labelAr : c.labelEn}</span>
                      </button>
                    ))}
                    {material === 'pvc' && (
                      <div className="flex items-center gap-3 p-4 rounded-xl flex-1" style={{ border: '2px solid #38BDF8', backgroundColor: 'rgba(56,189,248,0.08)' }}>
                        <Palette className="w-5 h-5" style={{ color: '#38BDF8' }} />
                        <div>
                          <p className="text-sm font-semibold text-white">{tt('UV Print — Any Design','طباعة UV — أي تصميم')}</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{tt("Upload your design or we'll create one","ارفع تصميمك أو سننشئ لك واحداً")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {productType !== 'card' && (
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,189,248,0.15)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{PRODUCT_TYPES.find(p => p.key === productType)?.icon}</span>
                    <div>
                      <p className="font-semibold text-white">
                        {isRTL ? PRODUCT_TYPES.find(p => p.key === productType)?.labelAr : PRODUCT_TYPES.find(p => p.key === productType)?.labelEn}
                      </p>
                      <p className="text-sm font-bold" style={{ color: '#38BDF8' }}>{price} SAR</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-5 p-4 rounded-xl" style={{ backgroundColor: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{tt('Price','السعر')}</span>
                  <span className="text-lg font-bold" style={{ color: '#38BDF8' }}>{price} SAR</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h3 className="text-base font-bold text-white mb-1">{tt('Your Information','معلوماتك')}</h3>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>{tt('This will appear on your product','ستظهر هذه على منتجك')}</p>
              <div className="space-y-4">
                {/* Logo */}
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: 'rgba(255,255,255,0.8)' }}>{tt('Logo','الشعار')}</label>
                  <div className="flex items-center gap-3">
                    {logoPreview ? (
                      <div className="relative">
                        <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded-xl" style={{ border: '1px solid rgba(56,189,248,0.3)' }} />
                        <button onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-colors"
                        style={{ border: '2px dashed rgba(56,189,248,0.35)', color: 'rgba(56,189,248,0.6)', backgroundColor: 'rgba(56,189,248,0.05)' }}>
                        <Upload className="w-5 h-5" />
                        <span className="text-[10px] mt-0.5">{tt('Upload','ارفع')}</span>
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>PNG, JPG or SVG — max 2MB</p>
                  </div>
                </div>
                {/* Name */}
                <div>
                  <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>{tt('Name / Business Name','الاسم / اسم النشاط')} *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder={tt('e.g. Ahmed Al-Shamri','مثال: أحمد الشمري')}
                    className="w-full h-11 px-4 rounded-xl text-white text-sm outline-none transition-all"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }} />
                </div>
                {/* Title */}
                {productType !== 'sticker' && productType !== 'keychain' && (
                  <div>
                    <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>{tt('Job Title / Tagline','المسمى الوظيفي / الوصف')}</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder={tt('e.g. CEO @ Company','مثال: المدير التنفيذي @ الشركة')}
                      className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }} />
                  </div>
                )}
                {/* Contact */}
                {(productType === 'card' || productType === 'stand') && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>{tt('Phone','الهاتف')}</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+966..."
                          className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>{tt('Email','البريد')}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com"
                          className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>{tt('Website','الموقع الإلكتروني')}</label>
                      <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..."
                        className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
                        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }} />
                    </div>
                  </>
                )}
                {/* Notes */}
                <div>
                  <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>{tt('Additional Notes','ملاحظات إضافية')}</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    placeholder={tt('Any special instructions for the design team...','أي تعليمات خاصة لفريق التصميم...')}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h3 className="text-base font-bold text-white mb-1">{tt('Review & Order','مراجعة وطلب')}</h3>
              <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>{tt('Confirm your customization and add to cart','أكد التخصيص وأضفه إلى السلة')}</p>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{tt('Product','المنتج')}</span>
                  <span className="font-medium text-white">
                    {isRTL ? PRODUCT_TYPES.find(p => p.key === productType)?.labelAr : PRODUCT_TYPES.find(p => p.key === productType)?.labelEn}
                  </span>
                </div>
                {productType === 'card' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{tt('Material','الخامة')}</span>
                      <span className="font-medium text-white">
                        {isRTL ? CARD_MATERIALS.find(m => m.key === material)?.labelAr : CARD_MATERIALS.find(m => m.key === material)?.labelEn}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{tt('Color','اللون')}</span>
                      <span className="font-medium text-white">
                        {material === 'metal' ? (isRTL ? METAL_COLORS.find(c => c.key === color)?.labelAr : METAL_COLORS.find(c => c.key === color)?.labelEn)
                         : material === 'wood'  ? (isRTL ? WOOD_COLORS.find(c  => c.key === color)?.labelAr  : WOOD_COLORS.find(c  => c.key === color)?.labelEn)
                         : tt('UV Print','طباعة UV')}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{tt('Name','الاسم')}</span>
                  <span className="font-medium text-white">{name || '—'}</span>
                </div>
                {title && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{tt('Title','المسمى')}</span>
                    <span className="font-medium text-white">{title}</span>
                  </div>
                )}
                <div className="pt-3 flex justify-between" style={{ borderTop: '1px solid rgba(56,189,248,0.2)' }}>
                  <span className="font-semibold text-white">{tt('Total','الإجمالي')}</span>
                  <span className="text-lg font-bold" style={{ color: '#38BDF8' }}>{price} SAR</span>
                </div>
              </div>
              <button onClick={handleSave}
                className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#38BDF8,#E879F9)', boxShadow: '0 0 24px rgba(56,189,248,0.35)' }}>
                <ShoppingCart className="w-5 h-5" />
                {tt('Add to Cart & Checkout','أضف إلى السلة وأكمل الشراء')}
              </button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={step === 0
                ? { color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
                : { color: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(255,255,255,0.07)' }
              }>
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              {tt('Back','رجوع')}
            </button>
            {step < totalSteps - 1 ? (
              <button onClick={() => canGoNext() && setStep(step + 1)} disabled={!canGoNext()}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all text-white"
                style={canGoNext()
                  ? { background: 'linear-gradient(135deg,#38BDF8,#E879F9)', boxShadow: '0 0 16px rgba(56,189,248,0.3)' }
                  : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }
                }>
                {tt('Next','التالي')}
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <button onClick={() => setStep(0)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ color: 'rgba(255,255,255,0.55)', backgroundColor: 'rgba(255,255,255,0.07)' }}>
                <RotateCcw className="w-4 h-4" />
                {tt('Start Over','ابدأ من جديد')}
              </button>
            )}
          </div>
        </motion.div>

        {/* Right: Live Preview (steps 1-3 only) */}
        {step !== 0 && (
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(12,20,41,0.6)', border: '1px solid rgba(56,189,248,0.18)' }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-6 text-center" style={{ color: '#38BDF8' }}>
                {tt('Live Preview','معاينة مباشرة')}
              </h4>
              <div className="flex justify-center py-6">
                <CardPreview config={config} isRTL={isRTL} />
              </div>
              <div className="mt-5 text-center">
                <span className="inline-flex items-center gap-2 font-bold text-lg px-5 py-2 rounded-full"
                  style={{ background: 'rgba(56,189,248,0.12)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.3)' }}>
                  {price} SAR
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
