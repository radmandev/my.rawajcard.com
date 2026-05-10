import React from'react';
import { useNavigate } from'react-router-dom';
import Navbar from'@/components/landing/Navbar';
import Footer from'@/components/landing/Footer';
import { Button } from'@/components/ui/button';
import { Check } from'lucide-react';
import { createPageUrl } from'@/utils';
import { useAuth } from'@/lib/AuthContext';

const pricingPlans = [
 {
 name:"Free",
 nameAr:"مجاني",
 price:"SAR 0",
 priceAr:"0 ريال",
 pricePeriod:"/month",
 pricePeriodAr:"/شهر",
 description:"Perfect for getting started",
 descriptionAr:"مثالي للبدء",
 features: [
"Up to 2 Digital Cards",
"Basic Templates",
"QR Code",
"Limited Analytics",
"Email Support"
 ],
 featuresAr: [
"حتى بطاقتين رقميتين",
"قوالب أساسية",
"رمز QR",
"تحليلات محدودة",
"دعم البريد الإلكتروني"
 ],
 cta:"Get Started",
 ctaAr:"ابدأ الآن",
 planKey:'free',
 popular: false
 },
 {
 name:"Premium",
 nameAr:"بريميوم",
 price:"SAR 19",
 priceAr:"19 ريال",
 pricePeriod:"/month",
 pricePeriodAr:"/شهر",
 description:"For growing professionals",
 descriptionAr:"للمحترفين المتنامين",
 features: [
"Up to 5 Digital Cards",
"All Templates",
"Advanced Analytics",
"Lead Capture",
"Custom Branding",
"Priority Support",
"Export Data"
 ],
 featuresAr: [
"حتى 5 بطاقات رقمية",
"جميع القوالب",
"تحليلات متقدمة",
"التقاط المتابعة",
"علامة تجارية مخصصة",
"دعم أولوي",
"تصدير البيانات"
 ],
 cta:"Free 3 month trial",
 ctaAr:"تجربة مجانية 3 أشهر",
 planKey:'premium',
 popular: false
 },
 {
 name:"Teams",
 nameAr:"الفرق",
 price:"SAR 49",
 priceAr:"49 ريال",
 pricePeriod:"/month",
 pricePeriodAr:"/شهر",
 description:"For small teams sharing cards",
 descriptionAr:"للفرق الصغيرة التي تشارك البطاقات",
 features: [
"Up to 10 Digital Cards",
"Everything in Premium",
"Team Collaboration",
"Shared Analytics",
"Priority Support"
 ],
 featuresAr: [
"حتى 10 بطاقات رقمية",
"كل شيء في بريميوم",
"تعاون الفريق",
"تحليلات مشتركة",
"دعم أولوي"
 ],
 cta:"Upgrade to Teams",
 ctaAr:"الترقية إلى الفرق",
 planKey:'teams',
 popular: true
 },
 {
 name:"Enterprise",
 nameAr:"مؤسسي",
 price:"SAR 99",
 priceAr:"99 ريال",
 pricePeriod:"/month",
 pricePeriodAr:"/شهر",
 description:"For large teams & organizations",
 descriptionAr:"للفرق والمؤسسات الكبيرة",
 features: [
"Up to 30 Digital Cards",
"Everything in Teams",
"Unlimited Team Members",
"CRM Integration",
"API Access",
"Dedicated Support",
"Custom Integrations",
"SLA Agreement"
 ],
 featuresAr: [
"حتى 30 بطاقة رقمية",
"كل شيء في خطة الفرق",
"أعضاء فريق غير محدودين",
"تكامل CRM",
"وصول API",
"دعم مخصص",
"تكاملات مخصصة",
"اتفاقية مستوى الخدمة"
 ],
 cta:"Upgrade to Enterprise",
 ctaAr:"الترقية إلى المؤسسي",
 planKey:'enterprise',
 popular: false
 }
];

const faqs = [
 {
 question:"Can I change my plan anytime?",
 questionAr:"هل يمكنني تغيير خطتي في أي وقت؟",
 answer:"Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
 answerAr:"نعم، يمكنك ترقية أو خفض خطتك في أي وقت. تدخل التغييرات حيز التنفيذ فوراً."
 },
 {
 question:"Is there a free trial?",
 questionAr:"هل هناك نسخة تجريبية مجانية؟",
 answer:"Yes, eligible new users can get up to a 3-month Premium trial.",
 answerAr:"نعم، يمكن للمستخدمين الجدد المؤهلين الحصول على تجربة بريميوم مجانية لمدة تصل إلى 3 أشهر."
 },
 {
 question:"What happens if I exceed my limits?",
 questionAr:"ماذا يحدث إذا تجاوزت حدودي؟",
 answer:"You'll be notified and can either upgrade your plan or manage your usage.",
 answerAr:"سيتم إخطارك ويمكنك إما ترقية خطتك أو إدارة استخدامك."
 },
 {
 question:"Do you offer refunds?",
 questionAr:"هل تقدمون استرجاع الأموال؟",
 answer:"Yes, we offer a 30-day money-back guarantee on all paid plans.",
 answerAr:"نعم، نقدم ضمان استرجاع الأموال لمدة 30 يوم على جميع الخطط المدفوعة."
 }
];

