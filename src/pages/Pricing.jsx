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
 <div className="min-h-screen bg-indigo-950/60">
 <Navbar />
 
 {/* Hero Section */}
 <section className="public-subpage-offset pb-20 px-4">
 <div className="container mx-auto max-w-4xl text-center">
 <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
 {language ==='ar' ?'خطط التسعير البسيطة والشفافة' :'Simple, Transparent Pricing'}
 </h1>
 <p className="text-xl text-slate-600 mb-8">
 {language ==='ar' 
 ?'اختر الخطة المثالية لاحتياجاتك' 
 :'Choose the perfect plan for your needs'}
 </p>
 </div>
 </section>

 {/* Pricing Cards */}
 <section className="py-20 px-4">
 <div className="container mx-auto max-w-6xl">
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {pricingPlans.map((plan, index) => (
 <div
 key={index}
 className={`relative rounded-2xl transition-all ${
 plan.popular
 ?'ring-2 ring-cyan-500 shadow-2xl shadow-cyan-500/20 scale-105'
 :'border border-slate-200'
 } bg-indigo-950/60 p-8`}
 >
 {plan.popular && (
 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
 {language ==='ar' ?'الأكثر شعبية' :'Most Popular'}
 </div>
 )}

 <h3 className="text-2xl font-bold text-slate-900 mb-2">
 {language ==='ar' ? plan.nameAr : plan.name}
 </h3>
 <p className="text-slate-600 mb-6">
 {language ==='ar' ? plan.descriptionAr : plan.description}
 </p>

 <div className="mb-8">
 <span className="text-4xl font-bold text-slate-900">
 {language ==='ar' ? plan.priceAr : plan.price}
 </span>
 {plan.pricePeriod && (
 <span className="text-slate-600 ml-2">
 {language ==='ar' ? plan.pricePeriodAr : plan.pricePeriod}
 </span>
 )}
 </div>

 <Button
 onClick={handleUpgradeClick}
 className={`w-full mb-8 rounded-lg py-2 font-semibold ${
 plan.popular
 ?'bg-cyan-600 hover:bg-cyan-700 text-white'
 : plan.planKey ==='enterprise'
 ?'bg-purple-600 hover:bg-purple-700 text-white'
 : plan.planKey ==='premium'
 ?'bg-cyan-500 hover:bg-cyan-600 text-white'
 :'bg-slate-100 hover:bg-slate-200 text-slate-900'
 }`}
 >
 {plan.planKey ==='premium'
 ? (language ==='ar' ?'تجربة مجانية 3 أشهر (بدون بطاقة دفع)' :'Free 3 month trial (no credit card)')
 : (language ==='ar' ? plan.ctaAr : plan.cta)
 }
 </Button>

 <ul className="space-y-4">
 {(language ==='ar' ? plan.featuresAr : plan.features).map((feature, idx) => (
 <li key={idx} className="flex items-start gap-3">
 <Check className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
 <span className="text-slate-600">{feature}</span>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Trial Note */}
 <div className="text-center text-base text-cyan-700 font-semibold mb-4">
 {language ==='ar'
 ?'جرب جميع ميزات بريميوم مجاناً لمدة 3 أشهر — لا حاجة لبطاقة دفع'
 :'Try all Premium features free for 3 months — no credit card required'}
 </div>
 {/* FAQ Section */}
 <section className="py-20 px-4 bg-slate-50">
 <div className="container mx-auto max-w-4xl">
 <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
 {language ==='ar' ?'الأسئلة الشائعة' :'Frequently Asked Questions'}
 </h2>

 <div className="space-y-4">
 {faqs.map((faq, index) => (
 <div
 key={index}
 className="border border-slate-200 rounded-lg overflow-hidden bg-indigo-950/60"
 >
 <button
 onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
 className="w-full px-6 py-4 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors flex justify-between items-center"
 >
 {language ==='ar' ? faq.questionAr : faq.question}
 <span className={`text-cyan-600 transition-transform ${expandedFaq === index ?'rotate-180' :''}`}>
 ▼
 </span>
 </button>
 {expandedFaq === index && (
 <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
 <p className="text-slate-600">
 {language ==='ar' ? faq.answerAr : faq.answer}
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