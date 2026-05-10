import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Building2, Users, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/supabaseAPI';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { getUserSubscriptions, isEligibleForIntroTrial } from '@/lib/subscriptionEligibility';

const PLANS = [
  {
    key: 'free',
    icon: Zap,
    name_en: 'Free',
    name_ar: 'مجاني',
    price_en: 'SAR 0',
    price_ar: '0 ريال',
    period_en: '/month',
    period_ar: '/شهر',
    gradient: 'from-slate-400 to-slate-600',
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
    checkColor: 'text-slate-400',
    features_en: ['Up to 2 Digital Cards','Basic Templates','QR Code','Limited Analytics','Email Support'],
    features_ar: ['حتى بطاقتين رقميتين','قوالب أساسية','رمز QR','تحليلات محدودة','دعم البريد الإلكتروني'],
  },
  {
    key: 'premium',
    icon: Sparkles,
    name_en: 'Premium',
    name_ar: 'بريميوم',
    price_en: 'SAR 19',
    price_ar: '19 ريال',
    period_en: '/month',
    period_ar: '/شهر',
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    checkColor: 'text-cyan-500',
    btnClass: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-200/60',
    features_en: ['Up to 5 Digital Cards','All Templates','Advanced Analytics','Lead Capture','Custom Branding','Priority Support','Export Data'],
    features_ar: ['حتى 5 بطاقات رقمية','جميع القوالب','تحليلات متقدمة','التقاط المتابعة','علامة تجارية مخصصة','دعم أولوي','تصدير البيانات'],
  },
  {
    key: 'teams',
    icon: Users,
    name_en: 'Teams',
    name_ar: 'الفرق',
    price_en: 'SAR 49',
    price_ar: '49 ريال',
    period_en: '/month',
    period_ar: '/شهر',
    popular: true,
    gradient: 'from-fuchsia-500 to-purple-600',
    iconBg: 'bg-fuchsia-100',
    iconColor: 'text-fuchsia-600',
    checkColor: 'text-fuchsia-500',
    btnClass: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white shadow-fuchsia-200/60',
    features_en: ['Up to 10 Digital Cards','Everything in Premium','Team Collaboration','Shared Analytics','Priority Support'],
    features_ar: ['حتى 10 بطاقات رقمية','كل شيء في بريميوم','تعاون الفريق','تحليلات مشتركة','دعم أولوي'],
  },
  {
    key: 'enterprise',
    icon: Building2,
    name_en: 'Enterprise',
    name_ar: 'مؤسسي',
    price_en: 'SAR 99',
    price_ar: '99 ريال',
    period_en: '/month',
    period_ar: '/شهر',
    gradient: 'from-violet-500 to-purple-700',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    checkColor: 'text-violet-500',
    btnClass: 'bg-gradient-to-r from-violet-500 to-purple-700 hover:from-violet-400 hover:to-purple-600 text-white shadow-violet-200/60',
    features_en: ['Up to 30 Digital Cards','Everything in Teams','Unlimited Team Members','CRM Integration','API Access','Dedicated Support','Custom Integrations','SLA Agreement'],
    features_ar: ['حتى 30 بطاقة رقمية','كل شيء في خطة الفرق','أعضاء فريق غير محدودين','تكامل CRM','وصول API','دعم مخصص','تكاملات مخصصة','اتفاقية مستوى الخدمة'],
  },
];

