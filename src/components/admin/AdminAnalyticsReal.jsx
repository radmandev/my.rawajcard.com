// @ts-nocheck
import React, { useMemo, useState } from'react';
import { useQuery } from'@tanstack/react-query';
import { format, startOfDay, subDays } from'date-fns';
import {
 Area,
 AreaChart,
 Bar,
 BarChart,
 CartesianGrid,
 ResponsiveContainer,
 Tooltip as ReTooltip,
 XAxis,
 YAxis,
} from'recharts';
import {
 AlertTriangle,
 CreditCard,
 Eye,
 Globe,
 LayoutDashboard,
 MousePointerClick,
 QrCode,
 ShoppingCart,
 UserRoundPlus,
 Users,
 Wallet,
} from'lucide-react';

import { api } from'@/api/supabaseAPI';
import { useLanguage } from'@/components/shared/LanguageContext';
import { Badge } from'@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from'@/components/ui/card';

const PERIOD_OPTIONS = [
 { value: 7, labelEn:'7 Days', labelAr:'7 أيام' },
 { value: 30, labelEn:'30 Days', labelAr:'30 يوم' },
 { value: 90, labelEn:'90 Days', labelAr:'90 يوم' },
];

const CHART_COLORS = ['#0D7377','#14B8A6','#22C55E','#8B5CF6','#F59E0B'];
const BOT_UA_REGEX = /(bot|spider|crawl|slurp|preview|whatsapp|telegram|facebookexternalhit|headless|python-requests|curl)/i;
const PAID_ORDER_STATUSES = new Set(['paid','delivered','completed']);
const EXCLUDED_SUBSCRIPTION_STATUSES = new Set(['cancelled','canceled','expired','inactive']);

function parseDate(value) {
 if (!value) return null;
 const parsed = new Date(value);
 return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizePlan(row) {
 return row?.plan || row?.plan_type ||'free';
}

function normalizeStatus(value) {
 return String(value ||'').trim().toLowerCase();
}

function isBotView(row) {
 return BOT_UA_REGEX.test(String(row?.user_agent ||''));
}

function isPaidOrder(row) {
 return PAID_ORDER_STATUSES.has(normalizeStatus(row?.status));
}

function isActivePaidSubscription(row) {
 const plan = normalizePlan(row);
 const status = normalizeStatus(row?.status);
 if (!plan || plan ==='free') return false;
 if (!status) return true;
 return !EXCLUDED_SUBSCRIPTION_STATUSES.has(status);
}

function getOrderAmount(row) {
 const direct = Number(row?.amount);
 if (Number.isFinite(direct)) return direct;

 const metaAmount = Number(row?.metadata?.total ?? row?.metadata?.amount ?? 0);
 return Number.isFinite(metaAmount) ? metaAmount : 0;
}

function getVisitorKey(row) {
 if (row?.visitor_id) return row.visitor_id;
 const ua = String(row?.user_agent ||'').trim();
 const ref = String(row?.referrer ||'').trim();
 if (!ua && !ref) return null;
 return`${ua}|${ref}`;
}

function getReferrerLabel(row, isRTL) {
 const referrer = row?.referrer;
 if (!referrer) return isRTL ?'مباشر' :'Direct';

 try {
 return new URL(referrer).hostname.replace(/^www\./,'');
 } catch {
 return isRTL ?'غير معروف' :'Unknown';
 }
}

function getDeviceLabel(row, isRTL) {
 const ua = String(row?.user_agent ||'').toLowerCase();
 if (!ua) return isRTL ?'غير معروف' :'Unknown';
 if (/tablet|ipad/.test(ua)) return isRTL ?'تابلت' :'Tablet';
 if (/mobile|iphone|android/.test(ua)) return isRTL ?'جوال' :'Mobile';
 return isRTL ?'كمبيوتر' :'Desktop';
}

function percentChange(current, previous) {
 if (!previous) {
 if (!current) return 0;
 return 100;
 }

 return Math.round(((current - previous) / previous) * 100);
}

function getTrend(current, previous) {
 const change = percentChange(current, previous);
 const direction = change === 0 ?'flat' : change > 0 ?'up' :'down';
 return { change, direction };
}

function sumBy(rows, getter) {
 return rows.reduce((sum, row) => sum + getter(row), 0);
}

function countBy(rows, getKey, limit = 5) {
 const map = new Map();
 rows.forEach((row) => {
 const key = getKey(row);
 if (!key) return;
 map.set(key, (map.get(key) || 0) + 1);
 });

 return [...map.entries()]
 .map(([label, value]) => ({ label, value }))
 .sort((a, b) => b.value - a.value)
 .slice(0, limit);
}

function MetricCard({ icon: Icon, label, value, sublabel, trend, accent = CHART_COLORS[0], isRTL }) {
 const trendColor =
 trend.direction ==='up'
 ?'text-emerald-600'
 : trend.direction ==='down'
 ?'text-red-500'
 :'text-slate-400';

 return (
 <Card className="border-white/10 shadow-sm">
 <CardContent className="p-5">
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0 flex-1">
 <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
 <p className="mt-2 text-2xl font-bold text-white">{value}</p>
 {sublabel ? (
 <p className="mt-1 text-xs text-slate-400">{sublabel}</p>
 ) : null}
 </div>
 <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor:`${accent}18` }}>
 <Icon className="h-5 w-5" style={{ color: accent }} />
 </div>
 </div>

 <div className={`mt-4 text-xs font-medium ${trendColor}`}>
 {trend.direction ==='flat'
 ? (isRTL ?'بدون تغير عن الفترة السابقة' :'No change vs previous period')
 :`${trend.change > 0 ?'+' :''}${trend.change}% ${isRTL ?'مقارنة بالفترة السابقة' :'vs previous period'}`}
 </div>
 </CardContent>
 </Card>
 );
}

