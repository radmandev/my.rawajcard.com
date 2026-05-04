import React, { useMemo } from'react';
import { useLanguage } from'@/components/shared/LanguageContext';
import { api } from'@/api/supabaseAPI';
import { useQuery } from'@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from'@/components/ui/card';
import { Badge } from'@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from'@/components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from'recharts';
import { TrendingUp, Eye, MousePointerClick, Users, Award, Calendar, Mail, Share2 } from'lucide-react';

const COLORS = ['#38BDF8','#E879F9','#60A5FA','#22D3EE','#A78BFA','#34D399','#F472B6','#F59E0B','#C084FC','#2DD4BF'];
const HERO_CARD = 'bg-[linear-gradient(135deg,#0C1429_0%,#1E1B4B_52%,#0C1429_100%)] border-white/15 backdrop-blur-xl shadow-[0_24px_80px_rgba(12,20,41,0.45)]';

export default function TemplateAnalytics() {
 const { isRTL } = useLanguage();
 const [user, setUser] = React.useState(null);

 // Check if user is admin
 React.useEffect(() => {
 api.auth.me().then(setUser).catch(() => {});
 }, []);

 const { data: cards = [], isLoading: cardsLoading } = useQuery({
 queryKey: ['all-cards'],
 queryFn: () => api.asServiceRole.entities.BusinessCard.list('-created_date', 10000)
 });

 const { data: views = [], isLoading: viewsLoading } = useQuery({
 queryKey: ['all-views'],
 queryFn: () => api.asServiceRole.entities.CardView.list('-created_date', 10000)
 });

 const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
 queryKey: ['all-submissions'],
 queryFn: () => api.asServiceRole.entities.ContactSubmission.list('-created_date', 10000)
 });

 // Template analytics
 const templateAnalytics = useMemo(() => {
 const analytics = {};
 
 cards.forEach(card => {
 const template = card.template ||'unknown';
 if (!analytics[template]) {
 analytics[template] = {
 template,
 cards: 0,
 views: 0,
 clickTypes: {},
 submissions: 0,
 conversions: 0
 };
 }
 analytics[template].cards++;
 });

 views.forEach(view => {
 const card = cards.find(c => c.id === view.card_id);
 if (card) {
 const template = card.template ||'unknown';
 if (analytics[template]) {
 analytics[template].views++;
 if (view.clicked_link) {
 analytics[template].clickTypes[view.clicked_link] = 
 (analytics[template].clickTypes[view.clicked_link] || 0) + 1;
 }
 }
 }
 });

 submissions.forEach(sub => {
 const card = cards.find(c => c.id === sub.card_id);
 if (card) {
 const template = card.template ||'unknown';
 if (analytics[template]) {
 analytics[template].submissions++;
 analytics[template].conversions = analytics[template].views > 0 
 ? ((analytics[template].submissions / analytics[template].views) * 100).toFixed(2)
 : 0;
 }
 }
 });

 return Object.values(analytics).sort((a, b) => b.views - a.views);
 }, [cards, views, submissions]);

 // Popular templates
 const popularTemplates = templateAnalytics.slice(0, 5);

 // Click distribution
 const clickDistribution = useMemo(() => {
 const distribution = {};
 views.forEach(view => {
 if (view.clicked_link) {
 distribution[view.clicked_link] = (distribution[view.clicked_link] || 0) + 1;
 }
 });
 return Object.entries(distribution)
 .map(([name, value]) => ({ name, value }))
 .sort((a, b) => b.value - a.value);
 }, [views]);

 // Conversion funnel
 const conversionFunnel = useMemo(() => {
 const totalViews = views.length;
 const uniqueClicks = new Set(views.filter(v => v.clicked_link).map(v => v.card_id)).size;
 const totalSubmissions = submissions.length;

 return [
 { stage: isRTL ?'المشاهدات' :'Views', count: totalViews, percentage: 100 },
 { stage: isRTL ?'النقرات' :'Clicks', count: views.filter(v => v.clicked_link).length, percentage: totalViews > 0 ? ((views.filter(v => v.clicked_link).length / totalViews) * 100).toFixed(1) : 0 },
 { stage: isRTL ?'التحويلات' :'Conversions', count: totalSubmissions, percentage: totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : 0 }
 ];
 }, [views, submissions, isRTL]);

 // Template engagement over time
 const engagementTrend = useMemo(() => {
 const last7Days = [];
 for (let i = 6; i >= 0; i--) {
 const date = new Date();
 date.setDate(date.getDate() - i);
 const dateStr = date.toISOString().split('T')[0];
 
 const dayViews = views.filter(v => v.created_date?.split('T')[0] === dateStr).length;
 const dayClicks = views.filter(v => v.created_date?.split('T')[0] === dateStr && v.clicked_link).length;
 const daySubmissions = submissions.filter(s => s.created_date?.split('T')[0] === dateStr).length;
 
 last7Days.push({
 date: dateStr,
 views: dayViews,
 clicks: dayClicks,
 submissions: daySubmissions
 });
 }
 return last7Days;
 }, [views, submissions]);

 if (user?.role !=='admin') {
 return (
 <div className="flex items-center justify-center h-96">
 <div className="text-center">
 <Award className="h-16 w-16 mx-auto mb-4 text-slate-300" />
 <h2 className="text-2xl font-bold text-slate-100 mb-2">
 {isRTL ?'الوصول محظور' :'Access Denied'}
 </h2>
 <p className="text-slate-300">
 {isRTL ?'هذه الصفحة متاحة للمسؤولين فقط' :'This page is only available to administrators'}
 </p>
 </div>
 </div>
 );
 }

 if (cardsLoading || viewsLoading || submissionsLoading) {
 return (
 <div className="flex items-center justify-center h-96">
 <div className="text-center">
 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4" />
 <p className="text-slate-300">{isRTL ?'جاري التحميل...' :'Loading...'}</p>
 </div>
 </div>
 );
 }

 const totalViews = views.length;
 const totalClicks = views.filter(v => v.clicked_link).length;
 const totalSubmissions = submissions.length;
 const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0;
 const avgConversion = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(2) : 0;

 return (
 <div className="max-w-7xl mx-auto space-y-6">
 <div>
 <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
 {isRTL ?'تحليلات القوالب' :'Template Analytics'}
 </h1>
 <p className="text-slate-300 mt-1">
 {isRTL ?'رؤى مفصلة حول أداء القوالب وتفاعل المستخدمين' :'Detailed insights on template performance and user engagement'}
 </p>
 </div>

 {/* Key Metrics */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
 <Card className={HERO_CARD}>
 <CardContent className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-slate-300">{isRTL ?'إجمالي المشاهدات' :'Total Views'}</p>
 <p className="text-2xl font-bold text-slate-100 mt-1">{totalViews.toLocaleString()}</p>
 </div>
 <Eye className="h-8 w-8 text-cyan-600" />
 </div>
 </CardContent>
 </Card>

 <Card className={HERO_CARD}>
 <CardContent className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-slate-300">{isRTL ?'النقرات' :'Total Clicks'}</p>
 <p className="text-2xl font-bold text-slate-100 mt-1">{totalClicks.toLocaleString()}</p>
 </div>
 <MousePointerClick className="h-8 w-8 text-blue-400" />
 </div>
 </CardContent>
 </Card>

 <Card className={HERO_CARD}>
 <CardContent className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-slate-300">{isRTL ?'التحويلات' :'Conversions'}</p>
 <p className="text-2xl font-bold text-slate-100 mt-1">{totalSubmissions.toLocaleString()}</p>
 </div>
 <Mail className="h-8 w-8 text-purple-400" />
 </div>
 </CardContent>
 </Card>

 <Card className={HERO_CARD}>
 <CardContent className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-slate-300">{isRTL ?'معدل النقر' :'Avg CTR'}</p>
 <p className="text-2xl font-bold text-slate-100 mt-1">{avgCTR}%</p>
 </div>
 <TrendingUp className="h-8 w-8 text-amber-400" />
 </div>
 </CardContent>
 </Card>

 <Card className={HERO_CARD}>
 <CardContent className="p-6">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-sm text-slate-300">{isRTL ?'معدل التحويل' :'Conversion Rate'}</p>
 <p className="text-2xl font-bold text-slate-100 mt-1">{avgConversion}%</p>
 </div>
 <Users className="h-8 w-8 text-emerald-400" />
 </div>
 </CardContent>
 </Card>
 </div>

 <Tabs defaultValue="templates" className="w-full">
 <TabsList className="grid w-full grid-cols-4 bg-slate-900/40 border border-white/15">
 <TabsTrigger value="templates" className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white">{isRTL ?'القوالب' :'Templates'}</TabsTrigger>
 <TabsTrigger value="engagement" className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white">{isRTL ?'التفاعل' :'Engagement'}</TabsTrigger>
 <TabsTrigger value="conversions" className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white">{isRTL ?'التحويلات' :'Conversions'}</TabsTrigger>
 <TabsTrigger value="trends" className="text-slate-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white">{isRTL ?'الاتجاهات' :'Trends'}</TabsTrigger>
 </TabsList>

 {/* Templates Tab */}
 <TabsContent value="templates" className="space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Views per Template */}
 <Card className={HERO_CARD}>
 <CardHeader>
 <CardTitle className="text-slate-100">{isRTL ?'المشاهدات حسب القالب' :'Views per Template'}</CardTitle>
 <CardDescription className="text-slate-300">{isRTL ?'إجمالي المشاهدات لكل قالب' :'Total views for each template'}</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={popularTemplates}>
 <CartesianGrid strokeDasharray="3 3" stroke="#33415566" />
 <XAxis dataKey="template" tick={{ fill:'#94A3B8' }} axisLine={{ stroke:'#475569' }} tickLine={false} />
 <YAxis tick={{ fill:'#94A3B8' }} axisLine={false} tickLine={false} />
 <Tooltip />
 <Bar dataKey="views" fill="#38BDF8" />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 {/* Popular Templates */}
 <Card className={HERO_CARD}>
 <CardHeader>
 <CardTitle className="text-slate-100">{isRTL ?'أشهر القوالب' :'Popular Templates'}</CardTitle>
 <CardDescription className="text-slate-300">{isRTL ?'القوالب الأكثر استخداماً' :'Most used templates'}</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {popularTemplates.map((template, index) => (
 <div key={template.template} className="flex items-center justify-between p-3 bg-slate-900/40 border border-white/15 rounded-lg">
 <div className="flex items-center gap-3">
 <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold">
 #{index + 1}
 </div>
 <div>
 <p className="font-semibold capitalize text-slate-100">{template.template.replace(/_/g,'')}</p>
 <p className="text-sm text-slate-300">{template.cards} {isRTL ?'بطاقة' :'cards'}</p>
 </div>
 </div>
 <div className="text-right">
 <p className="font-bold text-cyan-300">{template.views.toLocaleString()}</p>
 <p className="text-xs text-slate-300">{isRTL ?'مشاهدة' :'views'}</p>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Template Performance Table */}
 <Card className={HERO_CARD}>
 <CardHeader>
 <CardTitle className="text-slate-100">{isRTL ?'أداء القوالب' :'Template Performance'}</CardTitle>
 <CardDescription className="text-slate-300">{isRTL ?'مقاييس مفصلة لكل قالب' :'Detailed metrics for each template'}</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="overflow-x-auto">
 <table className="w-full">
 <thead>
 <tr className="border-b border-white/15">
 <th className="text-left p-3 text-sm font-semibold">{isRTL ?'القالب' :'Template'}</th>
 <th className="text-left p-3 text-sm font-semibold">{isRTL ?'البطاقات' :'Cards'}</th>
 <th className="text-left p-3 text-sm font-semibold">{isRTL ?'المشاهدات' :'Views'}</th>
 <th className="text-left p-3 text-sm font-semibold">{isRTL ?'النقرات' :'Clicks'}</th>
 <th className="text-left p-3 text-sm font-semibold">{isRTL ?'التحويلات' :'Conversions'}</th>
 <th className="text-left p-3 text-sm font-semibold">{isRTL ?'معدل التحويل' :'Conv. Rate'}</th>
 </tr>
 </thead>
 <tbody className="text-slate-200">
 {templateAnalytics.map(template => (
 <tr key={template.template} className="border-b border-white/10 hover:bg-white/5">
 <td className="p-3">
 <span className="font-medium capitalize text-slate-100">{template.template.replace(/_/g,'')}</span>
 </td>
 <td className="p-3">{template.cards}</td>
 <td className="p-3">{template.views.toLocaleString()}</td>
 <td className="p-3">{Object.values(template.clickTypes).reduce((a, b) => a + b, 0).toLocaleString()}</td>
 <td className="p-3">{template.submissions}</td>
 <td className="p-3">
 <Badge variant={template.conversions > 5 ?'default' :'secondary'}>
 {template.conversions}%
 </Badge>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* Engagement Tab */}
 <TabsContent value="engagement" className="space-y-6">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Click Distribution */}
 <Card className={HERO_CARD}>
 <CardHeader>
 <CardTitle className="text-slate-100">{isRTL ?'توزيع النقرات' :'Click Distribution'}</CardTitle>
 <CardDescription className="text-slate-300">{isRTL ?'الأقسام الأكثر نقراً' :'Most clicked sections'}</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <PieChart>
 <Pie
 data={clickDistribution}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent }) =>`${name} (${(percent * 100).toFixed(0)}%)`}
 outerRadius={80}
 fill="#8884d8"
 dataKey="value"
 >
 {clickDistribution.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 {/* Click Types List */}
 <Card className={HERO_CARD}>
 <CardHeader>
 <CardTitle className="text-slate-100">{isRTL ?'أنواع النقرات' :'Click Types'}</CardTitle>
 <CardDescription className="text-slate-300">{isRTL ?'تفاصيل النقرات حسب النوع' :'Click details by type'}</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {clickDistribution.map((item, index) => (
 <div key={item.name} className="flex items-center justify-between p-3 bg-slate-900/40 border border-white/15 rounded-lg">
 <div className="flex items-center gap-3">
 <div 
 className="h-3 w-3 rounded-full"
 style={{ backgroundColor: COLORS[index % COLORS.length] }}
 />
 <span className="font-medium capitalize text-slate-100">{item.name.replace(/_/g,'')}</span>
 </div>
 <span className="font-bold text-cyan-300">{item.value.toLocaleString()}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* Conversions Tab */}
 <TabsContent value="conversions" className="space-y-6">
 <Card className={HERO_CARD}>
 <CardHeader>
 <CardTitle className="text-slate-100">{isRTL ?'قمع التحويل' :'Conversion Funnel'}</CardTitle>
 <CardDescription className="text-slate-300">{isRTL ?'رحلة المستخدم من المشاهدة إلى التحويل' :'User journey from view to conversion'}</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 {conversionFunnel.map((stage, index) => (
 <div key={stage.stage} className="relative">
 <div className="flex items-center justify-between mb-2">
 <span className="font-medium text-slate-100">{stage.stage}</span>
 <div className="text-right">
 <span className="font-bold text-lg text-slate-100">{stage.count.toLocaleString()}</span>
 <span className="text-sm text-slate-300 ml-2">({stage.percentage}%)</span>
 </div>
 </div>
 <div className="h-12 bg-slate-700/60 rounded-lg overflow-hidden">
 <div 
 className="h-full flex items-center px-4 text-white font-semibold transition-all duration-500"
 style={{ 
 width:`${stage.percentage}%`,
 backgroundColor: COLORS[index % COLORS.length]
 }}
 >
 {stage.percentage}%
 </div>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* Trends Tab */}
 <TabsContent value="trends" className="space-y-6">
 <Card className={HERO_CARD}>
 <CardHeader>
 <CardTitle className="text-slate-100">{isRTL ?'اتجاهات التفاعل (آخر 7 أيام)' :'Engagement Trends (Last 7 Days)'}</CardTitle>
 <CardDescription className="text-slate-300">{isRTL ?'المشاهدات والنقرات والتحويلات اليومية' :'Daily views, clicks, and conversions'}</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={400}>
 <LineChart data={engagementTrend}>
 <CartesianGrid strokeDasharray="3 3" stroke="#33415566" />
 <XAxis dataKey="date" tick={{ fill:'#94A3B8' }} axisLine={{ stroke:'#475569' }} tickLine={false} />
 <YAxis tick={{ fill:'#94A3B8' }} axisLine={false} tickLine={false} />
 <Tooltip />
 <Legend />
 <Line type="monotone" dataKey="views" stroke="#38BDF8" name={isRTL ?'المشاهدات' :'Views'} strokeWidth={2} />
 <Line type="monotone" dataKey="clicks" stroke="#E879F9" name={isRTL ?'النقرات' :'Clicks'} strokeWidth={2} />
 <Line type="monotone" dataKey="submissions" stroke="#22D3EE" name={isRTL ?'التحويلات' :'Conversions'} strokeWidth={2} />
 </LineChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 {/* Key Insights */}
 <Card className={HERO_CARD}>
 <CardHeader>
 <CardTitle className="flex items-center gap-2 text-slate-100">
 <Award className="h-5 w-5 text-amber-500" />
 {isRTL ?'رؤى رئيسية' :'Key Insights'}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="p-4 bg-cyan-500/10 rounded-lg border border-cyan-300/30">
 <p className="text-sm font-semibold text-cyan-200 mb-2">
 {isRTL ?'🏆 القالب الأكثر شعبية' :'🏆 Most Popular Template'}
 </p>
 <p className="text-lg font-bold text-cyan-100 capitalize">
 {popularTemplates[0]?.template.replace(/_/g,'')}
 </p>
 <p className="text-sm text-cyan-300">
 {popularTemplates[0]?.views.toLocaleString()} {isRTL ?'مشاهدة' :'views'}
 </p>
 </div>

 <div className="p-4 bg-fuchsia-500/10 rounded-lg border border-fuchsia-300/30">
 <p className="text-sm font-semibold text-fuchsia-200 mb-2">
 {isRTL ?'🎯 أعلى معدل تحويل' :'🎯 Best Conversion Rate'}
 </p>
 <p className="text-lg font-bold text-fuchsia-100 capitalize">
 {[...templateAnalytics].sort((a, b) => b.conversions - a.conversions)[0]?.template.replace(/_/g,'')}
 </p>
 <p className="text-sm text-fuchsia-300">
 {[...templateAnalytics].sort((a, b) => b.conversions - a.conversions)[0]?.conversions}% {isRTL ?'معدل تحويل' :'conversion rate'}
 </p>
 </div>

 <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-300/30">
 <p className="text-sm font-semibold text-blue-200 mb-2">
 {isRTL ?'👆 القسم الأكثر نقراً' :'👆 Most Clicked Section'}
 </p>
 <p className="text-lg font-bold text-blue-100 capitalize">
 {clickDistribution[0]?.name.replace(/_/g,'')}
 </p>
 <p className="text-sm text-blue-300">
 {clickDistribution[0]?.value.toLocaleString()} {isRTL ?'نقرة' :'clicks'}
 </p>
 </div>

 <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-300/30">
 <p className="text-sm font-semibold text-amber-200 mb-2">
 {isRTL ?'📈 إجمالي التفاعل' :'📈 Total Engagement'}
 </p>
 <p className="text-lg font-bold text-amber-100">
 {((totalClicks + totalSubmissions) / totalViews * 100).toFixed(1)}%
 </p>
 <p className="text-sm text-amber-300">
 {isRTL ?'معدل التفاعل الكلي' :'Overall engagement rate'}
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 );
}