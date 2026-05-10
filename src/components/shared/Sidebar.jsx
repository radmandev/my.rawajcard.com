import React, { useState } from'react';
import { Link, useLocation } from'react-router-dom';
import { createPageUrl } from'@/utils';
import { useLanguage } from'./LanguageContext';
import { api } from'@/api/supabaseAPI';
import { cn } from'@/lib/utils';
import { 
 LayoutDashboard, 
 CreditCard, 
 Plus, 
 Store, 
 BarChart3, 
 Settings, 
 LogOut,
 ChevronLeft,
 ChevronRight,
 Users,
 Database,
 UsersRound,
 Sparkles,
 Wifi,
 BarChart2,
 ShoppingBag,
 Package,
 Layout,
 UserSquare2,
 Wand2,
 User,
} from'lucide-react';
import { Button } from'@/components/ui/button';
import { useQuery } from'@tanstack/react-query';
import {
 Collapsible,
 CollapsibleContent,
 CollapsibleTrigger,
} from"@/components/ui/collapsible";

const navItems = [
 { key:'dashboard', icon: LayoutDashboard, page:'Dashboard', label:'home' },
 { key:'cards', icon: CreditCard, page:'MyCards', label:'myCards' },
 { key:'create', icon: Plus, page:'CardBuilder', label:'createCard' },
 { key:'contacts', icon: Users, page:'MyContacts', label:'myContacts' },
 { key:'nfcProducts', icon: Store, page:'NFCProducts', label:'store' },
 { key:'myOrders', icon: Wifi, page:'MyOrders', label:'myOrders' },
 { key:'analytics', icon: BarChart3, page:'Analytics', label:'analytics' },
];

const advancedItems = [
 { key:'team', icon: UsersRound, page:'TeamManagement', label:'team', premium: true },
 { key:'crm', icon: Database, page:'CRMSettings', label:'CRM' },
 { key:'settings', icon: Settings, page:'Settings', label:'settings' },
];

