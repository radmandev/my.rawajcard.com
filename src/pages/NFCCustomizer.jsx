import React, { useState, useEffect, useRef } from'react';
import { useNavigate, useLocation } from'react-router-dom';
import { motion } from'framer-motion';
import { ChevronLeft, ChevronRight, Upload, X, ShoppingCart, Check, RotateCcw, Image, Palette, Phone, Mail, Globe, MapPin } from'lucide-react';
import { useLanguage } from'@/components/shared/LanguageContext';
import { useAuth } from'@/lib/AuthContext';
import { buildProductTrackingData, trackWebsiteEvent } from'@/lib/websiteTracker';
import { useCart } from'@/contexts/CartContext';
import { productsData } from'@/components/shared/productsData';
import { createPageUrl } from'@/utils';
import Navbar from'@/components/landing/Navbar';
import LoginModal from'@/components/auth/LoginModal';
import Footer from'@/components/landing/Footer';
import { getCustomizerPrefill } from'@/lib/customizerPrefill';

/* ─── Constants ──────────────────────────────────────────────── */

const PRODUCT_TYPES = [
 { key:'card', icon:'💳', labelEn:'NFC Card', labelAr:'بطاقة NFC' },
 { key:'sticker', icon:'🏷️', labelEn:'NFC Sticker', labelAr:'ملصق NFC' },
 { key:'keychain', icon:'🔑', labelEn:'Keychain', labelAr:'تعليقة مفاتيح' },
 { key:'stand', icon:'🪧', labelEn:'Table Stand', labelAr:'ستاند طاولة' },
];

const CARD_MATERIALS = [
 { key:'metal', labelEn:'Metal', labelAr:'معدني', price: 130, productId:'metal-nfc-card' },
 { key:'wood', labelEn:'Wood', labelAr:'خشبي', price: 100, productId:'wooden-nfc-card' },
 { key:'pvc', labelEn:'PVC (Plastic)', labelAr:'بلاستيك PVC', price: 50, productId:'magnetic-nfc-card' },
];

const METAL_COLORS = [
 { key:'gold', labelEn:'Gold', labelAr:'ذهبي', hex:'#D4AF37', ring:'#B8960F' },
 { key:'silver', labelEn:'Silver', labelAr:'فضي', hex:'#C0C0C0', ring:'#8E8E8E' },
 { key:'black', labelEn:'Black', labelAr:'أسود', hex:'#1a1a1a', ring:'#000' },
];

const WOOD_COLORS = [
 { key:'light', labelEn:'Light Wood', labelAr:'خشب فاتح', hex:'#D2B48C', ring:'#A0845C' },
 { key:'dark', labelEn:'Dark Wood', labelAr:'خشب غامق', hex:'#5C3A1E', ring:'#3E2510' },
];

const STEPS = {
 en: ['Product Type','Options','Design','Preview'],
 ar: ['نوع المنتج','الخيارات','التصميم','المعاينة'],
};

/* ─── Helper: map product type to productsData id ──────────── */
function resolveProductId(type, material) {
 if (type ==='card') {
 const m = CARD_MATERIALS.find(cm => cm.key === material);
 return m?.productId ||'metal-nfc-card';
 }
 if (type ==='sticker') return'google-review-card';
 if (type ==='keychain') return'review-keychain';
 if (type ==='stand') return'quick-share-stand';
 return'metal-nfc-card';
}

