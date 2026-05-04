import React from'react';
import { Store } from'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from'@/components/ui/card';
import { useLanguage } from'@/components/shared/LanguageContext';
import NFCProductsPanel from'@/components/dashboard/NFCProductsPanel';

export default function NFCProducts() {
 const { isRTL } = useLanguage();

 return (
 <div className="max-w-7xl mx-auto space-y-8 text-slate-100">
 <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0C1429_0%,#1E1B4B_52%,#0C1429_100%)] p-8 text-white border border-white/15 shadow-[0_24px_80px_rgba(12,20,41,0.35)]">
 <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/15 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
 <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-400/15 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

 <div className="relative z-10">
 <div className="flex items-center gap-2 mb-2">
 <Store className="h-5 w-5 text-cyan-200" />
 <span className="text-cyan-200">{isRTL ?'منتجات NFC' :'NFC Products'}</span>
 </div>
 <h1 className="text-3xl md:text-4xl font-bold mb-2">
 {isRTL ?'خصّص واطلب منتج NFC الخاص بك' :'Customize and order your NFC product'}
 </h1>
 <p className="text-slate-200 max-w-2xl">
 {isRTL
 ?'اختر نوع المنتج، حدّد الخامة والتصميم، ثم أضفه إلى السلة وأكمل عملية الشراء من صفحة مستقلة داخل التطبيق.'
 :'Choose the product type, set the material and design, then add it to cart and complete checkout from a dedicated in-app page.'}
 </p>
 </div>
 </div>

 <Card className="bg-[linear-gradient(135deg,#0C1429_0%,#1E1B4B_52%,#0C1429_100%)] border-white/15 backdrop-blur-xl shadow-[0_24px_80px_rgba(12,20,41,0.45)]">
 <CardHeader className="pb-2">
 <CardTitle className="text-white flex items-center gap-2">
 <Store className="h-5 w-5" style={{ color:'#38BDF8' }} />
 {isRTL ?'منتجات NFC' :'NFC Products'}
 </CardTitle>
 <p className="text-sm text-slate-400 mt-1">
 {isRTL
 ?'خصّص منتج NFC الخاص بك وأضفه إلى السلة مباشرةً'
 :'Customize your NFC product and add it to cart directly'}
 </p>
 </CardHeader>
 <CardContent className="pt-4">
 <NFCProductsPanel />
 </CardContent>
 </Card>
 </div>
 );
}
