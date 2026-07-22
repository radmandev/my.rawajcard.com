import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Seo from '@/components/shared/Seo';
import { useLanguage } from '@/components/shared/LanguageContext';
import { guidesData } from '@/components/shared/guidesData';
import { BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Guides() {
  const { isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#060D1F]">
      <Seo
        title={isRTL ? 'دليل بطاقات الأعمال الذكية NFC | مقالات رواج كارد' : 'NFC Business Card Guides | Rawajcard'}
        description={isRTL
          ? 'مقالات ودلائل عملية عن بطاقات الأعمال الذكية NFC: كيف تعمل، كيف تصنع بطاقة رقمية، والفرق بينها وبين رمز QR.'
          : 'Practical guides on NFC business cards: how the technology works, how to build a digital card, and NFC vs. QR compared.'}
        path="/guides"
      />
      <Navbar />

      <div className="relative public-subpage-offset pb-16 text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1429] via-[#0D1B3E] to-[#060D1F] pointer-events-none overflow-hidden" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            {isRTL ? 'الدليل' : 'Guides'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {isRTL ? 'كل ما تحتاج معرفته عن بطاقات الأعمال الذكية' : 'Everything you need to know about smart business cards'}
          </h1>
          <p className="text-slate-400 text-lg">
            {isRTL ? 'مقالات عملية عن تقنية NFC وبطاقات الأعمال الرقمية' : 'Practical guides on NFC technology and digital business cards'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-4">
        {guidesData.map((guide) => (
          <Link
            key={guide.slug}
            to={`/guides/${guide.slug}`}
            className="block rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7 hover:border-sky-500/30 hover:bg-white/[0.07] transition-colors"
          >
            <h2 className="text-xl font-semibold text-white mb-2">
              {isRTL ? guide.title_ar : guide.title_en}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              {isRTL ? guide.excerpt_ar : guide.excerpt_en}
            </p>
            <span className="inline-flex items-center gap-1.5 text-sky-400 text-sm font-medium">
              {isRTL ? 'اقرأ المقال' : 'Read the guide'}
              <ArrowIcon className="w-3.5 h-3.5" />
            </span>
          </Link>
        ))}
      </div>

      <Footer />
    </div>
  );
}