/* ─── Preview Mockup Component ───────────────────────────────── */
function CardPreview({ config, isRTL }) {
 const { productType, material, color, name, title, phone, email, website, logoFile, logoPreview } = config;

 // Determine preview shape
 const isCard = productType ==='card';

 const cardSurfaceStyle = (() => {
 if (material ==='metal' && color ==='gold') {
 return {
 background:'linear-gradient(135deg, #f7e6b2 0%, #e4c56a 24%, #c99b2c 52%, #f1d889 78%, #b8860b 100%)',
 color:'#1a1a1a',
 };
 }
 if (material ==='metal' && color ==='silver') {
 return {
 background:'linear-gradient(135deg, #f1f5f9 0%, #d6dee6 30%, #b8c2cf 56%, #e8edf3 80%, #9aa7b8 100%)',
 color:'#111827',
 };
 }
 if (material ==='metal' && color ==='black') {
 return {
 background:'linear-gradient(135deg, #2d2d2d 0%, #1c1c1c 38%, #0f0f0f 62%, #2b2b2b 100%)',
 color:'#f8fafc',
 };
 }
 if (material ==='wood') {
 return {
 background:
 color ==='dark'
 ?'repeating-linear-gradient(110deg, #6f4525 0px, #6f4525 12px, #5d361c 12px, #5d361c 24px, #7b4f2e 24px, #7b4f2e 36px)'
 :'repeating-linear-gradient(110deg, #d8b58a 0px, #d8b58a 12px, #cda577 12px, #cda577 24px, #e1c298 24px, #e1c298 36px)',
 color: color ==='dark' ?'#f8fafc' :'#1a1a1a',
 };
 }
 return {
 background:'linear-gradient(135deg, #f8fafc 0%, #eef2f7 50%, #e2e8f0 100%)',
 color:'#111827',
 };
 })();

 if (isCard) {
 return (
 <div className="flex flex-col items-center gap-4 w-full">
 <div className="relative w-full max-w-[340px] h-[300px]">
 {/* Back card */}
 <div
 className="absolute left-1/2 -translate-x-1/2 top-[107px] w-[86%] rounded-2xl border shadow-[0_16px_28px_rgba(15,23,42,0.28)] overflow-hidden"
 style={{
 ...cardSurfaceStyle,
 aspectRatio:'85.6 / 54',
 filter:'brightness(0.96)',
 borderColor:'rgba(255,255,255,0.22)',
 }}
 >
 <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/10" />
 <div className="absolute left-4 bottom-5 w-[56px] h-[56px] rounded-md border border-black/20 bg-indigo-950/60/70 p-1.5">
 <div
 className="w-full h-full"
 style={{
 backgroundImage:
'repeating-linear-gradient(0deg,#0f172a 0 2px,transparent 2px 4px), repeating-linear-gradient(90deg,#0f172a 0 2px,transparent 2px 4px)',
 backgroundSize:'8px 8px',
 opacity: 0.8,
 }}
 />
 </div>
 </div>

 {/* Front card */}
 <div
 className="absolute left-1/2 -translate-x-1/2 top-2 w-[92%] rounded-2xl border overflow-hidden shadow-[0_20px_38px_rgba(15,23,42,0.34)]"
 style={{
 ...cardSurfaceStyle,
 aspectRatio:'85.6 / 54',
 borderColor:'rgba(255,255,255,0.3)',
 }}
 >
 {/* Shine + bevel overlays */}
 <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10" />
 <div className="absolute inset-[1px] rounded-2xl border border-white/20 pointer-events-none" />

 {/* NFC icon */}
 <div className="absolute top-3 right-3 opacity-30">
 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
 </div>

 {/* Center content */}
 <div className="h-full flex flex-col items-center justify-center px-4 text-center">
 {logoPreview ? (
 <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain rounded-lg mb-2" />
 ) : (
 <div className="w-12 h-12 rounded-lg mb-2 flex items-center justify-center border-2 border-dashed" style={{ borderColor:'currentColor', opacity: 0.28 }}>
 <Image className="w-5 h-5" style={{ color:'currentColor' }} />
 </div>
 )}

 <p className="text-sm font-extrabold tracking-wide truncate max-w-[92%]" style={{ color: cardSurfaceStyle.color }}>
 {name || (isRTL ?'اسمك هنا' :'YOUR NAME HERE')}
 </p>
 <p className="text-[11px] opacity-75 truncate max-w-[92%] mt-0.5" style={{ color: cardSurfaceStyle.color }}>
 {title || (isRTL ?'المسمى الوظيفي' :'JOB TITLE')}
 </p>

 <div className="flex gap-2.5 mt-2.5 opacity-70" style={{ color: cardSurfaceStyle.color }}>
 <span className="w-2 h-2 rounded-full bg-current" />
 <span className="w-2 h-2 rounded-full bg-current" />
 <span className="w-2 h-2 rounded-full bg-current" />
 <span className="w-2 h-2 rounded-full bg-current" />
 <span className="w-2 h-2 rounded-full bg-current" />
 </div>
 </div>
 </div>
 </div>

 <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
 {material ==='metal' ? (METAL_COLORS.find(c => c.key === color)?.labelEn ||'Gold') +' Metal'
 : material ==='wood' ? (WOOD_COLORS.find(c => c.key === color)?.labelEn ||'Light') +' Wood'
 :'PVC — UV Print'}
 </span>
 </div>
 );
 }

 const nfcIcon = (
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
 );

 // NFC Sticker — glossy round vinyl label with a peeling corner
 if (productType ==='sticker') {
 return (
 <div className="flex flex-col items-center gap-4">
 <div className="relative w-48 h-48">
 <div
 className="absolute -bottom-1.5 -right-1.5 w-12 h-12"
 style={{
 background:'linear-gradient(135deg, #ffffff 40%, #cbd5e1 100%)',
 clipPath:'polygon(100% 0, 100% 100%, 0 100%)',
 boxShadow:'-6px -6px 12px rgba(15,23,42,0.18)',
 }}
 />
 <div
 className="absolute inset-0 rounded-full overflow-hidden border shadow-[0_12px_26px_rgba(15,23,42,0.16)] flex flex-col items-center justify-center"
 style={{
 background:'radial-gradient(circle at 32% 26%, #ffffff 0%, #f6f8fa 45%, #dde4ec 100%)',
 borderColor:'rgba(148,163,184,0.4)',
 }}
 >
 <div className="absolute inset-2.5 rounded-full border border-dashed" style={{ borderColor:'rgba(56,189,248,0.4)' }} />
 <div className="absolute top-4 opacity-30 text-slate-500">{nfcIcon}</div>
 {logoPreview ? (
 <img src={logoPreview} alt="Logo" className="w-14 h-14 object-contain rounded-lg mb-1.5" />
 ) : (
 <div className="w-14 h-14 rounded-lg mb-1.5 flex items-center justify-center border-2 border-dashed border-slate-300">
 <Image className="w-6 h-6 text-slate-400" />
 </div>
 )}
 <p className="text-sm font-bold text-slate-800 truncate max-w-[78%] text-center">
 {name || (isRTL ?'اسمك هنا' :'Your Name')}
 </p>
 </div>
 </div>
 <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
 {isRTL ?'ملصق NFC لامع' :'Glossy NFC Sticker'}
 </span>
 </div>
 );
 }

 // Keychain — glossy epoxy dome tag on a metal split ring
 if (productType ==='keychain') {
 return (
 <div className="flex flex-col items-center gap-4">
 <div className="relative w-44 h-44 mt-4">
 <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full border-[3px]" style={{ borderColor:'#94a3b8' }} />
 <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2.5 h-3" style={{ backgroundColor:'#cbd5e1' }} />
 <div
 className="absolute inset-0 rounded-full overflow-hidden shadow-[0_14px_28px_rgba(15,23,42,0.22)] flex flex-col items-center justify-center"
 style={{
 backgroundImage:'radial-gradient(circle at 30% 22%, #ffffff 0%, #fef6e4 32%, #fde3b0 62%, #f7c873 100%), linear-gradient(135deg, #38BDF8, #E879F9)',
 backgroundOrigin:'border-box',
 backgroundClip:'padding-box, border-box',
 border:'3px solid transparent',
 }}
 >
 <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(circle at 28% 18%, rgba(255,255,255,0.85) 0%, transparent 38%)' }} />
 {logoPreview ? (
 <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain rounded-lg mb-1.5" />
 ) : (
 <div className="w-12 h-12 rounded-lg mb-1.5 flex items-center justify-center border-2 border-dashed" style={{ borderColor:'rgba(120,53,15,0.3)' }}>
 <Image className="w-5 h-5" style={{ color:'rgba(120,53,15,0.5)' }} />
 </div>
 )}
 <p className="text-xs font-bold text-slate-800 truncate max-w-[76%] text-center">
 {name || (isRTL ?'اسمك هنا' :'Your Name')}
 </p>
 </div>
 </div>
 <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
 {isRTL ?'تعليقة إيبوكسي لامعة' :'Glossy Epoxy Keychain'}
 </span>
 </div>
 );
 }

 // Table Stand — upright acrylic standee showing a business info example
 const hasContact = phone || email || website;
 return (
 <div className="flex flex-col items-center gap-4">
 <div className="relative w-full flex flex-col items-center">
 <div
 className="relative w-full max-w-[220px] min-h-[280px] overflow-hidden border shadow-[0_16px_30px_rgba(15,23,42,0.14)] flex flex-col items-center px-4 pt-8 pb-4"
 style={{
 borderRadius:'16px',
 background:'linear-gradient(160deg, #ffffff 0%, #f4f8fb 55%, #e7eef5 100%)',
 borderColor:'rgba(56,189,248,0.35)',
 }}
 >
 <div className="absolute inset-[3px] rounded-2xl border border-white/70 pointer-events-none" />

 {/* Tap-to-connect badge */}
 <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor:'rgba(56,189,248,0.12)', border:'1px solid rgba(56,189,248,0.3)' }}>
 <span className="text-sky-600 [&>svg]:w-3 [&>svg]:h-3">{nfcIcon}</span>
 <span className="text-[8px] font-bold tracking-wider text-sky-600">
 {isRTL ?'قرّب هاتفك' :'TAP TO CONNECT'}
 </span>
 </div>

 {logoPreview ? (
 <img src={logoPreview} alt="Logo" className="w-14 h-14 object-contain rounded-lg mb-2 mt-2" />
 ) : (
 <div className="w-14 h-14 rounded-lg mb-2 mt-2 flex items-center justify-center border-2 border-dashed border-slate-300">
 <Image className="w-6 h-6 text-slate-400" />
 </div>
 )}
 <p className="text-sm font-bold text-slate-800 truncate max-w-[92%] text-center">
 {name || (isRTL ?'اسم نشاطك التجاري' :'Your Business Name')}
 </p>
 <p className="text-xs text-slate-500 truncate max-w-[92%] text-center mt-0.5">
 {title || (isRTL ?'شعارك الدعائي هنا' :'Your slogan goes here')}
 </p>

 <div className="w-[85%] h-px my-3" style={{ background:'rgba(15,23,42,0.1)' }} />

 <div className="w-full flex flex-1 items-end justify-between gap-2">
 <div className="flex-1 space-y-1 min-w-0">
 {hasContact ? (
 <>
 {phone && (
 <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
 <Phone className="w-3 h-3 shrink-0 text-sky-500" />
 <span className="truncate" dir="ltr">{phone}</span>
 </div>
 )}
 {email && (
 <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
 <Mail className="w-3 h-3 shrink-0 text-sky-500" />
 <span className="truncate" dir="ltr">{email}</span>
 </div>
 )}
 {website && (
 <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
 <Globe className="w-3 h-3 shrink-0 text-sky-500" />
 <span className="truncate" dir="ltr">{website}</span>
 </div>
 )}
 </>
 ) : (
 <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
 <MapPin className="w-3 h-3 shrink-0" />
 <span>{isRTL ?'معلومات تواصلك هنا' :'Your contact info here'}</span>
 </div>
 )}
 </div>

 {/* Optional QR code accent */}
 <div className="shrink-0 w-11 h-11 bg-white rounded-[4px] p-1 border border-slate-200 shadow-sm">
 <div className="relative w-full h-full" style={{ backgroundImage:'repeating-linear-gradient(0deg,#1e293b 0 1.4px,transparent 1.4px 3.5px), repeating-linear-gradient(90deg,#1e293b 0 1.4px,transparent 1.4px 3.5px)' }}>
 <div className="absolute top-0 left-0 w-2.5 h-2.5 border-2 border-slate-800 bg-white" />
 <div className="absolute top-0 right-0 w-2.5 h-2.5 border-2 border-slate-800 bg-white" />
 <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-2 border-slate-800 bg-white" />
 </div>
 </div>
 </div>
 </div>
 <div className="w-[78%] h-3 -mt-px" style={{ background:'linear-gradient(180deg, #cbd5e1, #94a3b8)', borderRadius:'0 0 6px 6px' }} />
 <div className="w-[95%] h-2 rounded-full mt-1" style={{ background:'rgba(15,23,42,0.12)', filter:'blur(2px)' }} />
 </div>
 <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
 {isRTL ?'ستاند أكريليك شفاف' :'Clear Acrylic Stand'}
 </span>
 </div>
 );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function NFCCustomizer() {
 const navigate = useNavigate();
 const location = useLocation();
 const { lang, isRTL } = useLanguage();
 const { isAuthenticated } = useAuth();
 const { addItem } = useCart();
 const fileInputRef = useRef(null);
 const prefillRef = useRef('');

 const [step, setStep] = useState(0);
 const [loginOpen, setLoginOpen] = useState(false);

 // Config state
 const [productType, setProductType] = useState('card');
 const [material, setMaterial] = useState('metal');
 const [color, setColor] = useState('gold');
 const [name, setName] = useState('');
 const [title, setTitle] = useState('');
 const [phone, setPhone] = useState('');
 const [email, setEmail] = useState('');
 const [website, setWebsite] = useState('');
 const [logoFile, setLogoFile] = useState(null);
 const [logoPreview, setLogoPreview] = useState(null);
 const [notes, setNotes] = useState('');

 // After login redirect
 const [pendingSave, setPendingSave] = useState(false);

 const t = (en, ar) => isRTL ? ar : en;
 const stepsLabels = isRTL ? STEPS.ar : STEPS.en;

 // Determine available steps based on product type
 const totalSteps = 4;

 // Reset material/color when product type changes
 useEffect(() => {
 if (productType ==='card') {
 setMaterial('metal');
 setColor('gold');
 }
 }, [productType]);

 // Reset color when material changes
 useEffect(() => {
 if (material ==='metal') {
 if (!['gold','silver','black'].includes(color)) setColor('gold');
 return;
 }
 if (material ==='wood') {
 if (!['light','dark'].includes(color)) setColor('light');
 return;
 }
 if (material ==='pvc' && color !=='white') setColor('white');
 }, [material, color]);

 // Prefill from query params (for"Customize Now" buttons)
 useEffect(() => {
 if (!location.search || prefillRef.current === location.search) return;

 const params = new URLSearchParams(location.search);
 const qProduct = params.get('product') || params.get('id') ||'';
 const qType = params.get('type');
 const qMaterial = params.get('material');
 const qColor = params.get('color');

 const inferred = getCustomizerPrefill({ id: qProduct, slug: qProduct, name: qProduct });
 const nextType = qType || inferred.type;
 const nextMaterial = qMaterial || inferred.material;
 const nextColor = qColor || inferred.color;

 if (['card','sticker','keychain','stand'].includes(nextType ||'')) {
 setProductType(nextType);
 }

 if (['metal','wood','pvc'].includes(nextMaterial ||'')) {
 setMaterial(nextMaterial);
 }

 if (['gold','silver','black','light','dark','white'].includes(nextColor ||'')) {
 setColor(nextColor);
 }

 setStep(0);
 prefillRef.current = location.search;
 }, [location.search]);

 // Handle logo upload
 const handleLogoUpload = (e) => {
 const file = e.target.files?.[0];
 if (!file) return;
 setLogoFile(file);
 const reader = new FileReader();
 reader.onload = (ev) => setLogoPreview(ev.target.result);
 reader.readAsDataURL(file);
 };

 // Resolve the matching product
 const productId = resolveProductId(productType, material);
 const matchedProduct = productsData.find(p => p.id === productId);
 const price = matchedProduct?.price || 99;

 // Handle save / add to cart
 const handleSave = () => {
 // Store customization in localStorage
 const customization = {
 productType, material, color, name, title, phone, email, website, notes,
 logoPreview, // base64 string
 productId,
 timestamp: Date.now(),
 };
 localStorage.setItem('rawaj_pending_customization', JSON.stringify(customization));

 if (!isAuthenticated) {
 setPendingSave(true);
 setLoginOpen(true);
 return;
 }

 addToCartAndRedirect();
 };

 const addToCartAndRedirect = () => {
 if (matchedProduct) {
 void trackWebsiteEvent('customization_submit', {
 pageName:'Product Customization',
 path:'/customize',
 metadata: buildProductTrackingData(matchedProduct, {
 product_type: productType,
 material,
 color,
 has_logo: Boolean(logoPreview),
 }),
 });

 addItem({
 id: matchedProduct.id,
 name: matchedProduct.name_en,
 name_en: matchedProduct.name_en,
 name_ar: matchedProduct.name_ar,
 price: matchedProduct.price,
 image: matchedProduct.image_url,
 image_url: matchedProduct.image_url,
 }, {
 pageName:'Product Customization',
 source:'customizer_checkout',
 flow:'customization',
 });
 }
 navigate(createPageUrl('Checkout'));
 };

 // After successful login, add to cart
 useEffect(() => {
 if (isAuthenticated && pendingSave) {
 setPendingSave(false);
 setLoginOpen(false);
 addToCartAndRedirect();
 }
 }, [isAuthenticated, pendingSave]);

 // Step navigation
 const canGoNext = () => {
 if (step === 0) return !!productType;
 if (step === 1) return productType !=='card' || !!material;
 if (step === 2) return !!name;
 return true;
 };

 return (
 <div className="min-h-screen" style={{ backgroundColor: '#0C1429' }} dir={isRTL ? 'rtl' : 'ltr'}>
 <Navbar onLoginClick={() => setLoginOpen(true)} />

 <div className="public-subpage-offset pb-20 container mx-auto px-4 md:px-6 max-w-5xl">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-center mb-10"
 >
 <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
 {t('Customize Your NFC Product','صمّم منتج NFC الخاص بك')}
 </h1>
 <p style={{ color: 'rgba(255,255,255,0.55)' }}>
 {t('Choose your product, pick your style, and preview it live','اختر منتجك، حدد أسلوبك، وشاهد المعاينة مباشرة')}
 </p>
 </motion.div>

 {/* Step Indicator */}
 <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
 {stepsLabels.map((label, i) => (
 <React.Fragment key={i}>
 {i > 0 && <div className="h-px w-4 sm:w-8 md:w-16 shrink-0 transition-colors" style={{ backgroundColor: i <= step ? '#38BDF8' : 'rgba(255,255,255,0.12)' }} />}
 <button
 onClick={() => i <= step && setStep(i)}
 className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0"
 style={i === step
 ? { background: 'linear-gradient(135deg, #38BDF8, #E879F9)', color: '#fff', boxShadow: '0 0 16px rgba(56,189,248,0.35)' }
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

 <div className={`grid gap-8 items-start min-w-0 ${step === 0 ?'lg:grid-cols-1' :'lg:grid-cols-2'}`}>
 {/* Left: Form */}
 <motion.div
 key={step}
 initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.3 }}
 className="rounded-2xl shadow-xl p-6 md:p-8 min-w-0 w-full"
 style={{ backgroundColor: '#1E1B4B', border: '1px solid rgba(56,189,248,0.18)' }}
 >
 {/* STEP 0: Product Type */}
 {step === 0 && (
 <div>
 <h2 className="text-lg font-bold text-white mb-1">
 {t('Select Product Type','اختر نوع المنتج')}
 </h2>
 <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
 {t('What would you like to customize?','ماذا تود أن تخصص؟')}
 </p>

 {/* Product type grid */}
 <div className="mb-6">
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
 {PRODUCT_TYPES.map(pt => (
 <button
 key={pt.key}
 onClick={() => setProductType(pt.key)}
 className="relative px-4 py-3 rounded-xl transition-all duration-200 text-center group hover:shadow-md"
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
 <span className="text-xs sm:text-sm font-semibold text-white">
 {isRTL ? pt.labelAr : pt.labelEn}
 </span>
 </button>
 ))}
 </div>
 </div>

 {/* Merged live preview */}
 <div className="rounded-2xl p-4 md:p-6" style={{ backgroundColor: 'rgba(12,20,41,0.6)', border: '1px solid rgba(56,189,248,0.15)' }}>
 <h3 className="text-xs font-semibold uppercase tracking-wider mb-4 text-center" style={{ color: '#38BDF8' }}>
 {t('Live Preview','معاينة مباشرة')}
 </h3>
 <div className="flex justify-center py-4">
 <CardPreview
 config={{ productType, material, color, name, title, phone, email, website, logoFile, logoPreview }}
 isRTL={isRTL}
 />
 </div>
 </div>
 </div>
 )}

 {/* STEP 1: Options */}
 {step === 1 && (
 <div>
 <h2 className="text-lg font-bold text-white mb-1">
 {productType === 'card' ? t('Card Material & Color','خامة البطاقة واللون') : t('Product Options','خيارات المنتج')}
 </h2>
 <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
 {productType === 'card'
 ? t('Choose the material and finish for your card','اختر خامة البطاقة واللمسة النهائية')
 : t('Your selection details','تفاصيل اختيارك')}
 </p>

 {productType === 'card' && (
 <>
 {/* Material */}
 <label className="text-sm font-semibold mb-3 block" style={{ color: '#38BDF8' }}>
 {t('Material','الخامة')}
 </label>
 <div className="flex gap-2 mb-6">
 {CARD_MATERIALS.map(m => (
 <button
 key={m.key}
 onClick={() => setMaterial(m.key)}
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

 {/* Color */}
 <label className="text-sm font-semibold mb-3 block" style={{ color: '#38BDF8' }}>
 {t('Color','اللون')}
 </label>
 <div className="flex gap-3 mb-4">
 {(material === 'metal' ? METAL_COLORS : material === 'wood' ? WOOD_COLORS : []).map(c => (
 <button
 key={c.key}
 onClick={() => setColor(c.key)}
 className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
 style={color === c.key
 ? { border: '2px solid #38BDF8', boxShadow: '0 0 12px rgba(56,189,248,0.25)', backgroundColor: 'rgba(56,189,248,0.08)' }
 : { border: '2px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }
 }
 >
 <div
 className="w-10 h-10 rounded-full border-2 shadow-inner"
 style={{ backgroundColor: c.hex, borderColor: c.ring }}
 />
 <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
 {isRTL ? c.labelAr : c.labelEn}
 </span>
 </button>
 ))}
 {material === 'pvc' && (
 <div className="flex items-center gap-3 p-4 rounded-xl flex-1" style={{ border: '2px solid #38BDF8', backgroundColor: 'rgba(56,189,248,0.08)' }}>
 <Palette className="w-5 h-5" style={{ color: '#38BDF8' }} />
 <div>
 <p className="text-sm font-semibold text-white">
 {t('UV Print — Any Design','طباعة UV — أي تصميم')}
 </p>
 <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
 {t("Upload your design or we'll create one for you",'ارفع تصميمك أو سننشئ لك واحداً')}
 </p>
 </div>
 </div>
 )}
 </div>
 </>
 )}

 {/* Non-card products info */}
 {productType !== 'card' && (
 <div className="space-y-4">
 <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,189,248,0.15)' }}>
 <div className="flex items-center gap-3 mb-2">
 <span className="text-2xl">{PRODUCT_TYPES.find(p => p.key === productType)?.icon}</span>
 <div>
 <p className="font-semibold text-white">
 {isRTL
 ? PRODUCT_TYPES.find(p => p.key === productType)?.labelAr
 : PRODUCT_TYPES.find(p => p.key === productType)?.labelEn}
 </p>
 <p className="text-sm font-bold" style={{ color: '#38BDF8' }}>{price} SAR</p>
 </div>
 </div>
 <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
 {productType === 'sticker'
 ? t('Small circle shape — perfect for branding with your logo + NFC chip','شكل دائري صغير — مثالي للعلامة التجارية مع شعارك + شريحة NFC')
 : productType === 'keychain'
 ? t('Compact circle design — fits your logo with NFC technology built-in','تصميم دائري مدمج — يناسب شعارك مع تقنية NFC مدمجة')
 : t('Professional table stand with NFC — share your store info, menu, social links','ستاند طاولة احترافي مع NFC — شارك معلومات متجرك، المنيو، روابط التواصل')}
 </p>
 </div>
 </div>
 )}

 {/* Price summary */}
 <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}>
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
 {t('Price','السعر')}
 </span>
 <span className="text-lg font-bold" style={{ color: '#38BDF8' }}>
 {price} SAR
 </span>
 </div>
 </div>
 </div>
 )}

 {/* STEP 2: Design Info */}
 {step === 2 && (
 <div>
 <h2 className="text-lg font-bold text-white mb-1">
 {t('Your Information','معلوماتك')}
 </h2>
 <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
 {t('This will appear on your product','ستظهر هذه على منتجك')}
 </p>

 <div className="space-y-4">
 {/* Logo Upload */}
 <div>
 <label className="text-sm font-semibold mb-2 block" style={{ color: 'rgba(255,255,255,0.8)' }}>
 {t('Logo','الشعار')}
 </label>
 <div className="flex items-center gap-3">
 {logoPreview ? (
 <div className="relative">
 <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded-xl" style={{ border: '1px solid rgba(56,189,248,0.3)' }} />
 <button
 onClick={() => { setLogoFile(null); setLogoPreview(null); }}
 className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
 >
 <X className="w-3 h-3" />
 </button>
 </div>
 ) : (
 <button
 onClick={() => fileInputRef.current?.click()}
 className="w-16 h-16 rounded-xl flex flex-col items-center justify-center transition-colors"
 style={{ border: '2px dashed rgba(56,189,248,0.35)', color: 'rgba(56,189,248,0.6)', backgroundColor: 'rgba(56,189,248,0.05)' }}
 >
 <Upload className="w-5 h-5" />
 <span className="text-[10px] mt-0.5">{t('Upload','ارفع')}</span>
 </button>
 )}
 <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
 <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{t('PNG, JPG or SVG — max 2MB','PNG, JPG أو SVG — أقصى 2 ميجابايت')}</p>
 </div>
 </div>

 {/* Name */}
 <div>
 <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>
 {productType === 'stand' ? t('Business Name','اسم النشاط التجاري') : t('Name / Business Name','الاسم / اسم النشاط')} *
 </label>
 <input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder={productType === 'stand' ? t('e.g. Sweet Bites Café','مثال: مقهى حلا') : t('e.g. Ahmed Al-Shamri','مثال: أحمد الشمري')}
 className="w-full h-11 px-4 rounded-xl text-white text-sm outline-none transition-all"
 style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }}
 />
 </div>

 {/* Title */}
 {productType !== 'sticker' && productType !== 'keychain' && (
 <div>
 <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>
 {productType === 'stand' ? t('Slogan / Custom Text','الشعار الدعائي / نص مخصص') : t('Job Title / Tagline','المسمى الوظيفي / الوصف')}
 </label>
 <input
 type="text"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder={productType === 'stand' ? t('e.g. Follow us for daily offers','مثال: تابعنا لعروض يومية') : t('e.g. CEO @ Company','مثال: المدير التنفيذي @ الشركة')}
 className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
 style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }}
 />
 </div>
 )}

 {/* Contact fields */}
 {(productType === 'card' || productType === 'stand') && (
 <>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>
 {t('Phone','الهاتف')}
 </label>
 <input
 type="tel"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="+966..."
 className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
 style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }}
 />
 </div>
 <div>
 <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>
 {t('Email','البريد')}
 </label>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="name@example.com"
 className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
 style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }}
 />
 </div>
 </div>
 <div>
 <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>
 {t('Website','الموقع الإلكتروني')}
 </label>
 <input
 type="url"
 value={website}
 onChange={(e) => setWebsite(e.target.value)}
 placeholder="https://..."
 className="w-full h-11 px-4 rounded-xl text-sm outline-none transition-all"
 style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }}
 />
 </div>
 </>
 )}

 {/* Notes */}
 <div>
 <label className="text-sm font-semibold mb-1 block" style={{ color: 'rgba(255,255,255,0.8)' }}>
 {t('Additional Notes','ملاحظات إضافية')}
 </label>
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 rows={3}
 placeholder={t('Any special instructions for the design team...','أي تعليمات خاصة لفريق التصميم...')}
 className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
 style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(56,189,248,0.25)', color: '#fff' }}
 />
 </div>
 </div>
 </div>
 )}

 {/* STEP 3: Preview & Confirm */}
 {step === 3 && (
 <div>
 <h2 className="text-lg font-bold text-white mb-1">
 {t('Review & Order','مراجعة وطلب')}
 </h2>
 <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
 {t('Confirm your customization and add to cart','أكد التخصيص وأضفه إلى السلة')}
 </p>

 {/* Summary */}
 <div className="space-y-3 mb-6">
 <div className="flex justify-between text-sm">
 <span style={{ color: 'rgba(255,255,255,0.5)' }}>{t('Product','المنتج')}</span>
 <span className="font-medium text-white">
 {isRTL ? PRODUCT_TYPES.find(p => p.key === productType)?.labelAr : PRODUCT_TYPES.find(p => p.key === productType)?.labelEn}
 </span>
 </div>
 {productType === 'card' && (
 <>
 <div className="flex justify-between text-sm">
 <span style={{ color: 'rgba(255,255,255,0.5)' }}>{t('Material','الخامة')}</span>
 <span className="font-medium text-white">
 {isRTL ? CARD_MATERIALS.find(m => m.key === material)?.labelAr : CARD_MATERIALS.find(m => m.key === material)?.labelEn}
 </span>
 </div>
 <div className="flex justify-between text-sm">
 <span style={{ color: 'rgba(255,255,255,0.5)' }}>{t('Color','اللون')}</span>
 <span className="font-medium text-white">
 {material === 'metal' ? (isRTL ? METAL_COLORS.find(c => c.key === color)?.labelAr : METAL_COLORS.find(c => c.key === color)?.labelEn)
 : material === 'wood' ? (isRTL ? WOOD_COLORS.find(c => c.key === color)?.labelAr : WOOD_COLORS.find(c => c.key === color)?.labelEn)
 : t('UV Print','طباعة UV')}
 </span>
 </div>
 </>
 )}
 <div className="flex justify-between text-sm">
 <span style={{ color: 'rgba(255,255,255,0.5)' }}>{t('Name','الاسم')}</span>
 <span className="font-medium text-white">{name || '—'}</span>
 </div>
 {title && (
 <div className="flex justify-between text-sm">
 <span style={{ color: 'rgba(255,255,255,0.5)' }}>{t('Title','المسمى')}</span>
 <span className="font-medium text-white">{title}</span>
 </div>
 )}
 <div className="pt-3 flex justify-between" style={{ borderTop: '1px solid rgba(56,189,248,0.2)' }}>
 <span className="font-semibold text-white">{t('Total','الإجمالي')}</span>
 <span className="text-lg font-bold" style={{ color: '#38BDF8' }}>{price} SAR</span>
 </div>
 </div>

 {/* Save button */}
 <button
 onClick={handleSave}
 className="w-full h-12 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5"
 style={{ background: 'linear-gradient(135deg, #38BDF8, #E879F9)', boxShadow: '0 0 24px rgba(56,189,248,0.35)' }}
 >
 <ShoppingCart className="w-5 h-5" />
 {t('Add to Cart & Checkout','أضف إلى السلة وأكمل الشراء')}
 </button>

 {!isAuthenticated && (
 <p className="text-xs text-center mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
 {t('You will be asked to log in to save your design','سيُطلب منك تسجيل الدخول لحفظ تصميمك')}
 </p>
 )}
 </div>
 )}

 {/* Navigation Buttons */}
 <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
 <button
 onClick={() => step > 0 && setStep(step - 1)}
 disabled={step === 0}
 className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
 style={step === 0
 ? { color: 'rgba(255,255,255,0.2)', cursor: 'not-allowed' }
 : { color: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(255,255,255,0.07)' }
 }
 >
 {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
 {t('Back','رجوع')}
 </button>

 {step < totalSteps - 1 ? (
 <button
 onClick={() => canGoNext() && setStep(step + 1)}
 disabled={!canGoNext()}
 className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all text-white"
 style={canGoNext()
 ? { background: 'linear-gradient(135deg, #38BDF8, #E879F9)', boxShadow: '0 0 16px rgba(56,189,248,0.3)' }
 : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' }
 }
 >
 {t('Next','التالي')}
 {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
 </button>
 ) : (
 <button
 onClick={() => setStep(0)}
 className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
 style={{ color: 'rgba(255,255,255,0.55)', backgroundColor: 'rgba(255,255,255,0.07)' }}
 >
 <RotateCcw className="w-4 h-4" />
 {t('Start Over','ابدأ من جديد')}
 </button>
 )}
 </div>
 </motion.div>

 {/* Right: Live Preview */}
 {step !== 0 && <div className="lg:sticky lg:top-32 min-w-0 w-full">
 <div className="rounded-2xl shadow-xl p-6 md:p-8" style={{ backgroundColor: '#1E1B4B', border: '1px solid rgba(56,189,248,0.18)' }}>
 <h3 className="text-sm font-semibold uppercase tracking-wider mb-6 text-center" style={{ color: '#38BDF8' }}>
 {t('Live Preview','معاينة مباشرة')}
 </h3>
 <div className="flex justify-center py-8">
 <CardPreview
 config={{ productType, material, color, name, title, phone, email, website, logoFile, logoPreview }}
 isRTL={isRTL}
 />
 </div>
 {/* Price tag */}
 <div className="mt-6 text-center">
 <span
 className="inline-flex items-center gap-2 font-bold text-lg px-5 py-2 rounded-full"
 style={{ background: 'rgba(56,189,248,0.12)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.3)' }}
 >
 {price} SAR
 </span>
 </div>
 </div>
 </div>}
 </div>
 </div>

 <Footer />
 <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
 </div>
 );
}