function BreakdownList({ title, rows, emptyLabel }) {
 return (
 <Card className="border-white/10 shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-semibold text-slate-100">{title}</CardTitle>
 </CardHeader>
 <CardContent>
 {rows.length === 0 ? (
 <p className="text-sm text-slate-400">{emptyLabel}</p>
 ) : (
 <div className="space-y-3">
 {rows.map((row, index) => (
 <div key={`${row.label}-${index}`} className="space-y-1.5">
 <div className="flex items-center justify-between gap-3 text-sm">
 <span className="truncate text-slate-200">{row.label}</span>
 <span className="font-semibold text-white">{row.value.toLocaleString()}</span>
 </div>
 <div className="h-2 rounded-full bg-white/10 overflow-hidden">
 <div
 className="h-full rounded-full"
 style={{
 width:`${rows[0]?.value ? Math.max((row.value / rows[0].value) * 100, 6) : 0}%`,
 backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
 }}
 />
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 );
}

function TopCardsTable({ rows, isRTL }) {
 return (
 <Card className="border-white/10 shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-semibold text-slate-100">
 {isRTL ?'أفضل البطاقات أداءً' :'Top Performing Cards'}
 </CardTitle>
 </CardHeader>
 <CardContent>
 {rows.length === 0 ? (
 <p className="text-sm text-slate-400">
 {isRTL ?'لا توجد بيانات كافية حتى الآن' :'No tracked card activity yet'}
 </p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-white/5 text-slate-400">
 <th className={`px-2 py-2 text-xs font-semibold ${isRTL ?'text-right' :'text-left'}`}>
 {isRTL ?'البطاقة' :'Card'}
 </th>
 <th className="px-2 py-2 text-right text-xs font-semibold">{isRTL ?'المشاهدات' :'Views'}</th>
 <th className="px-2 py-2 text-right text-xs font-semibold">{isRTL ?'المسحات' :'Scans'}</th>
 <th className="px-2 py-2 text-right text-xs font-semibold">{isRTL ?'النقرات' :'Clicks'}</th>
 <th className="px-2 py-2 text-right text-xs font-semibold">{isRTL ?'الجهات' :'Leads'}</th>
 </tr>
 </thead>
 <tbody>
 {rows.map((row) => (
 <tr key={row.id} className="border-b border-slate-50">
 <td className="px-2 py-3">
 <div className="font-medium text-white">{row.label}</div>
 <div className="text-xs text-slate-400">/{row.slug || row.id.slice(0, 8)}</div>
 </td>
 <td className="px-2 py-3 text-right text-slate-200">{row.pageViews}</td>
 <td className="px-2 py-3 text-right text-slate-200">{row.qrScans}</td>
 <td className="px-2 py-3 text-right text-slate-200">{row.linkClicks}</td>
 <td className="px-2 py-3 text-right font-semibold text-white">{row.contacts}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </CardContent>
 </Card>
 );
}

export default function AdminAnalyticsReal() {
 const { isRTL } = useLanguage();
 const [periodDays, setPeriodDays] = useState(30);

 const formatNumber = (value) => Number(value || 0).toLocaleString(isRTL ?'ar-SA' :'en-US');
 const formatCurrency = (value) =>
 new Intl.NumberFormat(isRTL ?'ar-SA' :'en-US', {
 style:'currency',
 currency:'SAR',
 maximumFractionDigits: 0,
 }).format(Number(value || 0));

 const { data, isLoading, error } = useQuery({
 queryKey: ['admin-analytics-real-data'],
 staleTime: 60 * 1000,
 queryFn: async () => {
 const [profiles, cards, views, contacts, orders, subscriptions, activityLogs] = await Promise.all([
 api.entities.Profile.list('-created_at'),
 api.entities.BusinessCard.list('-created_at'),
 api.entities.CardView.list('-created_at'),
 api.entities.ContactSubmission.list('-created_at'),
 api.entities.Order.list('-created_at'),
 api.entities.Subscription.list('-created_at'),
 api.entities.ActivityLog.list('-created_at'),
 ]);

 return {
 profiles,
 cards,
 views,
 contacts,
 orders,
 subscriptions,
 activityLogs,
 };
 },
 });

 const analytics = useMemo(() => {
 if (!data) return null;

 const now = new Date();
 const periodStart = startOfDay(subDays(now, periodDays - 1));
 const previousStart = startOfDay(subDays(periodStart, periodDays));

 const inCurrentPeriod = (row) => {
 const date = parseDate(row?.created_at || row?.created_date);
 return date ? date >= periodStart : false;
 };

 const inPreviousPeriod = (row) => {
 const date = parseDate(row?.created_at || row?.created_date);
 return date ? date >= previousStart && date < periodStart : false;
 };

 const humanViews = data.views.filter((row) => !isBotView(row));
 const currentViews = humanViews.filter(inCurrentPeriod);
 const previousViews = humanViews.filter(inPreviousPeriod);

 const currentProfiles = data.profiles.filter(inCurrentPeriod);
 const previousProfiles = data.profiles.filter(inPreviousPeriod);
 const currentCards = data.cards.filter(inCurrentPeriod);
 const previousCards = data.cards.filter(inPreviousPeriod);
 const currentContacts = data.contacts.filter(inCurrentPeriod);
 const previousContacts = data.contacts.filter(inPreviousPeriod);
 const currentOrders = data.orders.filter(inCurrentPeriod);
 const previousOrders = data.orders.filter(inPreviousPeriod);
 const currentSubscriptions = data.subscriptions.filter(inCurrentPeriod).filter(isActivePaidSubscription);
 const previousSubscriptions = data.subscriptions.filter(inPreviousPeriod).filter(isActivePaidSubscription);

 const currentPageViews = currentViews.filter((row) => row.view_type ==='page_view');
 const previousPageViews = previousViews.filter((row) => row.view_type ==='page_view');
 const currentQrScans = currentViews.filter((row) => row.view_type ==='qr_scan');
 const previousQrScans = previousViews.filter((row) => row.view_type ==='qr_scan');
 const currentLinkClicks = currentViews.filter((row) => row.view_type ==='link_click');

 const currentPaidOrders = currentOrders.filter(isPaidOrder);
 const previousPaidOrders = previousOrders.filter(isPaidOrder);
 const currentRevenue = sumBy(currentPaidOrders, getOrderAmount);
 const previousRevenue = sumBy(previousPaidOrders, getOrderAmount);

 const currentUniqueVisitors = new Set(currentViews.map(getVisitorKey).filter(Boolean)).size;

 const totalPublishedCards = data.cards.filter((row) => row.status ==='published').length;
 const totalOrders = data.orders.length;
 const totalRevenue = sumBy(data.orders.filter(isPaidOrder), getOrderAmount);
 const totalPaidSubscriptions = data.subscriptions.filter(isActivePaidSubscription).length;

 const cardsById = new Map(data.cards.map((card) => [card.id, card]));
 const currentContactsByCard = data.contacts.reduce((map, row) => {
 if (!inCurrentPeriod(row) || !row.card_id) return map;
 map.set(row.card_id, (map.get(row.card_id) || 0) + 1);
 return map;
 }, new Map());

 const topCardsMap = currentViews.reduce((map, row) => {
 if (!row.card_id) return map;
 const current = map.get(row.card_id) || {
 id: row.card_id,
 pageViews: 0,
 qrScans: 0,
 linkClicks: 0,
 contacts: currentContactsByCard.get(row.card_id) || 0,
 };

 if (row.view_type ==='page_view') current.pageViews += 1;
 if (row.view_type ==='qr_scan') current.qrScans += 1;
 if (row.view_type ==='link_click') current.linkClicks += 1;

 map.set(row.card_id, current);
 return map;
 }, new Map());

 const topCards = [...topCardsMap.values()]
 .map((row) => {
 const card = cardsById.get(row.id) || {};
 return {
 ...row,
 slug: card.slug,
 label: card.name || card.name_ar || card.title || card.title_ar || card.slug || row.id.slice(0, 8),
 total: row.pageViews + row.qrScans + row.linkClicks + row.contacts,
 };
 })
 .sort((a, b) => b.total - a.total)
 .slice(0, 6);

 const timeline = Array.from({ length: periodDays }, (_, index) => {
 const day = startOfDay(subDays(now, periodDays - 1 - index));
 const dayKey = format(day,'yyyy-MM-dd');
 const sameDay = (row) => {
 const date = parseDate(row?.created_at || row?.created_date);
 return date ? format(date,'yyyy-MM-dd') === dayKey : false;
 };

 const dayOrders = currentPaidOrders.filter(sameDay);

 return {
 date: format(day,'MMM d'),
 views: currentPageViews.filter(sameDay).length,
 scans: currentQrScans.filter(sameDay).length,
 contacts: currentContacts.filter(sameDay).length,
 orders: currentOrders.filter(sameDay).length,
 revenue: sumBy(dayOrders, getOrderAmount),
 upgrades: currentSubscriptions.filter(sameDay).length,
 };
 });

 const planBreakdown = countBy(
 data.subscriptions.filter(isActivePaidSubscription),
 (row) => {
 const plan = normalizePlan(row);
 if (plan ==='premium') return isRTL ?'بريميوم' :'Premium';
 if (plan ==='teams') return isRTL ?'فرق' :'Teams';
 if (plan ==='enterprise') return isRTL ?'مؤسسي' :'Enterprise';
 return plan;
 },
 5,
 );

 const deviceBreakdown = countBy(currentViews, (row) => getDeviceLabel(row, isRTL), 4);
 const referrerBreakdown = countBy(currentViews, (row) => getReferrerLabel(row, isRTL), 5);

 const rawPageViewEvents = data.views.filter((row) => row.view_type ==='page_view').length;
 const rawQrScanEvents = data.views.filter((row) => row.view_type ==='qr_scan').length;
 const pageViewCounterTotal = sumBy(data.cards, (row) => Number(row?.view_count) || 0);
 const scanCounterTotal = sumBy(data.cards, (row) => Number(row?.scan_count) || 0);
 const counterDrift = {
 views: pageViewCounterTotal - rawPageViewEvents,
 scans: scanCounterTotal - rawQrScanEvents,
 };

 const activityEventsThisPeriod = data.activityLogs.filter(inCurrentPeriod).length;

 return {
 totals: {
 totalUsers: data.profiles.length,
 totalPublishedCards,
 totalOrders,
 totalRevenue,
 totalPaidSubscriptions,
 },
 metrics: {
 newUsers: {
 current: currentProfiles.length,
 previous: previousProfiles.length,
 },
 cardsCreated: {
 current: currentCards.length,
 previous: previousCards.length,
 },
 pageViews: {
 current: currentPageViews.length,
 previous: previousPageViews.length,
 },
 qrScans: {
 current: currentQrScans.length,
 previous: previousQrScans.length,
 },
 contacts: {
 current: currentContacts.length,
 previous: previousContacts.length,
 },
 revenue: {
 current: currentRevenue,
 previous: previousRevenue,
 },
 orders: {
 current: currentOrders.length,
 previous: previousOrders.length,
 },
 subscriptions: {
 current: currentSubscriptions.length,
 previous: previousSubscriptions.length,
 },
 },
 uniqueVisitors: currentUniqueVisitors,
 currentLinkClicks: currentLinkClicks.length,
 timeline,
 topCards,
 planBreakdown,
 deviceBreakdown,
 referrerBreakdown,
 counterDrift,
 activityEventsThisPeriod,
 };
 }, [data, isRTL, periodDays]);

 if (isLoading) {
 return (
 <div className="flex min-h-[320px] items-center justify-center">
 <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-600" />
 </div>
 );
 }

 if (error || !analytics) {
 return (
 <Card className="border-red-200 bg-red-50">
 <CardContent className="p-6 text-sm text-red-700">
 {isRTL ?'تعذر تحميل التحليلات الفعلية من قاعدة البيانات.' :'Could not load real analytics data from the database.'}
 </CardContent>
 </Card>
 );
 }

 const viewDrift = analytics.counterDrift.views;
 const scanDrift = analytics.counterDrift.scans;
 const hasCounterDrift = viewDrift !== 0 || scanDrift !== 0;

 const summaryCards = [
 {
 label: isRTL ?'مستخدمون جدد' :'New Users',
 value: formatNumber(analytics.metrics.newUsers.current),
 sublabel:`${formatNumber(analytics.totals.totalUsers)} ${isRTL ?'إجمالي المستخدمين' :'total users'}`,
 icon: UserRoundPlus,
 trend: getTrend(analytics.metrics.newUsers.current, analytics.metrics.newUsers.previous),
 accent: CHART_COLORS[0],
 },
 {
 label: isRTL ?'بطاقات منشأة' :'Cards Created',
 value: formatNumber(analytics.metrics.cardsCreated.current),
 sublabel:`${formatNumber(analytics.totals.totalPublishedCards)} ${isRTL ?'بطاقة منشورة' :'published cards'}`,
 icon: LayoutDashboard,
 trend: getTrend(analytics.metrics.cardsCreated.current, analytics.metrics.cardsCreated.previous),
 accent: CHART_COLORS[1],
 },
 {
 label: isRTL ?'مشاهدات الصفحة' :'Page Views',
 value: formatNumber(analytics.metrics.pageViews.current),
 sublabel:`${formatNumber(analytics.uniqueVisitors)} ${isRTL ?'زائر فريد' :'unique visitors'} • ${formatNumber(analytics.currentLinkClicks)} ${isRTL ?'نقرة رابط' :'link clicks'}`,
 icon: Eye,
 trend: getTrend(analytics.metrics.pageViews.current, analytics.metrics.pageViews.previous),
 accent: CHART_COLORS[2],
 },
 {
 label: isRTL ?'مسحات QR' :'QR Scans',
 value: formatNumber(analytics.metrics.qrScans.current),
 sublabel:`${formatNumber(analytics.activityEventsThisPeriod)} ${isRTL ?'حدث تنقل داخلي' :'internal navigation events'}`,
 icon: QrCode,
 trend: getTrend(analytics.metrics.qrScans.current, analytics.metrics.qrScans.previous),
 accent: CHART_COLORS[3],
 },
 {
 label: isRTL ?'الجهات المحتملة' :'Captured Leads',
 value: formatNumber(analytics.metrics.contacts.current),
 sublabel:`${formatNumber(analytics.metrics.orders.current)} ${isRTL ?'طلب خلال الفترة' :'orders in period'}`,
 icon: Users,
 trend: getTrend(analytics.metrics.contacts.current, analytics.metrics.contacts.previous),
 accent: CHART_COLORS[4],
 },
 {
 label: isRTL ?'الإيراد المدفوع' :'Paid Revenue',
 value: formatCurrency(analytics.metrics.revenue.current),
 sublabel:`${formatCurrency(analytics.totals.totalRevenue)} ${isRTL ?'إجمالي الإيراد المدفوع' :'all-time paid revenue'} • ${formatNumber(analytics.totals.totalPaidSubscriptions)} ${isRTL ?'اشتراك مدفوع' :'paid subscriptions'}`,
 icon: Wallet,
 trend: getTrend(analytics.metrics.revenue.current, analytics.metrics.revenue.previous),
 accent: CHART_COLORS[0],
 },
 ];

 return (
 <div className="space-y-6">
 <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div>
 <h1 className="text-2xl font-bold text-white">
 {isRTL ?'تحليلات المسؤول' :'Admin Analytics'}
 </h1>
 <p className="mt-1 text-sm text-slate-400">
 {isRTL
 ?'هذه اللوحة تعرض البيانات الحقيقية المخزنة في Supabase فقط، بدون أي أرقام تجريبية أو عشوائية.'
 :'This panel now shows only persisted Supabase data — no generated or placeholder numbers.'}
 </p>
 </div>

 <div className="flex flex-wrap gap-2">
 {PERIOD_OPTIONS.map((option) => (
 <button
 key={option.value}
 type="button"
 onClick={() => setPeriodDays(option.value)}
 className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
 periodDays === option.value
 ?'border-cyan-600 bg-cyan-600 text-white'
 :'border-white/10 text-slate-300 hover:border-cyan-300 hover:bg-white/5'
 }`}
 >
 {isRTL ? option.labelAr : option.labelEn}
 </button>
 ))}
 </div>
 </div>

 <div className="grid gap-3">
 <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-800">
 <div className="flex items-start gap-3">
 <Globe className="mt-0.5 h-4 w-4 flex-shrink-0" />
 <div>
 <p className="font-semibold">{isRTL ?'مصادر البيانات الحالية' :'Current data sources'}</p>
 <p className="mt-1">
 {isRTL
 ?'اللوحة تعتمد على الجداول الفعلية: profiles، business_cards، card_views، contact_submissions، orders، subscriptions، و activity_logs.'
 :'The dashboard is sourced from real rows in profiles, business_cards, card_views, contact_submissions, orders, subscriptions, and activity_logs.'}
 </p>
 </div>
 </div>
 </div>

 <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
 <div className="flex items-start gap-3">
 <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
 <div>
 <p className="font-semibold">{isRTL ?'ما لا يتم تتبعه بعد' :'What is not tracked yet'}</p>
 <p className="mt-1">
 {isRTL
 ?'زيارات الصفحة الرئيسية، نقرات أزرار CTA، عمق التمرير، والـ heatmaps العامة لا تُحفظ في قاعدة البيانات حالياً، لذلك لم أعد أعرضها حتى لا تظهر أرقام غير دقيقة.'
 :'Home page visits, landing-page CTA clicks, scroll depth, and public heatmaps are not persisted in the database today, so they are intentionally omitted to avoid inaccurate reporting.'}
 </p>
 </div>
 </div>
 </div>

 {hasCounterDrift ? (
 <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
 <div className="flex items-start gap-3">
 <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
 <div>
 <p className="font-semibold">{isRTL ?'تم رصد اختلاف في العدادات' :'Counter mismatch detected'}</p>
 <p className="mt-1">
 {isRTL
 ?`هناك فرق قدره ${formatNumber(viewDrift)} في مشاهدات الصفحة و ${formatNumber(scanDrift)} في مسحات QR بين عدادات business_cards وسجل card_views. تم اعتماد سجل card_views كمصدر الحقيقة داخل هذه اللوحة.`
 :`There is a drift of ${formatNumber(viewDrift)} page views and ${formatNumber(scanDrift)} QR scans between business_cards counters and the card_views event log. This panel now treats card_views as the source of truth.`}
 </p>
 </div>
 </div>
 </div>
 ) : null}
 </div>

 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
 {summaryCards.map((card) => (
 <MetricCard key={card.label} {...card} isRTL={isRTL} />
 ))}
 </div>

 <div className="grid gap-4 xl:grid-cols-3">
 <Card className="border-white/10 shadow-sm xl:col-span-2">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between gap-3">
 <CardTitle className="text-sm font-semibold text-slate-100">
 {isRTL ?'اتجاه التفاعل اليومي' :'Daily engagement trend'}
 </CardTitle>
 <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">
 {isRTL ?'تم استبعاد الزيارات الآلية' :'Bots filtered out'}
 </Badge>
 </div>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={320}>
 <AreaChart data={analytics.timeline} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
 <defs>
 <linearGradient id="viewsGradientReal" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.22} />
 <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
 </linearGradient>
 <linearGradient id="scansGradientReal" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor={CHART_COLORS[3]} stopOpacity={0.18} />
 <stop offset="95%" stopColor={CHART_COLORS[3]} stopOpacity={0} />
 </linearGradient>
 <linearGradient id="contactsGradientReal" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor={CHART_COLORS[2]} stopOpacity={0.18} />
 <stop offset="95%" stopColor={CHART_COLORS[2]} stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
 <XAxis dataKey="date" tick={{ fontSize: 11, fill:'#64748b' }} />
 <YAxis tick={{ fontSize: 11, fill:'#64748b' }} />
 <ReTooltip contentStyle={{ borderRadius: 14, border:'1px solid #e2e8f0' }} formatter={(value) => [formatNumber(value),'']} />
 <Area type="monotone" dataKey="views" stroke={CHART_COLORS[0]} fill="url(#viewsGradientReal)" strokeWidth={2.5} />
 <Area type="monotone" dataKey="scans" stroke={CHART_COLORS[3]} fill="url(#scansGradientReal)" strokeWidth={2.2} />
 <Area type="monotone" dataKey="contacts" stroke={CHART_COLORS[2]} fill="url(#contactsGradientReal)" strokeWidth={2.2} />
 </AreaChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 <Card className="border-white/10 shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-semibold text-slate-100">
 {isRTL ?'ملخص التحويلات' :'Conversion summary'}
 </CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="rounded-2xl bg-white/5 p-4">
 <div className="flex items-center justify-between text-sm">
 <span className="text-slate-400">{isRTL ?'الطلبات' :'Orders'}</span>
 <span className="font-semibold text-white">{formatNumber(analytics.metrics.orders.current)}</span>
 </div>
 <div className="mt-3 flex items-center justify-between text-sm">
 <span className="text-slate-400">{isRTL ?'الاشتراكات المدفوعة الجديدة' :'New paid subscriptions'}</span>
 <span className="font-semibold text-white">{formatNumber(analytics.metrics.subscriptions.current)}</span>
 </div>
 <div className="mt-3 flex items-center justify-between text-sm">
 <span className="text-slate-400">{isRTL ?'النقرات على الروابط' :'Link clicks'}</span>
 <span className="font-semibold text-white">{formatNumber(analytics.currentLinkClicks)}</span>
 </div>
 </div>

 <div className="space-y-3">
 <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
 <div className="flex items-center gap-2 text-sm text-slate-300">
 <ShoppingCart className="h-4 w-4 text-cyan-600" />
 {isRTL ?'إجمالي الطلبات' :'All-time orders'}
 </div>
 <span className="font-semibold text-white">{formatNumber(analytics.totals.totalOrders)}</span>
 </div>
 <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
 <div className="flex items-center gap-2 text-sm text-slate-300">
 <CreditCard className="h-4 w-4 text-violet-600" />
 {isRTL ?'اشتراكات مدفوعة نشطة' :'Active paid subscriptions'}
 </div>
 <span className="font-semibold text-white">{formatNumber(analytics.totals.totalPaidSubscriptions)}</span>
 </div>
 <div className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2">
 <div className="flex items-center gap-2 text-sm text-slate-300">
 <MousePointerClick className="h-4 w-4 text-amber-600" />
 {isRTL ?'الزوار الفريدون' :'Unique visitors'}
 </div>
 <span className="font-semibold text-white">{formatNumber(analytics.uniqueVisitors)}</span>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 <div className="grid gap-4 xl:grid-cols-2">
 <Card className="border-white/10 shadow-sm">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-semibold text-slate-100">
 {isRTL ?'الإيراد والطلبات والاشتراكات' :'Revenue, orders, and subscriptions'}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={analytics.timeline} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
 <XAxis dataKey="date" tick={{ fontSize: 11, fill:'#64748b' }} />
 <YAxis yAxisId="left" tick={{ fontSize: 11, fill:'#64748b' }} />
 <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill:'#64748b' }} />
 <ReTooltip
 contentStyle={{ borderRadius: 14, border:'1px solid #e2e8f0' }}
 formatter={(value, name) => {
 if (name ==='revenue') return [formatCurrency(value), isRTL ?'الإيراد' :'Revenue'];
 return [formatNumber(value), name];
 }}
 />
 <Bar yAxisId="left" dataKey="orders" name="orders" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
 <Bar yAxisId="left" dataKey="upgrades" name="upgrades" fill={CHART_COLORS[3]} radius={[6, 6, 0, 0]} />
 <Bar yAxisId="right" dataKey="revenue" name="revenue" fill={CHART_COLORS[4]} radius={[6, 6, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 <div className="grid gap-4 md:grid-cols-2">
 <BreakdownList
 title={isRTL ?'الاشتراكات حسب الخطة' :'Subscriptions by plan'}
 rows={analytics.planBreakdown}
 emptyLabel={isRTL ?'لا توجد اشتراكات مدفوعة بعد' :'No paid subscriptions yet'}
 />
 <BreakdownList
 title={isRTL ?'الأجهزة' :'Devices'}
 rows={analytics.deviceBreakdown}
 emptyLabel={isRTL ?'لا توجد زيارات كافية بعد' :'Not enough visit data yet'}
 />
 <BreakdownList
 title={isRTL ?'أهم مصادر الزيارات' :'Top referrers'}
 rows={analytics.referrerBreakdown}
 emptyLabel={isRTL ?'لا توجد مصادر مسجلة بعد' :'No referrers recorded yet'}
 />
 <BreakdownList
 title={isRTL ?'مصادر الحقيقة المستخدمة' :'Tracked sources in use'}
 rows={[
 { label:'profiles', value: data.profiles.length },
 { label:'card_views', value: data.views.length },
 { label:'contact_submissions', value: data.contacts.length },
 { label:'orders', value: data.orders.length },
 { label:'subscriptions', value: data.subscriptions.length },
 ]}
 emptyLabel={isRTL ?'لا توجد جداول مستخدمة' :'No tracked tables'}
 />
 </div>
 </div>

 <TopCardsTable rows={analytics.topCards} isRTL={isRTL} />
 </div>
 );
}