export default function SubscriptionDialog({ open, onOpenChange, onSelectPlan, forcedCurrentPlan, title, savingPlan }) {
  const { isRTL } = useLanguage();
  const adminMode = !!onSelectPlan;
  const [checkoutPlan, setCheckoutPlan] = React.useState(null);

  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const me = await api.auth.me();
      const subscriptions = await getUserSubscriptions(api, me);
      return subscriptions[0] || { plan: 'free' };
    },
    enabled: open && !adminMode,
  });

  const { data: me } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => api.auth.me(),
    enabled: open,
  });

  const { data: earlyBirdOffer } = useQuery({
    queryKey: ['premium-early-bird-offer-public'],
    queryFn: () => api.appSettings.get('premium_early_bird_offer'),
    enabled: open,
  });

  const { data: subscriptionHistory = [] } = useQuery({
    queryKey: ['subscription-trial-eligibility', me?.id || me?.email || 'guest'],
    queryFn: async () => getUserSubscriptions(api, me),
    enabled: open && !adminMode && !!me,
  });

  const currentPlan = forcedCurrentPlan ?? subscription?.plan ?? 'free';
  const isTrialEligible = !adminMode && isEligibleForIntroTrial({
    me,
    subscriptions: subscriptionHistory,
    newUserWindowDays: Number(earlyBirdOffer?.new_user_window_days || 30),
  });

  const getPlanCta = (plan) => {
    if (isTrialEligible) {
      if (plan.key === 'premium') return isRTL ? 'تجربة 90 يوم مجاناً' : 'Start 90-day Free Trial';
      if (plan.key === 'teams') return isRTL ? 'تجربة 14 يوم مجاناً' : 'Start 14-day Free Trial';
      if (plan.key === 'enterprise') return isRTL ? 'تجربة 14 يوم مجاناً' : 'Start 14-day Free Trial';
    }
    return isRTL ? `الترقية إلى ${plan.name_ar}` : `Upgrade to ${plan.name_en}`;
  };

  const handleUpgrade = async (planKey) => {
    if (adminMode) {
      onSelectPlan(planKey);
    } else {
      if (planKey === 'free') return;
      setCheckoutPlan(planKey);
      try {
        const result = await api.functions.invoke('createStripeCheckout', { plan: planKey });
        if (result?.url) {
          onOpenChange(false);
          window.location.href = result.url;
          return;
        }
        throw new Error(result?.error || 'No checkout URL returned');
      } catch (err) {
        const msg = err?.message || '';
        let display = isRTL ? 'حدث خطأ في الدفع، حاول مرة أخرى' : 'Payment error, please try again';
        if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('401')) {
          display = isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please log in and try again';
        } else if (msg) {
          display = `Server error: ${msg}`;
        }
        toast.error(display, { duration: 6000 });
      } finally {
        setCheckoutPlan(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        'p-0 gap-0 border-0 shadow-2xl overflow-hidden bg-white',
        'fixed left-0 right-0 bottom-0 top-auto translate-x-0 translate-y-0 w-full max-w-full rounded-t-3xl rounded-b-none',
        'sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:right-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:max-w-5xl sm:w-[95vw]'
      )}>
        <div className="flex flex-col bg-white" style={{ maxHeight: 'calc(100dvh - 32px)' }}>

          {/* ── Header ── */}
          <div className="relative flex-shrink-0 px-5 pt-3 pb-4 border-b border-slate-100">
            <div className="sm:hidden w-10 h-1 rounded-full bg-slate-200 mx-auto mb-3" />
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-base sm:text-xl font-bold text-slate-900 pr-8">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex-shrink-0">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </span>
                {title || (isRTL ? 'اختر خطتك' : 'Choose Your Plan')}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500 mt-1 pr-8">
                {adminMode
                  ? (isRTL ? 'اختر الخطة للعميل' : 'Select a plan for this client')
                  : (isRTL ? 'ترقِّ للحصول على مزيد من الميزات والإمكانيات' : 'Upgrade for more features and capabilities')}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* ── Plans ──
               Mobile  : horizontal snap scroll — cards are ~72vw wide so user sees the next peeking
               Desktop : CSS grid 4 equal columns                                                     */}
          <div className="flex-1 min-h-0 overflow-y-auto sm:overflow-visible">
            <div
              className="flex gap-3 px-4 py-5 overflow-x-auto snap-x snap-mandatory sm:grid sm:grid-cols-4 sm:gap-4 sm:overflow-x-visible sm:snap-none sm:px-5 sm:py-5"
              style={{ scrollbarWidth: 'none' }}
            >
              {PLANS.map((plan) => {
                const Icon = plan.icon;
                const isCurrent = currentPlan === plan.key;
                const isPopular = plan.popular;
                const isLoading = adminMode ? savingPlan === plan.key : checkoutPlan === plan.key;

                return (
                  <div
                    key={plan.key}
                    className={cn(
                      'relative flex-shrink-0 w-[74vw] snap-center flex flex-col rounded-2xl border overflow-hidden transition-all duration-200',
                      'sm:w-auto sm:flex-shrink sm:snap-align-none',
                      isPopular
                        ? 'border-fuchsia-300 ring-2 ring-fuchsia-200 shadow-lg shadow-fuchsia-100'
                        : isCurrent
                          ? 'border-cyan-300 ring-1 ring-cyan-200 shadow-sm'
                          : 'border-slate-200 shadow-sm hover:border-slate-300'
                    )}
                  >
                    {/* Gradient top bar */}
                    <div className={cn('h-1 w-full bg-gradient-to-r flex-shrink-0', plan.gradient)} />

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 px-4 pt-3 min-h-[28px]">
                      {isPopular && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200">
                          ⭐ {isRTL ? 'الأكثر شعبية' : 'Most Popular'}
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          ✓ {isRTL ? 'الحالية' : 'Current'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col flex-1 px-4 pt-3 pb-4 gap-3">
                      {/* Icon + Name + Price */}
                      <div>
                        <div className={cn('inline-flex items-center justify-center w-9 h-9 rounded-xl mb-2.5', plan.iconBg)}>
                          <Icon className={cn('h-5 w-5', plan.iconColor)} />
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{isRTL ? plan.name_ar : plan.name_en}</p>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className={cn('text-xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent', plan.gradient)}>
                            {isRTL ? plan.price_ar : plan.price_en}
                          </span>
                          {plan.period_en && (
                            <span className="text-[11px] text-slate-400">{isRTL ? plan.period_ar : plan.period_en}</span>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="flex-1 space-y-1.5">
                        {(isRTL ? plan.features_ar : plan.features_en).slice(0, 5).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-600">
                            <Check className={cn('h-3 w-3 flex-shrink-0 mt-0.5', plan.checkColor)} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <div className="pt-1">
                        {isCurrent && !adminMode ? (
                          <Button disabled variant="outline" className="w-full h-9 text-xs rounded-xl border-slate-200 text-slate-400">
                            {isRTL ? 'خطتك الحالية' : 'Current Plan'}
                          </Button>
                        ) : plan.key === 'free' && !adminMode ? (
                          <Button disabled variant="outline" className="w-full h-9 text-xs rounded-xl border-slate-100 text-slate-300">
                            {isRTL ? 'مجاني دائماً' : 'Always Free'}
                          </Button>
                        ) : plan.key === 'free' && adminMode ? (
                          <Button
                            variant={isCurrent ? 'outline' : 'ghost'}
                            className="w-full h-9 text-xs rounded-xl border-slate-300"
                            disabled={savingPlan === 'free'}
                            onClick={() => handleUpgrade('free')}
                          >
                            {savingPlan === 'free' && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                            {isCurrent ? (isRTL ? '✓ الحالية' : '✓ Current') : (isRTL ? 'تعيين مجاني' : 'Set Free')}
                          </Button>
                        ) : (
                          <Button
                            className={cn('w-full h-9 text-xs rounded-xl font-semibold shadow-sm', plan.btnClass,
                              isCurrent && adminMode && 'ring-2 ring-offset-1 ring-fuchsia-400 opacity-80'
                            )}
                            disabled={isLoading}
                            onClick={() => handleUpgrade(plan.key)}
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            ) : plan.key === 'enterprise' ? (
                              <Building2 className="h-3.5 w-3.5 mr-1.5" />
                            ) : plan.key === 'teams' ? (
                              <Users className="h-3.5 w-3.5 mr-1.5" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                            )}
                            {adminMode
                              ? (isCurrent
                                  ? (isRTL ? '✓ الحالية' : '✓ Current')
                                  : (isRTL ? `تعيين ${plan.name_ar}` : `Set ${plan.name_en}`))
                              : getPlanCta(plan)}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Scroll hint dots — mobile only */}
            <div className="flex justify-center gap-1.5 pb-3 sm:hidden">
              {PLANS.map((plan) => (
                <div key={plan.key} className={cn('h-1.5 rounded-full transition-all bg-slate-200', currentPlan === plan.key && 'w-4 bg-cyan-500 w-3')} />
              ))}
            </div>
          </div>

          {/* ── Footer ── */}
          {!adminMode && (
            <div className="flex-shrink-0 px-5 py-3 border-t border-slate-100 bg-slate-50/80 text-center">
              <p className="text-[11px] text-slate-400">
                {isRTL
                  ? '🔒 المدفوعات آمنة ومشفرة عبر Stripe • يمكنك الإلغاء في أي وقت'
                  : '🔒 Payments are secure & encrypted via Stripe • Cancel anytime'}
              </p>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