const adminSections = [
 { key:'analytics', icon: BarChart2, section:'analytics', labelAr:'التحليلات', labelEn:'Analytics' },
 { key:'orders', icon: ShoppingBag, section:'orders', labelAr:'الطلبات', labelEn:'Orders' },
 { key:'products', icon: Package, section:'products', labelAr:'المنتجات', labelEn:'Products' },
 { key:'templates', icon: Layout, section:'templates', labelAr:'القوالب', labelEn:'Templates' },
 { key:'clients', icon: UserSquare2, section:'clients', labelAr:'العملاء', labelEn:'Clients' },
 { key:'cards', icon: CreditCard, section:'cards', labelAr:'البطاقات', labelEn:'Cards' },
 { key:'requests', icon: Wand2, section:'requests', labelAr:'طلبات التخصيص', labelEn:'Customizations' },
 { key:'adminSettings', icon: Settings, section:'settings', labelAr:'الإعدادات', labelEn:'Settings' },
];

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }) {
 const { t, isRTL } = useLanguage();
 const location = useLocation();
 const [advancedOpen, setAdvancedOpen] = useState(false);
 const [normalUserOpen, setNormalUserOpen] = useState(false);

 const { data: user } = useQuery({
 queryKey: ['current-user'],
 queryFn: () => api.auth.me()
 });

 const { data: subscription } = useQuery({
 queryKey: ['subscription'],
 queryFn: async () => {
 const me = await api.auth.me();
 if (!me?.id && !me?.email) return { plan:'free', card_limit: 2, status:'active' };
 const subsByUserId = me?.id
 ? await api.entities.Subscription.filter({ created_by_user_id: me.id },'-created_at')
 : [];
 if (subsByUserId[0]) return subsByUserId[0];
 const subsByEmail = me?.email
 ? await api.entities.Subscription.filter({ created_by: me.email },'-created_at')
 : [];
 return subsByEmail[0] || { plan:'free', card_limit: 2, status:'active' };
 }
 });

 const isAdmin = user?.role ==='admin';
 const isPremium = subscription?.plan ==='premium';

 const isActive = (page) => location.pathname.includes(page);

 // For admin sections: check if we're on Admin page with matching section param
 const isAdminSectionActive = (section) => {
 if (!location.pathname.includes('Admin')) return false;
 const params = new URLSearchParams(location.search);
 const current = params.get('section') || 'analytics';
 return current === section;
 };

 const handleLogout = () => {
 api.auth.logout(createPageUrl('Home'));
 };

 return (
 <>
 {/* Overlay for mobile */}
 {isOpen && (
 <div 
 className="fixed inset-0 bg-black/50 z-40 md:hidden"
 onClick={onClose}
 />
 )}

 {/* Sidebar */}
 <aside className={cn(
"fixed top-16 bottom-0 z-40 flex flex-col",
 "bg-[linear-gradient(180deg,#0C1429_0%,#1E1B4B_100%)] border-white/10",
"transition-all duration-300 ease-in-out",
 isRTL ?"right-0 border-l" :"left-0 border-r",
 collapsed ?"w-20" :"w-64",
 isOpen ?"translate-x-0" : isRTL ?"translate-x-full md:translate-x-0" :"-translate-x-full md:translate-x-0"
 )}>
 {/* Nav Items — scrollable so logout is always visible */}
 <nav className="flex-1 overflow-y-auto p-4 space-y-1">

 {/* ── ADMIN SECTIONS ─────────────────────────────── */}
 {isAdmin && (
 <>
 {!collapsed && (
 <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-300/70">
 {isRTL ?'إدارة النظام' :'Admin'}
 </p>
 )}
 {adminSections.map((item) => (
 <Link
 key={item.key}
 to={`${createPageUrl('Admin')}?section=${item.section}`}
 onClick={onClose}
 className={cn(
"flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200",
 isAdminSectionActive(item.section)
 ?"bg-gradient-to-r from-violet-500/30 to-indigo-500/20 text-white font-medium border border-violet-300/30"
 :"text-slate-300 hover:bg-white/10 hover:text-white",
 collapsed &&"justify-center px-2"
 )}
 >
 <item.icon className={cn("h-4 w-4 flex-shrink-0", isAdminSectionActive(item.section) &&"text-violet-200")} />
 {!collapsed && <span className="text-sm">{isRTL ? item.labelAr : item.labelEn}</span>}
 </Link>
 ))}

 <div className="my-3 border-t border-white/10" />

 {/* ── NORMAL USER collapsible ────────────────────── */}
 {!collapsed ? (
 <Collapsible open={normalUserOpen} onOpenChange={setNormalUserOpen}>
 <CollapsibleTrigger className={cn(
"flex items-center gap-3 px-4 py-2.5 rounded-xl w-full transition-all duration-200",
 "text-slate-300 hover:bg-white/10 hover:text-white"
 )}>
 <User className="h-4 w-4 flex-shrink-0" />
 <span className="flex-1 text-sm text-left">{isRTL ?'المستخدم العادي' :'Normal User'}</span>
 <ChevronRight className={cn("h-4 w-4 transition-transform", normalUserOpen &&"rotate-90")} />
 </CollapsibleTrigger>
 <CollapsibleContent className="space-y-1 mt-1">
 {navItems.map((item) => (
 <Link
 key={item.key}
 to={createPageUrl(item.page)}
 onClick={onClose}
 className={cn(
"flex items-center gap-3 py-2 px-4 rounded-xl transition-all duration-200",
 "text-slate-300 hover:bg-white/10 hover:text-white",
 isRTL ?"mr-5" :"ml-5",
 isActive(item.page) &&"bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/25 text-white font-medium border border-cyan-300/30"
 )}
 >
 <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive(item.page) &&"text-cyan-200")} />
 <span className="text-sm">{item.key ==='nfcProducts' ? (isRTL ?'منتجات NFC' :'NFC Products') : t(item.label)}</span>
 </Link>
 ))}
 <div className="mt-1">
 {advancedItems.map((item) => (
 <Link
 key={item.key}
 to={createPageUrl(item.page)}
 onClick={onClose}
 className={cn(
"flex items-center gap-3 py-2 px-4 rounded-xl transition-all duration-200",
 "text-slate-300 hover:bg-white/10 hover:text-white",
 isRTL ?"mr-5" :"ml-5",
 isActive(item.page) &&"bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/25 text-white font-medium border border-cyan-300/30"
 )}
 >
 <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive(item.page) &&"text-cyan-200")} />
 <span className="text-sm">{t(item.label)}</span>
 {item.premium && !isPremium && (
 <span className="text-xs bg-amber-400/20 text-amber-200 px-1.5 py-0.5 rounded">PRO</span>
 )}
 </Link>
 ))}
 </div>
 </CollapsibleContent>
 </Collapsible>
 ) : (
 /* Collapsed: show normal user items as icons */
 navItems.concat(advancedItems).map((item) => (
 <Link
 key={item.key}
 to={createPageUrl(item.page)}
 onClick={onClose}
 className={cn(
"flex items-center justify-center px-2 py-2.5 rounded-xl transition-all duration-200",
 "text-slate-300 hover:bg-white/10 hover:text-white",
 isActive(item.page) &&"bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/25 text-white font-medium border border-cyan-300/30"
 )}
 >
 <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive(item.page) &&"text-cyan-200")} />
 </Link>
 ))
 )}
 </>
 )}

 {/* ── NON-ADMIN: original layout ─────────────────── */}
 {!isAdmin && (
 <>
 {navItems.map((item) => (
 <Link
 key={item.key}
 to={createPageUrl(item.page)}
 onClick={onClose}
 className={cn(
"flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
 "text-slate-200 hover:bg-white/10",
 isActive(item.page) &&"bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/25 text-white font-medium border border-cyan-300/30",
 collapsed &&"justify-center px-2"
 )}
 >
 <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive(item.page) &&"text-cyan-200")} />
 {!collapsed && <span>{item.key ==='nfcProducts' ? (isRTL ?'منتجات NFC' :'NFC Products') : t(item.label)}</span>}
 </Link>
 ))}

 {/* Advanced Section */}
 {!collapsed && (
 <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
 <CollapsibleTrigger className={cn(
"flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200",
 "text-slate-200 hover:bg-white/10"
 )}>
 <Sparkles className="h-5 w-5 flex-shrink-0" />
 <span className="flex-1 text-left">{isRTL ?'متقدم' :'Advanced'}</span>
 <ChevronRight className={cn("h-4 w-4 transition-transform", advancedOpen &&"rotate-90")} />
 </CollapsibleTrigger>
 <CollapsibleContent className="space-y-1 mt-1">
 {advancedItems.map((item) => (
 <Link
 key={item.key}
 to={createPageUrl(item.page)}
 onClick={onClose}
 className={cn(
"flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-200",
 "text-slate-200 hover:bg-white/10",
 isRTL ?"mr-6" :"ml-6",
 isActive(item.page) &&"bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/25 text-white font-medium border border-cyan-300/30"
 )}
 >
 <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive(item.page) &&"text-cyan-200")} />
 <span className="text-sm">{t(item.label)}</span>
 {item.premium && !isPremium && (
 <span className="text-xs bg-amber-400/20 text-amber-200 px-1.5 py-0.5 rounded">PRO</span>
 )}
 </Link>
 ))}
 </CollapsibleContent>
 </Collapsible>
 )}

 {collapsed && advancedItems.map((item) => (
 <Link
 key={item.key}
 to={createPageUrl(item.page)}
 onClick={onClose}
 className={cn(
"flex items-center justify-center px-2 py-3 rounded-xl transition-all duration-200",
 "text-slate-200 hover:bg-white/10",
 isActive(item.page) &&"bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/25 text-white font-medium border border-cyan-300/30"
 )}
 >
 <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive(item.page) &&"text-cyan-200")} />
 </Link>
 ))}
 </>
 )}

 </nav>

 {/* Collapse Toggle (Desktop only) */}
 <div className="hidden md:block p-4 border-t border-white/10">
 <Button
 variant="ghost"
 size="sm"
 onClick={onToggleCollapse}
 className="w-full justify-center text-slate-200 hover:bg-white/10 hover:text-white"
 >
 {collapsed ? (
 isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
 ) : (
 isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
 )}
 </Button>
 </div>

 {/* Logout */}
 <div className="p-4 border-t border-white/10">
 <button
 onClick={handleLogout}
 className={cn(
"flex items-center gap-3 px-4 py-3 rounded-xl w-full",
 "text-red-300 hover:bg-red-500/15 transition-colors",
 collapsed &&"justify-center px-2"
 )}
 >
 <LogOut className="h-5 w-5 flex-shrink-0" />
 {!collapsed && <span>{t('logout')}</span>}
 </button>
 </div>
 </aside>
 </>
 );
}
