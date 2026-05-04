import React, { useState, useEffect, useRef } from'react';
import { useNavigate, useLocation } from'react-router-dom';
import { motion, AnimatePresence } from'framer-motion';
import { ChevronLeft, ChevronRight, Upload, X, ShoppingCart, Check, RotateCcw, Type, Image, Palette, Phone, Mail, Globe, MapPin } from'lucide-react';
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
 const isCircle = productType ==='sticker' || productType ==='keychain';
 const isStand = productType ==='stand';
 const isCard = productType ==='card';

 // Background color/texture
 let bg ='#1a1a1a';
 let textColor ='#fff';
 if (isCard) {
 if (material ==='metal') {
 const mc = METAL_COLORS.find(c => c.key === color);
 bg = mc?.hex ||'#D4AF37';
 textColor = color ==='gold' ?'#1a1a1a' :'#fff';
 } else if (material ==='wood') {
 const wc = WOOD_COLORS.find(c => c.key === color);
 bg = wc?.hex ||'#D2B48C';
 textColor = color ==='light' ?'#1a1a1a' :'#fff';
 } else {
 bg ='#fff';
 textColor ='#1a1a1a';
 }
 } else if (isStand) {
 bg ='#0f172a';
 textColor ='#fff';
 }

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

 const containerClass = isCircle
 ?'w-52 h-52 rounded-full'
 : isStand
 ?'w-64 h-64 rounded-full'
 :'w-80 h-48 rounded-2xl';

 if (isCard) {
 return (
 <div className="flex flex-col items-center gap-4 w-full">
 <div className="relative w-full max-w-[340px] h-[250px]">
 {/* Back card */}
 <div
 className="absolute left-1/2 -translate-x-1/2 top-[96px] w-[86%] h-[150px] rounded-2xl border shadow-[0_16px_28px_rgba(15,23,42,0.28)] overflow-hidden"
 style={{
 ...cardSurfaceStyle,
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
 className="absolute left-1/2 -translate-x-1/2 top-2 w-[92%] h-[168px] rounded-2xl border overflow-hidden shadow-[0_20px_38px_rgba(15,23,42,0.34)]"
 style={{
 ...cardSurfaceStyle,
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

 return (
 <div className="flex flex-col items-center gap-4">
 <div
 className={`${containerClass} relative overflow-hidden shadow-2xl flex flex-col items-center justify-center transition-all duration-500`}
 style={{ backgroundColor: bg, color: textColor }}
 >
 {/* NFC icon watermark */}
 <div className="absolute top-3 right-3 opacity-20">
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.859a10 10 0 0 1 14 0"/><path d="M8.5 16.429a5 5 0 0 1 7 0"/></svg>
 </div>

 {/* Logo */}
 {logoPreview ? (
 <img src={logoPreview} alt="Logo" className={`${isCircle ?'w-16 h-16' : isStand ?'w-20 h-20' :'w-14 h-14'} object-contain rounded-lg mb-2`} />
 ) : (
 <div className={`${isCircle ?'w-16 h-16' : isStand ?'w-20 h-20' :'w-14 h-14'} rounded-lg mb-2 flex items-center justify-center border-2 border-dashed`} style={{ borderColor: textColor, opacity: 0.3 }}>
 <Image className="w-6 h-6" style={{ color: textColor }} />
 </div>
 )}

 {/* Text */}
 <p className="text-sm font-bold truncate max-w-[90%] leading-tight" style={{ color: textColor }}>
 {name || (isRTL ?'اسمك هنا' :'Your Name')}
 </p>
 {!isCircle && (
 <p className="text-xs opacity-70 truncate max-w-[90%]" style={{ color: textColor }}>
 {title || (isRTL ?'المسمى الوظيفي' :'Job Title')}
 </p>
 )}

 {/* Stand extras */}
 {isStand && (
 <div className="flex gap-3 mt-3 opacity-60">
 {phone && <Phone className="w-4 h-4" />}
 {email && <Mail className="w-4 h-4" />}
 {website && <Globe className="w-4 h-4" />}
 <MapPin className="w-4 h-4" />
 </div>
 )}

 {/* Card contact row */}
 {isCard && (phone || email) && (
 <div className="flex gap-2 mt-2 opacity-60">
 {phone && <Phone className="w-3 h-3" />}
 {email && <Mail className="w-3 h-3" />}
 {website && <Globe className="w-3 h-3" />}
 </div>
 )}
 </div>

 {/* Material label */}
 {isCard && (
 <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
 {material ==='metal' ? (METAL_COLORS.find(c => c.key === color)?.labelEn ||'Gold') +' Metal'
 : material ==='wood' ? (WOOD_COLORS.find(c => c.key === color)?.labelEn ||'Light') +' Wood'
 :'PVC — UV Print'}
 </span>
 )}
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
 <div className="min-h-screen bg-slate-50" dir={isRTL ?'rtl' :'ltr'}>
 <Navbar onLoginClick={() => setLoginOpen(true)} />

 <div className="public-subpage-offset pb-20 container mx-auto px-4 md:px-6 max-w-5xl">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 className="text-center mb-10"
 >
 <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
 {t('Customize Your NFC Product','صمّم منتج NFC الخاص بك')}
 </h1>
 <p className="text-slate-500">
 {t('Choose your product, pick your style, and preview it live','اختر منتجك، حدد أسلوبك، وشاهد المعاينة مباشرة')}
 </p>
 </motion.div>

 {/* Step Indicator */}
 <div className="flex items-center justify-center gap-2 mb-10">
 {stepsLabels.map((label, i) => (
 <React.Fragment key={i}>
 {i > 0 && <div className={`h-px w-8 md:w-16 transition-colors ${i <= step ?'bg-cyan-500' :'bg-slate-200'}`} />}
 <button
 onClick={() => i <= step && setStep(i)}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
 i === step
 ?'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
 : i < step
 ?'bg-cyan-100 text-cyan-700 cursor-pointer'
 :'bg-slate-100 text-slate-400'
 }`}
 >
 <span className="w-5 h-5 rounded-full bg-indigo-950/60/20 flex items-center justify-center text-[10px]">
 {i < step ? <Check className="w-3 h-3" /> : i + 1}
 </span>
 <span className="hidden sm:inline">{label}</span>
 </button>
 </React.Fragment>
 ))}
 </div>

 <div className={`grid gap-8 items-start ${step === 0 ?'lg:grid-cols-1' :'lg:grid-cols-2'}`}>
 {/* Left: Form */}
 <motion.div
 key={step}
 initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.3 }}
 className="bg-indigo-950/60 rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8"
 >
 {/* STEP 0: Product Type */}
 {step === 0 && (
 <div>
 <h2 className="text-lg font-bold text-slate-900 mb-1">
 {t('Select Product Type','اختر نوع المنتج')}
 </h2>
 <p className="text-sm text-slate-500 mb-6">
 {t('What would you like to customize?','ماذا تود أن تخصص؟')}
 </p>

 {/* Compact one-row product slider */}
 <div className="mb-6 overflow-x-auto pb-1">
 <div className="flex flex-nowrap gap-2 min-w-max">
 {PRODUCT_TYPES.map(pt => (
 <button
 key={pt.key}
 onClick={() => setProductType(pt.key)}
 className={`relative min-w-[150px] px-4 py-3 rounded-xl border-2 transition-all duration-200 text-center group hover:shadow-md ${
 productType === pt.key
 ?'border-cyan-500 bg-cyan-50 shadow-md'
 :'border-slate-200 hover:border-cyan-300'
 }`}
 >
 {productType === pt.key && (
 <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center">
 <Check className="w-3 h-3" />
 </div>
 )}
 <span className="text-2xl block mb-1">{pt.icon}</span>
 <span className="text-xs sm:text-sm font-semibold text-slate-800">
 {isRTL ? pt.labelAr : pt.labelEn}
 </span>
 </button>
 ))}
 </div>
 </div>

 {/* Merged live preview */}
 <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 md:p-6">
 <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 text-center">
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
 <h2 className="text-lg font-bold text-slate-900 mb-1">
 {productType ==='card' ? t('Card Material & Color','خامة البطاقة واللون') : t('Product Options','خيارات المنتج')}
 </h2>
 <p className="text-sm text-slate-500 mb-6">
 {productType ==='card'
 ? t('Choose the material and finish for your card','اختر خامة البطاقة واللمسة النهائية')
 : t('Your selection details','تفاصيل اختيارك')}
 </p>

 {productType ==='card' && (
 <>
 {/* Material */}
 <label className="text-sm font-semibold text-slate-700 mb-3 block">
 {t('Material','الخامة')}
 </label>
 <div className="flex gap-2 mb-6">
 {CARD_MATERIALS.map(m => (
 <button
 key={m.key}
 onClick={() => setMaterial(m.key)}
 className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all border-2 ${
 material === m.key
 ?'border-cyan-500 bg-cyan-50 text-cyan-700'
 :'border-slate-200 text-slate-600 hover:border-cyan-300'
 }`}
 >
 {isRTL ? m.labelAr : m.labelEn}
 <span className="block text-xs text-slate-400 mt-0.5">{m.price} SAR</span>
 </button>
 ))}
 </div>

 {/* Color */}
 <label className="text-sm font-semibold text-slate-700 mb-3 block">
 {t('Color','اللون')}
 </label>
 <div className="flex gap-3 mb-4">
 {(material ==='metal' ? METAL_COLORS : material ==='wood' ? WOOD_COLORS : []).map(c => (
 <button
 key={c.key}
 onClick={() => setColor(c.key)}
 className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
 color === c.key
 ?'border-cyan-500 shadow-md'
 :'border-slate-200 hover:border-cyan-300'
 }`}
 >
 <div
 className="w-10 h-10 rounded-full border-2 shadow-inner"
 style={{ backgroundColor: c.hex, borderColor: c.ring }}
 />
 <span className="text-xs font-medium text-slate-600">
 {isRTL ? c.labelAr : c.labelEn}
 </span>
 </button>
 ))}
 {material ==='pvc' && (
 <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-cyan-500 bg-cyan-50 flex-1">
 <Palette className="w-5 h-5 text-cyan-600" />
 <div>
 <p className="text-sm font-semibold text-slate-800">
 {t('UV Print — Any Design','طباعة UV — أي تصميم')}
 </p>
 <p className="text-xs text-slate-500">
 {t('Upload your design or we\'ll create one for you','ارفع تصميمك أو سننشئ لك واحداً')}
 </p>
 </div>
 </div>
 )}
 </div>
 </>
 )}

 {/* Non-card products info */}
 {productType !=='card' && (
 <div className="space-y-4">
 <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
 <div className="flex items-center gap-3 mb-2">
 <span className="text-2xl">{PRODUCT_TYPES.find(p => p.key === productType)?.icon}</span>
 <div>
 <p className="font-semibold text-slate-800">
 {isRTL
 ? PRODUCT_TYPES.find(p => p.key === productType)?.labelAr
 : PRODUCT_TYPES.find(p => p.key === productType)?.labelEn}
 </p>
 <p className="text-sm text-cyan-600 font-bold">{price} SAR</p>
 </div>
 </div>
 <p className="text-sm text-slate-500">
 {productType ==='sticker'
 ? t('Small circle shape — perfect for branding with your logo + NFC chip','شكل دائري صغير — مثالي للعلامة التجارية مع شعارك + شريحة NFC')
 : productType ==='keychain'
 ? t('Compact circle design — fits your logo with NFC technology built-in','تصميم دائري مدمج — يناسب شعارك مع تقنية NFC مدمجة')
 : t('Professional table stand with NFC — share your store info, menu, social links','ستاند طاولة احترافي مع NFC — شارك معلومات متجرك، المنيو، روابط التواصل')}
 </p>
 </div>
 </div>
 )}

 {/* Price summary */}
 <div className="mt-6 p-4 rounded-xl bg-cyan-50 border border-cyan-200">
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-slate-600">
 {t('Price','السعر')}
 </span>
 <span className="text-lg font-bold text-cyan-700">
 {price} SAR
 </span>
 </div>
 </div>
 </div>
 )}

 {/* STEP 2: Design Info */}
 {step === 2 && (
 <div>
 <h2 className="text-lg font-bold text-slate-900 mb-1">
 {t('Your Information','معلوماتك')}
 </h2>
 <p className="text-sm text-slate-500 mb-6">
 {t('This will appear on your product','ستظهر هذه على منتجك')}
 </p>

 <div className="space-y-4">
 {/* Logo Upload */}
 <div>
 <label className="text-sm font-semibold text-slate-700 mb-2 block">
 {t('Logo','الشعار')}
 </label>
 <div className="flex items-center gap-3">
 {logoPreview ? (
 <div className="relative">
 <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-slate-200" />
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
 className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-cyan-400 hover:text-cyan-500 transition-colors"
 >
 <Upload className="w-5 h-5" />
 <span className="text-[10px] mt-0.5">{t('Upload','ارفع')}</span>
 </button>
 )}
 <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
 <p className="text-xs text-slate-400">{t('PNG, JPG or SVG — max 2MB','PNG, JPG أو SVG — أقصى 2 ميجابايت')}</p>
 </div>
 </div>

 {/* Name */}
 <div>
 <label className="text-sm font-semibold text-slate-700 mb-1 block">
 {t('Name / Business Name','الاسم / اسم النشاط')} *
 </label>
 <input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder={t('e.g. Ahmed Al-Shamri','مثال: أحمد الشمري')}
 className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
 />
 </div>

 {/* Title (not for sticker/keychain) */}
 {productType !=='sticker' && productType !=='keychain' && (
 <div>
 <label className="text-sm font-semibold text-slate-700 mb-1 block">
 {t('Job Title / Tagline','المسمى الوظيفي / الوصف')}
 </label>
 <input
 type="text"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder={t('e.g. CEO @ Company','مثال: المدير التنفيذي @ الشركة')}
 className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
 />
 </div>
 )}

 {/* Contact fields for card & stand */}
 {(productType ==='card' || productType ==='stand') && (
 <>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-sm font-semibold text-slate-700 mb-1 block">
 {t('Phone','الهاتف')}
 </label>
 <input
 type="tel"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="+966..."
 className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
 />
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-700 mb-1 block">
 {t('Email','البريد')}
 </label>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="name@example.com"
 className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
 />
 </div>
 </div>
 <div>
 <label className="text-sm font-semibold text-slate-700 mb-1 block">
 {t('Website','الموقع الإلكتروني')}
 </label>
 <input
 type="url"
 value={website}
 onChange={(e) => setWebsite(e.target.value)}
 placeholder="https://..."
 className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
 />
 </div>
 </>
 )}

 {/* Notes */}
 <div>
 <label className="text-sm font-semibold text-slate-700 mb-1 block">
 {t('Additional Notes','ملاحظات إضافية')}
 </label>
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 rows={3}
 placeholder={t('Any special instructions for the design team...','أي تعليمات خاصة لفريق التصميم...')}
 className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all resize-none"
 />
 </div>
 </div>
 </div>
 )}

 {/* STEP 3: Preview & Confirm */}
 {step === 3 && (
 <div>
 <h2 className="text-lg font-bold text-slate-900 mb-1">
 {t('Review & Order','مراجعة وطلب')}
 </h2>
 <p className="text-sm text-slate-500 mb-6">
 {t('Confirm your customization and add to cart','أكد التخصيص وأضفه إلى السلة')}
 </p>

 {/* Summary */}
 <div className="space-y-3 mb-6">
 <div className="flex justify-between text-sm">
 <span className="text-slate-500">{t('Product','المنتج')}</span>
 <span className="font-medium text-slate-800">
 {isRTL ? PRODUCT_TYPES.find(p => p.key === productType)?.labelAr : PRODUCT_TYPES.find(p => p.key === productType)?.labelEn}
 </span>
 </div>
 {productType ==='card' && (
 <>
 <div className="flex justify-between text-sm">
 <span className="text-slate-500">{t('Material','الخامة')}</span>
 <span className="font-medium text-slate-800">
 {isRTL ? CARD_MATERIALS.find(m => m.key === material)?.labelAr : CARD_MATERIALS.find(m => m.key === material)?.labelEn}
 </span>
 </div>
 <div className="flex justify-between text-sm">
 <span className="text-slate-500">{t('Color','اللون')}</span>
 <span className="font-medium text-slate-800">
 {material ==='metal' ? (isRTL ? METAL_COLORS.find(c => c.key === color)?.labelAr : METAL_COLORS.find(c => c.key === color)?.labelEn)
 : material ==='wood' ? (isRTL ? WOOD_COLORS.find(c => c.key === color)?.labelAr : WOOD_COLORS.find(c => c.key === color)?.labelEn)
 : t('UV Print','طباعة UV')}
 </span>
 </div>
 </>
 )}
 <div className="flex justify-between text-sm">
 <span className="text-slate-500">{t('Name','الاسم')}</span>
 <span className="font-medium text-slate-800">{name ||'—'}</span>
 </div>
 {title && (
 <div className="flex justify-between text-sm">
 <span className="text-slate-500">{t('Title','المسمى')}</span>
 <span className="font-medium text-slate-800">{title}</span>
 </div>
 )}
 <div className="border-t border-slate-200 pt-3 flex justify-between">
 <span className="font-semibold text-slate-800">{t('Total','الإجمالي')}</span>
 <span className="text-lg font-bold text-cyan-600">{price} SAR</span>
 </div>
 </div>

 {/* Save button */}
 <button
 onClick={handleSave}
 className="w-full h-12 rounded-xl font-bold text-white bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 shadow-lg shadow-cyan-600/30 transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
 >
 <ShoppingCart className="w-5 h-5" />
 {t('Add to Cart & Checkout','أضف إلى السلة وأكمل الشراء')}
 </button>

 {!isAuthenticated && (
 <p className="text-xs text-slate-400 text-center mt-3">
 {t('You will be asked to log in to save your design','سيُطلب منك تسجيل الدخول لحفظ تصميمك')}
 </p>
 )}
 </div>
 )}

 {/* Navigation Buttons */}
 <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
 <button
 onClick={() => step > 0 && setStep(step - 1)}
 disabled={step === 0}
 className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
 step === 0
 ?'text-slate-300 cursor-not-allowed'
 :'text-slate-600 hover:bg-slate-100'
 }`}
 >
 {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
 {t('Back','رجوع')}
 </button>

 {step < totalSteps - 1 ? (
 <button
 onClick={() => canGoNext() && setStep(step + 1)}
 disabled={!canGoNext()}
 className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
 canGoNext()
 ?'bg-cyan-600 hover:bg-cyan-700 text-white shadow-md'
 :'bg-slate-200 text-slate-400 cursor-not-allowed'
 }`}
 >
 {t('Next','التالي')}
 {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
 </button>
 ) : (
 <button
 onClick={() => setStep(0)}
 className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-all"
 >
 <RotateCcw className="w-4 h-4" />
 {t('Start Over','ابدأ من جديد')}
 </button>
 )}
 </div>
 </motion.div>

 {/* Right: Live Preview */}
 {step !== 0 && <div className="lg:sticky lg:top-32">
 <div className="bg-indigo-950/60 rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
 <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 text-center">
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
 <span className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-700 font-bold text-lg px-5 py-2 rounded-full border border-cyan-200">
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