export default function Pricing() {
 const [language, setLanguage] = React.useState('ar');
 const [expandedFaq, setExpandedFaq] = React.useState(null);
 const navigate = useNavigate();
 const { isAuthenticated } = useAuth();

 const handleUpgradeClick = () => {
 const dashboardPricingTarget =`${createPageUrl('Dashboard')}?openPricing=1`;

 if (!isAuthenticated) {
 navigate(`${createPageUrl('Login')}?next=${encodeURIComponent(dashboardPricingTarget)}`);
 return;
 }

 navigate(dashboardPricingTarget);
 };

 React.useEffect(() => {
 const handleDirChange = () => {
 setLanguage(document.documentElement.dir ==='rtl' ?'ar' :'en');
 };
 
 handleDirChange();
 
 const observer = new MutationObserver(handleDirChange);
 observer.observe(document.documentElement, { attributes: true });
 
 return () => observer.disconnect();
 }, []);

 return (
 <div className="min-h-screen" style={{ backgroundColor: '#0C1429' }}>
 <Navbar />

 {/* Hero Section */}
 <section className="public-subpage-offset pb-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#0C1429' }}>
 <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,121,249,0.12) 0%, rgba(56,189,248,0.08) 40%, transparent 70%)' }} />
 <div className="container mx-auto max-w-4xl text-center">
 <span className="inline-block text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#E879F9' }}>
 {language === 'ar' ? 'الأسعار' : 'Pricing'}
 </span>
 <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
 {language === 'ar' ? 'خطط التسعير البسيطة والشفافة' : 'Simple, Transparent Pricing'}
 </h1>
 <p className="text-xl mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
 {language === 'ar'
 ? 'اختر الخطة المثالية لاحتياجاتك'
 : 'Choose the perfect plan for your needs'}
 </p>
 </div>
 </section>

 {/* Pricing Cards */}
 <section className="py-20 px-4" style={{ backgroundColor: '#0C1429' }}>
 <div className="container mx-auto max-w-6xl">
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {pricingPlans.map((plan, index) => (
 <div
 key={index}
 className="relative rounded-2xl transition-all p-8"
 style={plan.popular
 ? { backgroundColor: '#1E1B4B', border: '2px solid #38BDF8', boxShadow: '0 0 40px rgba(56,189,248,0.2)', transform: 'scale(1.05)' }
 : { backgroundColor: '#1E1B4B', border: '1px solid rgba(255,255,255,0.1)' }
 }
 >
 {plan.popular && (
 <div
 className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-white px-4 py-1 rounded-full text-sm font-semibold"
 style={{ background: 'linear-gradient(135deg, #38BDF8, #E879F9)' }}
 >
 {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
 </div>
 )}

 <h3 className="text-2xl font-bold text-white mb-2">
 {language === 'ar' ? plan.nameAr : plan.name}
 </h3>
 <p className="mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
 {language === 'ar' ? plan.descriptionAr : plan.description}
 </p>

 <div className="mb-8">
 <span className="text-4xl font-bold" style={{ color: plan.popular ? '#38BDF8' : '#fff' }}>
 {language === 'ar' ? plan.priceAr : plan.price}
 </span>
 {plan.pricePeriod && (
 <span className="ml-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
 {language === 'ar' ? plan.pricePeriodAr : plan.pricePeriod}
 </span>
 )}
 </div>

 <Button
 onClick={handleUpgradeClick}
 className="w-full mb-8 rounded-lg py-2 font-semibold text-white border-0"
 style={plan.popular || plan.planKey === 'enterprise'
 ? { background: 'linear-gradient(135deg, #38BDF8, #E879F9)', boxShadow: '0 0 20px rgba(56,189,248,0.3)' }
 : plan.planKey === 'premium'
 ? { background: 'rgba(56,189,248,0.2)', border: '1px solid rgba(56,189,248,0.4)' }
 : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }
 }
 >
 {plan.planKey === 'premium'
 ? (language === 'ar' ? 'جرب مجاناً 3 أشهر ' : 'Free 3 month trial')
 : (language === 'ar' ? plan.ctaAr : plan.cta)
 }
 </Button>

 <ul className="space-y-4">
 {(language === 'ar' ? plan.featuresAr : plan.features).map((feature, idx) => (
 <li key={idx} className="flex items-start gap-3">
 <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: plan.popular ? '#38BDF8' : '#E879F9' }} />
 <span style={{ color: 'rgba(255,255,255,0.7)' }}>{feature}</span>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Trial Note */}
 <div
 className="text-center text-base font-semibold mb-4 py-4"
 style={{ color: '#38BDF8' }}
 >
 {language === 'ar'
 ? 'جرب جميع ميزات بريميوم مجاناً لمدة 3 أشهر — لا حاجة لبطاقة دفع'
 : 'Try all Premium features free for 3 months — no credit card required'}
 </div>

 {/* FAQ Section */}
 <section className="py-20 px-4" style={{ background: 'linear-gradient(180deg, #0C1429 0%, #1E1B4B 100%)' }}>
 <div className="container mx-auto max-w-4xl">
 <h2 className="text-3xl font-bold text-white mb-12 text-center">
 {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
 </h2>

 <div className="space-y-4">
 {faqs.map((faq, index) => (
 <div
 key={index}
 className="rounded-lg overflow-hidden"
 style={{ border: '1px solid rgba(56,189,248,0.2)', backgroundColor: 'rgba(255,255,255,0.03)' }}
 >
 <button
 onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
 className="w-full px-6 py-4 text-left font-semibold text-white transition-colors flex justify-between items-center"
 style={{ backgroundColor: expandedFaq === index ? 'rgba(56,189,248,0.08)' : 'transparent' }}
 >
 {language === 'ar' ? faq.questionAr : faq.question}
 <span
 className={`transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}
 style={{ color: '#38BDF8' }}
 >
 ▼
 </span>
 </button>
 {expandedFaq === index && (
 <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(56,189,248,0.15)', backgroundColor: 'rgba(56,189,248,0.04)' }}>
 <p style={{ color: 'rgba(255,255,255,0.65)' }}>
 {language === 'ar' ? faq.answerAr : faq.answer}
 </p>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 </section>

 <Footer />
 </div>
 );
}