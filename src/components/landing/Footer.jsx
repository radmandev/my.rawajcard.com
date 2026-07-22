import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import LoginModal from '@/components/auth/LoginModal';

export default function Footer({ showCta = true }) {
  const { isRTL } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  const footerCtaLabel = isAuthenticated
    ? (isRTL ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard')
    : (isRTL ? 'ابدأ مجاناً' : 'Get Started Free');

  const handleCta = () => {
    if (isAuthenticated) {
      navigate(createPageUrl('Dashboard'));
    } else {
      setLoginOpen(true);
    }
  };

  return (
    <>
      <footer style={{ background: '#0a0a0a' }} className="text-white">
        {/* Top CTA strip */}
        {showCta && (
          <div className="border-b border-white/10 py-10">
            <div className="container mx-auto px-4 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black mb-1">{isRTL ? 'جاهز تبدأ؟' : 'Ready to start?'}</h3>
                <p className="text-slate-400 text-sm">{isRTL ? 'انشئ كرتك الرقمي مجاناً الآن' : 'Create your digital card for free today'}</p>
              </div>
              <button
                onClick={handleCta}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white font-bold px-8 py-3.5 rounded-2xl transition-all"
              >
                {footerCtaLabel}
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main footer */}
        <div className="container mx-auto px-4 md:px-10 py-16">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <img src="/rawajcard-logo1.png" alt="Rawajcard" className="h-12 w-12 object-contain" />
                <div className="text-2xl font-black text-white">Rawajcard</div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-5">
                {isRTL ? 'الجيل الجديد من بطاقات التعارف الذكية في عالم الأعمال' : 'The next generation of smart business cards'}
              </p>
              <div className="flex gap-3">
                {[
                  { href: 'https://www.facebook.com/rawajcard', label: '𝒻' },
                  { href: 'https://twitter.com/rawajcard', label: '𝓍' },
                  { href: 'https://www.instagram.com/rawajcard', label: '𝒾𝑔' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 bg-white/5 hover:bg-cyan-600 rounded-full flex items-center justify-center text-sm transition-colors">
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                titleAr: 'روابط مهمة', titleEn: 'Quick Links',
                links: [
                  { labelAr: 'خصص كرتك الآن', labelEn: 'Customize your card', href: '/customize' },
                  { labelAr: 'حسابي', labelEn: 'My Account', href: '/Settings' },
                  { labelAr: 'طلبياتي', labelEn: 'My Orders', href: '/MyOrders' },
                  { labelAr: 'جميع المنتجات', labelEn: 'All Products', href: '/products' },
                  { labelAr: 'الدليل والمقالات', labelEn: 'Guides', href: '/guides' },
                ],
              },
              {
                titleAr: 'معلومات مهمة', titleEn: 'Info',
                links: [
                  { labelAr: 'سياسة التبديل والاسترجاع', labelEn: 'Returns Policy', href: '/Return' },
                  { labelAr: 'سياسة الخصوصية', labelEn: 'Privacy Policy', href: '/PrivacyPolicy' },
                  { labelAr: 'وسائل الدفع', labelEn: 'Payment Methods', href: '/PaymentsPolicy' },
                ],
              },
              {
                titleAr: 'تواصل معنا', titleEn: 'Contact Us',
                links: [],
                contact: true,
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-black text-white mb-5 text-base">{isRTL ? col.titleAr : col.titleEn}</h4>
                {col.contact ? (
                  <div className="space-y-4 text-sm text-slate-400">
                    <a href="mailto:contact@rawajcard.com" className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      contact@rawajcard.com
                    </a>
                    <a href="https://wa.me/966531607223" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                      <MessageCircle className="h-4 w-4 flex-shrink-0" />
                      {isRTL ? 'واتساب: 966531607223+' : 'WhatsApp: +966531607223'}
                    </a>
                    <a href="tel:966531607223" className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      {isRTL ? 'اتصل بنا: 966531607223+' : 'Call: +966531607223'}
                    </a>
                  </div>
                ) : (
                  <ul className="space-y-3 text-sm text-slate-400">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <Link to={link.href} className="hover:text-cyan-400 transition-colors">
                          {isRTL ? link.labelAr : link.labelEn}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
          {isRTL
            ? `جميع الحقوق محفوظة © ${new Date().getFullYear()} رواج كارد — تقنية NFC الذكية`
            : `All rights reserved © ${new Date().getFullYear()} Rawajcard — Smart NFC Technology`}
        </div>
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}