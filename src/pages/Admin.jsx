import React from 'react';
import { useLanguage } from '@/components/shared/LanguageContext';
import { Shield, BarChart2, ShoppingBag, Package, Layout, Users, CreditCard, Wrench, Settings } from 'lucide-react';
import AdminTemplates from '@/components/admin/AdminTemplates';
import AdminClients from '@/components/admin/AdminClients';
import AdminCards from '@/components/admin/AdminCards';
import AdminSettings from '@/components/admin/AdminSettings';
import AdminCustomizationRequests from '@/components/admin/AdminCustomizationRequests';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminAnalytics from '@/components/admin/AdminAnalyticsReal';
import { api } from '@/api/supabaseAPI';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SECTIONS = [
  { key: 'analytics', en: 'Analytics',     ar: 'التحليلات',     icon: BarChart2 },
  { key: 'orders',    en: 'Orders',         ar: 'الطلبات',       icon: ShoppingBag },
  { key: 'products',  en: 'Products',       ar: 'المنتجات',      icon: Package },
  { key: 'templates', en: 'Templates',      ar: 'القوالب',       icon: Layout },
  { key: 'clients',   en: 'Clients',        ar: 'العملاء',       icon: Users },
  { key: 'cards',     en: 'Cards',          ar: 'البطاقات',      icon: CreditCard },
  { key: 'requests',  en: 'Customization',  ar: 'طلبات التخصيص', icon: Wrench },
  { key: 'settings',  en: 'Settings',       ar: 'الإعدادات',     icon: Settings },
];

export default function Admin() {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'analytics';

  const { data: user, isLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const authenticated = await api.auth.isAuthenticated();
      if (!authenticated) { navigate('/login'); return null; }
      return api.auth.me();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-white/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  if (user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-indigo-950/60 rounded-2xl border border-white/10 p-10 text-center max-w-md shadow-sm">
          <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-7 w-7 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            {isRTL ? 'وصول مرفوض' : 'Access Denied'}
          </h1>
          <p className="text-slate-400 text-sm mb-5">
            {isRTL ? 'يتطلب هذا القسم صلاحيات المسؤول' : 'This section requires admin privileges'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors"
          >
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  const activeInfo = SECTIONS.find(s => s.key === activeSection) || SECTIONS[0];
  const ActiveIcon = activeInfo.icon;
  const setSection = (key) => setSearchParams({ section: key });

  return (
    <div className="min-h-full space-y-5">

      {/* Page header — dark gradient matching user Dashboard */}
      <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0C1429_0%,#1E1B4B_52%,#0C1429_100%)] p-6 border border-white/10 shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-600 rounded-xl flex items-center justify-center shadow">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                {isRTL ? 'لوحة تحكم المسؤول' : 'Admin Dashboard'}
              </h1>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ActiveIcon className="h-4 w-4 text-cyan-400" />
            <span className="text-sm font-medium text-slate-300">
              {isRTL ? activeInfo.ar : activeInfo.en}
            </span>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="bg-indigo-950/60 border border-white/10 rounded-2xl p-2">
        <div className="flex flex-wrap gap-1">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const active = activeSection === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {isRTL ? s.ar : s.en}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active section */}
      <div className="space-y-4">
        {activeSection === 'analytics' && <AdminAnalytics />}
        {activeSection === 'orders'    && <AdminOrders />}
        {activeSection === 'products'  && <AdminProducts />}
        {activeSection === 'templates' && <AdminTemplates />}
        {activeSection === 'clients'   && <AdminClients />}
        {activeSection === 'cards'     && <AdminCards />}
        {activeSection === 'requests'  && <AdminCustomizationRequests />}
        {activeSection === 'settings'  && <AdminSettings />}
      </div>

    </div>
  );
}
