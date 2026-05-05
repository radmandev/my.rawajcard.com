import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';

/**
 * Minimal cookie-consent banner.
 *
 * – Shows only when `rawaj_cookie_consent` is not yet set.
 * – Accept  → sets flag to "true"  + fires deferred tracking scripts.
 * – Decline → sets flag to "false" (trackers already guarded in index.html).
 * – Once a choice is made the banner disappears permanently (per browser).
 */
export default function CookieConsent() {
  const { isRTL } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('rawaj_cookie_consent') === null) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem('rawaj_cookie_consent', 'true');
    setVisible(false);
    // Fire tracking scripts that were deferred waiting for consent
    if (typeof window.loadTrackingScripts === 'function') {
      window.loadTrackingScripts();
    }
  };

  const decline = () => {
    localStorage.setItem('rawaj_cookie_consent', 'false');
    setVisible(false);
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed bottom-0 inset-x-0 z-[9999] bg-slate-900/95 backdrop-blur border-t border-slate-700 px-4 py-4 md:py-3 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 shadow-2xl"
    >
      <p className="text-sm text-slate-300 flex-1">
        {isRTL
          ? 'نستخدم ملفات تعريف الارتباط لتحليل الأداء وتحسين تجربتك. يمكنك الموافقة أو الرفض.'
          : 'We use cookies to analyse performance and improve your experience. You can accept or decline.'}
      </p>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={decline}
          className="px-4 py-1.5 text-sm rounded border border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
        >
          {isRTL ? 'رفض' : 'Decline'}
        </button>
        <button
          onClick={accept}
          className="px-4 py-1.5 text-sm rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
        >
          {isRTL ? 'موافق' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
