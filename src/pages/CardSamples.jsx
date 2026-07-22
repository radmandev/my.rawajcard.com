import React, { useMemo, useRef, useState } from'react';
import { useLanguage } from'@/components/shared/LanguageContext';
import CardPreview from'@/components/cards/CardPreview';
import Navbar from'@/components/landing/Navbar';
import Footer from'@/components/landing/Footer';
import { ALL_TEMPLATES } from'@/lib/templateConfig';
import { createTemplateSampleUrl } from'@/lib/templateSampleCards';
import { ChevronLeft, ChevronRight, Zap } from'lucide-react';
import { useNavigate } from'react-router-dom';
import { SAMPLE_CARD_DATA } from'@/lib/templateSampleCards';
import { trackWebsiteEvent } from'@/lib/websiteTracker';
import Seo from'@/components/shared/Seo';

export default function CardSamples() {
 const { lang, isRTL } = useLanguage();
 const navigate = useNavigate();
 const [currentIndex, setCurrentIndex] = useState(0);
 const touchStartX = useRef(null);
 const touchEndX = useRef(null);

 // Get translated template list
 const templates = useMemo(() => {
 return ALL_TEMPLATES.map(template => ({
 ...template,
 displayName: lang ==='ar' ? template.nameAr : template.name,
 displayDesc: lang ==='ar' ? template.descriptionAr : template.description
 }));
 }, [lang]);

 const currentTemplate = templates[currentIndex];
 const totalTemplates = templates.length;

 const handlePrev = () => {
 setCurrentIndex(prev => (prev > 0 ? prev - 1 : totalTemplates - 1));
 };

 const handleNext = () => {
 setCurrentIndex(prev => (prev < totalTemplates - 1 ? prev + 1 : 0));
 };

 const handleCreateCard = () => {
 void trackWebsiteEvent('samples_select_template', {
 pageName:'Card Samples',
 path:'/CardSamples',
 metadata: {
 template_id: currentTemplate.id,
 template_name: currentTemplate.displayName,
 },
 });
 navigate(`/CardBuilder?template=${currentTemplate.id}`);
 };

 const handlePreviewCard = () => {
 void trackWebsiteEvent('samples_preview_card', {
 pageName:'Card Samples',
 path:'/CardSamples',
 metadata: {
 template_id: currentTemplate.id,
 template_name: currentTemplate.displayName,
 },
 });
 navigate(createTemplateSampleUrl(currentTemplate, lang));
 };

 const handleTouchStart = (event) => {
 touchStartX.current = event.changedTouches[0].clientX;
 };

 const handleTouchEnd = (event) => {
 touchEndX.current = event.changedTouches[0].clientX;

 if (touchStartX.current === null || touchEndX.current === null) return;

 const distance = touchStartX.current - touchEndX.current;
 const threshold = 50;

 if (distance > threshold) {
 handleNext();
 } else if (distance < -threshold) {
 handlePrev();
 }

 touchStartX.current = null;
 touchEndX.current = null;
 };

 const translations = {
 en: {
 title:'Digital Card Samples',
 subtitle:'Explore our beautiful collection of digital business card templates',
 explore:'Create Your Card',
 preview:'Preview Sample Card',
 selectTemplate:'Choose This Template',
 premiumBadge:'Premium',
 freeBadge:'Free',
 swipeHint:'Swipe left or right to browse the samples'
 },
 ar: {
 title:'نماذج البطاقات الرقمية',
 subtitle:'اكتشف مجموعتنا الرائعة من قوالب بطاقات العمل الرقمية',
 explore:'أنشئ بطاقتك',
 preview:'معاينة البطاقة',
 selectTemplate:'اختر هذا القالب',
 premiumBadge:'ممتاز',
 freeBadge:'مجاني',
 swipeHint:'اسحب يميناً أو يساراً للتنقل بين النماذج'
 }
 };

 const t = translations[lang] || translations.en;

 return (
 <div className="min-h-screen" style={{ backgroundColor: '#0C1429' }}>
 <Seo
 title="نماذج البطاقات الرقمية | قوالب Rawajcard NFC"
 description="استعرض جميع قوالب البطاقات الرقمية من رواج كارد واختر التصميم المناسب لهويتك أو علامتك التجارية."
 path="/CardSamples"
 />
 <Navbar />

 {/* Hero Section */}
 <section className="relative public-subpage-offset pb-16 md:pb-20 overflow-hidden" style={{ backgroundColor: '#0C1429' }}>
 {/* Radial glow */}
 <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(56,189,248,0.15) 0%, transparent 70%)' }} />
 <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
 <span className="inline-block text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#38BDF8' }}>
 {lang === 'ar' ? 'استكشف القوالب' : 'Explore Templates'}
 </span>
 <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
 {t.title}
 </h1>
 <p className="text-lg md:text-xl mb-8 px-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
 {t.subtitle}
 </p>
 <button
 onClick={() => navigate('/CardBuilder')}
 className="inline-flex items-center gap-2 rounded-full px-10 py-4 text-lg font-semibold text-white transition-all duration-300 shadow-lg"
 style={{ background: 'linear-gradient(135deg, #38BDF8, #E879F9)', boxShadow: '0 0 24px rgba(232,121,249,0.35)' }}
 >
 {t.explore}
 </button>
 </div>
 </section>

 {/* Slider Section */}
 <section className="py-16 md:py-20" style={{ backgroundColor: '#0C1429' }}>
 <div className="container mx-auto px-4 md:px-6 max-w-6xl">
 {currentTemplate && (
 <div className="flex items-center justify-center">
 {/* Card Container */}
 <div className="w-full max-w-sm sm:max-w-md md:max-w-lg flex flex-col items-center">
 {/* Template Card */}
 <div
 className="group rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 w-full"
 style={{ backgroundColor: '#1E1B4B', border: '1px solid rgba(56,189,248,0.2)' }}
 onTouchStart={handleTouchStart}
 onTouchEnd={handleTouchEnd}
 >
 {/* Badge */}
 <div className="flex justify-between items-start mb-6">
 <span
 className="px-3 py-1 rounded-full text-xs font-semibold"
 style={currentTemplate.defaultTier === 'premium'
 ? { background: 'rgba(232,121,249,0.15)', color: '#E879F9', border: '1px solid rgba(232,121,249,0.3)' }
 : { background: 'rgba(56,189,248,0.15)', color: '#38BDF8', border: '1px solid rgba(56,189,248,0.3)' }
 }
 >
 {currentTemplate.defaultTier === 'premium' ? t.premiumBadge : t.freeBadge}
 </span>
 </div>

 <div className="mb-4 space-y-3">
 <div
 className="flex items-center justify-between gap-3 rounded-2xl backdrop-blur-xl px-3 py-2 shadow-lg"
 style={{ border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)' }}
 dir="ltr"
 >
 <button
 onClick={handlePrev}
 className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl text-white transition-colors"
 style={{ backgroundColor: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)' }}
 onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(56,189,248,0.35)'}
 onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(56,189,248,0.15)'}
 aria-label="Previous template"
 >
 <ChevronLeft className={`w-5 h-5 ${isRTL ? 'transform rotate-180' : ''}`} />
 </button>
 <div className="flex-1 text-center text-sm sm:text-base font-semibold text-white tracking-wide">
 {currentIndex + 1} / {totalTemplates}
 </div>
 <button
 onClick={handleNext}
 className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl text-white transition-colors"
 style={{ backgroundColor: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)' }}
 onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(56,189,248,0.35)'}
 onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(56,189,248,0.15)'}
 aria-label="Next template"
 >
 <ChevronRight className={`w-5 h-5 ${isRTL ? 'transform rotate-180' : ''}`} />
 </button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <button
 onClick={handlePreviewCard}
 className="w-full rounded-xl font-semibold py-3 transition-colors text-white"
 style={{ border: '1px solid rgba(56,189,248,0.35)', backgroundColor: 'rgba(56,189,248,0.08)' }}
 onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(56,189,248,0.18)'}
 onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(56,189,248,0.08)'}
 >
 {t.preview}
 </button>
 <button
 onClick={handleCreateCard}
 className="w-full rounded-xl text-white font-semibold py-3 transition-all"
 style={{ background: 'linear-gradient(135deg, #38BDF8, #E879F9)', boxShadow: '0 0 16px rgba(232,121,249,0.3)' }}
 >
 {t.selectTemplate}
 </button>
 </div>
 </div>

 {/* Card Preview */}
 <div
 className="relative rounded-xl p-3 sm:p-4 md:p-6 flex items-center justify-center min-h-[290px] sm:min-h-[330px] md:min-h-[350px] overflow-hidden mb-6"
 style={{ background: 'linear-gradient(160deg, rgba(56,189,248,0.08), rgba(232,121,249,0.08))', border: '1px solid rgba(255,255,255,0.08)' }}
 >
 <button
 onClick={handlePrev}
 className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full text-white transition-colors"
 style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}
 aria-label="Previous template"
 >
 <ChevronLeft className={`w-5 h-5 ${isRTL ? 'transform rotate-180' : ''}`} />
 </button>

 <div className="w-full max-w-[220px] sm:max-w-[260px] md:max-w-xs">
 <CardPreview
 card={SAMPLE_CARD_DATA}
 template={currentTemplate.id}
 showPlaceholder={true}
 onLinkClick={() => {}}
 onCardChange={() => {}}
 />
 </div>

 <button
 onClick={handleNext}
 className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full text-white transition-colors"
 style={{ backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}
 aria-label="Next template"
 >
 <ChevronRight className={`w-5 h-5 ${isRTL ? 'transform rotate-180' : ''}`} />
 </button>
 </div>

 {/* Template Info */}
 <div className="mb-6">
 <h3 className="font-bold text-xl sm:text-2xl text-white mb-2">
 {currentTemplate.displayName}
 </h3>
 <p className="text-sm sm:text-base mb-4 leading-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
 {currentTemplate.displayDesc}
 </p>

 {/* Color Preview */}
 <div className="flex gap-3 mb-6">
 {currentTemplate.colors.slice(0, 3).map((color, idx) => (
 <div
 key={idx}
 className="w-8 h-8 rounded-full shadow-md"
 style={{ backgroundColor: color, border: '2px solid rgba(255,255,255,0.2)' }}
 title={color}
 />
 ))}
 </div>
 </div>

 <div className="mt-5 flex items-center justify-center md:hidden text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
 {t.swipeHint}
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </section>

 {/* CTA Section */}
 <section className="py-20" style={{ background: 'linear-gradient(180deg, #0C1429 0%, #1E1B4B 100%)' }}>
 <div className="container mx-auto px-4 md:px-6">
 <div className="max-w-4xl mx-auto text-center">
 <span className="text-sm font-semibold tracking-wider uppercase mb-4 block" style={{ color: '#38BDF8' }}>
 {lang === 'ar' ? 'ابدأ الآن' : 'Start now'}
 </span>
 <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: '#E879F9' }} />
 <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
 {lang === 'ar' ? 'جاهز لإنشاء بطاقتك؟' : 'Ready to Create Your Digital Card?'}
 </h2>
 <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
 {lang === 'ar'
 ? 'اختر قالباً وابدأ في بناء هويتك الرقمية اليوم'
 : 'Pick a template and start building your digital identity today'}
 </p>
 <button
 onClick={() => navigate('/CardBuilder')}
 className="rounded-full px-10 py-4 text-lg font-semibold text-white transition-all duration-300"
 style={{ background: 'linear-gradient(135deg, #38BDF8, #E879F9)', boxShadow: '0 0 30px rgba(232,121,249,0.4)' }}
 >
 {t.explore}
 </button>
 </div>
 </div>
 </section>

 <Footer />
 </div>
 );
}
