import React, { useEffect, useState } from'react';
import { cn } from'@/lib/utils';
import { useLanguage } from'@/components/shared/LanguageContext';
import Header from'@/components/shared/Header';
import Sidebar from'@/components/shared/Sidebar';
import MobileBottomNav from'@/components/shared/MobileBottomNav';
import CartSidebar from'@/components/store/CartSidebar';
import CartMiniPopup from'@/components/store/CartMiniPopup';
import { useCart } from'@/contexts/CartContext';
import { useAuth } from'@/lib/AuthContext';
import WhatsAppButton from'@/components/shared/WhatsAppButton';

function LayoutContent({ children, currentPageName }) {
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
 // const [promoOpen, setPromoOpen] = useState(false); // Disabled promo popup
 const { isRTL } = useLanguage();
 const { isAuthenticated, isLoadingAuth } = useAuth();

 // Public pages that don't need sidebar
 const publicPages = ['PublicCard','CheckoutSuccess','Home','Products','ProductDetail','Pricing','Store','Checkout','PhysicalCards','CardSamples','NFCCustomizer','PrivacyPolicy','Return','PaymentsPolicy','Guides','GuideDetail'];
 const isPublicPage = publicPages.includes(currentPageName);
 const isHomePage = currentPageName ==='Home';

 useEffect(() => {
 let timer;

 if (typeof window ==='undefined') return;

 if (isPublicPage && isHomePage && !isLoadingAuth && !isAuthenticated) {
 const shown = sessionStorage.getItem('rawaj_promo_home_shown');
 if (!shown) {
 timer = setTimeout(() => {
 // setPromoOpen(true);
 sessionStorage.setItem('rawaj_promo_home_shown','1');
 }, 6000);
 }
 }

 return () => {
 if (timer) clearTimeout(timer);
 };
 }, [isPublicPage, isHomePage, isLoadingAuth, isAuthenticated]);



 // Cart state from global context (localStorage – works for auth & guest)
 const { items: cartItems, removeItem, updateQuantity, isCartOpen, setIsCartOpen, totalCount } = useCart();

 if (isPublicPage) {
 return (
 <div className="min-h-screen bg-slate-50" style={{ overscrollBehavior:'none' }}>
 {children}
 <CartSidebar
 isOpen={isCartOpen}
 onClose={() => setIsCartOpen(false)}
 items={cartItems}
 onUpdateQuantity={updateQuantity}
 onRemove={removeItem}
 />
 <CartMiniPopup />
 <WhatsAppButton />
 {/* {!isAuthenticated && <PromotionPopup open={promoOpen} onOpenChange={setPromoOpen} isRTL={isRTL} />} */}
 </div>
 );
 }

 return (
 <div className={cn("min-h-screen bg-[#0C1429]", isRTL &&"rtl")} style={{ overscrollBehavior:'none' }}>
 <style>{``}</style>

 <Header 
 onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
 isMenuOpen={sidebarOpen}
 cartCount={totalCount}
 />
 
 <Sidebar 
 isOpen={sidebarOpen}
 onClose={() => setSidebarOpen(false)}
 collapsed={sidebarCollapsed}
 onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
 />

 <main className={cn(
"pt-16 min-h-screen transition-all duration-300 pb-20 md:pb-0",
 isRTL 
 ? sidebarCollapsed ?"md:mr-20" :"md:mr-64"
 : sidebarCollapsed ?"md:ml-20" :"md:ml-64"
 )}>
 <div className="p-4 md:p-6 lg:p-8">
 {children}
 </div>
 </main>

 <MobileBottomNav />
 <CartSidebar
 isOpen={isCartOpen}
 onClose={() => setIsCartOpen(false)}
 items={cartItems}
 onUpdateQuantity={updateQuantity}
 onRemove={removeItem}
 />
 <CartMiniPopup />
 <WhatsAppButton />
 {/* {!isAuthenticated && <PromotionPopup open={promoOpen} onOpenChange={setPromoOpen} isRTL={isRTL} />} */}
 </div>
 );
}

export default function Layout({ children, currentPageName }) {
 return (
 <LayoutContent currentPageName={currentPageName}>
 {children}
 </LayoutContent>
 );
}