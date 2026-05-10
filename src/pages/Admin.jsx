import React from'react';
import { useLanguage } from'@/components/shared/LanguageContext';
import { Card } from'@/components/ui/card';
import { Shield } from'lucide-react';
import AdminTemplates from'@/components/admin/AdminTemplates';
import AdminClients from'@/components/admin/AdminClients';
import AdminCards from'@/components/admin/AdminCards';
import AdminSettings from'@/components/admin/AdminSettings';
import AdminCustomizationRequests from'@/components/admin/AdminCustomizationRequests';
import AdminProducts from'@/components/admin/AdminProducts';
import AdminOrders from'@/components/admin/AdminOrders';
import AdminAnalytics from'@/components/admin/AdminAnalyticsReal';
import { api } from'@/api/supabaseAPI';
import { useQuery } from'@tanstack/react-query';
import { useNavigate, useSearchParams } from'react-router-dom';

const sectionTitles = {
 analytics: { ar:'التحليلات', en:'Analytics' },
 orders: { ar:'الطلبات', en:'Orders' },
 products: { ar:'المنتجات', en:'Products' },
 templates: { ar:'القوالب', en:'Templates' },
 clients: { ar:'العملاء', en:'Clients' },
 cards: { ar:'البطاقات', en:'Cards' },
 requests: { ar:'طلبات التخصيص', en:'Customization Requests' },
 settings: { ar:'الإعدادات', en:'Settings' },
};

export default function Admin() {
 const { isRTL } = useLanguage();
 const navigate = useNavigate();
 const [searchParams] = useSearchParams();
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
 <div className="w-8 h-8 border-4 border-slate-200 border-t-cyan-600 rounded-full animate-spin" />
 </div>
 );
 }

 if (!user) return null;

 const isAdmin = user.role ==='admin';

 if (!isAdmin) {
 return (
 <div className="flex items-center justify-center min-h-screen">
 <Card className="p-8 text-center max-w-md">
 <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
 <h1 className="text-2xl font-bold text-slate-900 mb-2">
 {isRTL ?'وصول مرفوض' :'Access Denied'}
 </h1>
 <p className="text-slate-500 mb-4">
 {isRTL ?'يتطلب هذا القسم صلاحيات المسؤول' :'This section requires admin privileges'}
 </p>
 <button
 onClick={() => navigate('/')}
 className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
 >
 {isRTL ?'العودة للرئيسية' :'Back to Home'}
 </button>
 </Card>
 </div>
 );
 }

 const title = sectionTitles[activeSection] || sectionTitles.analytics;

 return (
 <div className="space-y-6">
 {/* Section Header */}
 <div className="flex items-center gap-3">
 <Shield className="h-6 w-6 text-violet-400" />
 <div>
 <h1 className="text-2xl font-bold text-slate-100">
 {isRTL ? title.ar : title.en}
 </h1>
 <p className="text-slate-400 text-sm">
 {isRTL ?'لوحة تحكم المسؤول' :'Admin Dashboard'}
 </p>
 </div>
 </div>

 {/* Section Content */}
 {activeSection ==='analytics' && <AdminAnalytics />}
 {activeSection ==='orders' && <AdminOrders />}
 {activeSection ==='products' && <AdminProducts />}
 {activeSection ==='templates' && <AdminTemplates />}
 {activeSection ==='clients' && <AdminClients />}
 {activeSection ==='cards' && <AdminCards />}
 {activeSection ==='requests' && <AdminCustomizationRequests />}
 {activeSection ==='settings' && <AdminSettings />}
 </div>
 );
}