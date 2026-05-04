import React, { useState, useEffect } from'react';
import { useSearchParams, Link } from'react-router-dom';
import { useQuery } from'@tanstack/react-query';
import Navbar from'@/components/landing/Navbar';
import Footer from'@/components/landing/Footer';
import { Button } from'@/components/ui/button';
import { ShoppingCart, Loader2 } from'lucide-react';
import { supabase } from'@/lib/supabaseClient';
import { productsData } from'@/components/shared/productsData';
import { useCart } from'@/contexts/CartContext';
import { resolveIsCustomizable } from'@/lib/customizerPrefill';

// Map Supabase row → display shape
const normalizeProduct = (p) => ({
 ...p,
 image_url: p.main_image,
 name_en: p.name,
 description_en: p.description,
 original_price: p.sale_price ? p.price : null,
 price: p.sale_price ?? p.price,
 discount_percentage: p.sale_price
 ? Math.round(((p.price - p.sale_price) / p.price) * 100)
 : 0,
 product_name: p.name,
 product_price: p.sale_price ?? p.price,
 product_image: p.main_image,
});

// Static fallback
const staticProducts = productsData.map((p) => ({
 ...p,
 product_name: p.name_en,
 product_price: p.price,
 product_image: p.image_url,
}));

export default function Products() {
 const [searchParams, setSearchParams] = useSearchParams();
 const [language, setLanguage] = useState('ar');
 const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ||'all');
 const { addItem } = useCart();

 // Sync category with URL param changes
 useEffect(() => {
 const cat = searchParams.get('category');
 setSelectedCategory(cat ||'all');
 }, [searchParams]);

 useEffect(() => {
 const sync = () => {
 const dir = document.documentElement.getAttribute('dir');
 setLanguage(dir ==='rtl' ?'ar' :'en');
 };
 sync();
 const obs = new MutationObserver(sync);
 obs.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
 return () => obs.disconnect();
 }, []);

 const { data: dbProducts, isLoading } = useQuery({
 queryKey: ['products-page'],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('products')
 .select('*')
 .eq('status','published')
 .order('sort_order', { ascending: true });
 if (error) throw error;
 return (data || []).map(normalizeProduct);
 },
 staleTime: 1000 * 60 * 5,
 });

 const products = dbProducts?.length ? dbProducts : staticProducts;

 const t = {
 en: {
 title:'Our Products', subtitle:'Digital Solutions for Modern Business',
 addToCart:'Add to Cart', sar:'SAR', loading:'Loading...',
 customizable:'Customizable',
 cats: { all:'All Products', business_cards:'Business Cards', keychains:'Keychains', stands:'Table Stands' },
 },
 ar: {
 title:'منتجاتنا', subtitle:'حلول رقمية للأعمال الحديثة',
 addToCart:'أضف للسلة', sar:'ر.س', loading:'جار التحميل...',
 customizable:'قابل للتخصيص',
 cats: { all:'جميع المنتجات', business_cards:'بطاقات الأعمال', keychains:'تعليقات المفاتيح', stands:'ستاندات الطاولة' },
 },
 }[language];

 const filteredProducts = selectedCategory ==='all'
 ? products
 : products.filter((p) => p.category === selectedCategory);

 const categories = [
 { value:'all', label: t.cats.all },
 { value:'business_cards', label: t.cats.business_cards },
 { value:'keychains', label: t.cats.keychains },
 { value:'stands', label: t.cats.stands },
 ];

 return (
 <div className="min-h-screen" style={{ backgroundColor: '#0C1429' }}>
 <Navbar />

 {/* Hero */}
 <section className="public-subpage-offset pb-16 relative overflow-hidden" style={{ backgroundColor: '#0C1429' }}>
 <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(56,189,248,0.12) 0%, transparent 70%)' }} />
 <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
 <span className="inline-block text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: '#38BDF8' }}>
 {language === 'ar' ? 'متجرنا' : 'Our Store'}
 </span>
 <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.title}</h1>
 <p className="text-lg" style={{ color: 'rgba(255,255,255,0.65)' }}>{t.subtitle}</p>
 </div>
 </section>

 {/* Filters */}
 <section className="py-8" style={{ borderBottom: '1px solid rgba(56,189,248,0.15)', backgroundColor: '#0C1429' }}>
 <div className="container mx-auto px-4 md:px-6">
 <div className="flex flex-wrap gap-3 justify-center">
 {categories.map((cat) => (
 <button
 key={cat.value}
 onClick={() => setSearchParams(cat.value === 'all' ? {} : { category: cat.value })}
 className="px-6 py-2 rounded-full font-medium transition-all"
 style={selectedCategory === cat.value
 ? { background: 'linear-gradient(135deg, #38BDF8, #E879F9)', color: '#fff', boxShadow: '0 0 16px rgba(56,189,248,0.3)' }
 : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.12)' }
 }
 >
 {cat.label}
 </button>
 ))}
 </div>
 </div>
 </section>

 {/* Products Grid */}
 <section className="py-16" style={{ backgroundColor: '#0C1429' }}>
 <div className="container mx-auto px-4 md:px-6">
 {isLoading && !dbProducts ? (
 <div className="flex items-center justify-center py-20">
 <Loader2 className="h-12 w-12 animate-spin" style={{ color: '#38BDF8' }} />
 </div>
 ) : (
 <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {filteredProducts.map((product) => (
 <Link
 key={product.id}
 to={`/products/${encodeURIComponent(product.slug || product.id)}`}
 className="group rounded-2xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer block"
 style={{ backgroundColor: '#1E1B4B', border: '1px solid rgba(56,189,248,0.15)' }}
 onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(56,189,248,0.4)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(56,189,248,0.15)'; }}
 onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(56,189,248,0.15)'; e.currentTarget.style.boxShadow = ''; }}
 onClick={(e) => {
 // Let the Link handle navigation unless clicking Add to Cart
 }}
 >
 {/* Image */}
 <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
 <img
 src={product.image_url}
 alt={language === 'ar' ? (product.name_ar || product.name_en || product.name) : (product.name_en || product.name || product.name_ar)}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
 />
 {product.discount_percentage > 0 && (
 <div className="absolute top-3 right-3 text-white px-3 py-1 rounded-full text-sm font-bold" style={{ background: 'linear-gradient(135deg, #E879F9, #a855f7)' }}>
 -{product.discount_percentage}%
 </div>
 )}
 {resolveIsCustomizable(product) && (
 <div className="absolute top-3 left-3 text-white px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(56,189,248,0.85)' }}>
 {t.customizable}
 </div>
 )}
 </div>

 {/* Info */}
 <div className="p-5">
 <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
 {language === 'ar' ? (product.name_ar || product.name_en || product.name) : (product.name_en || product.name || product.name_ar)}
 </h3>
 <p className="text-sm mb-4 line-clamp-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
 {language === 'ar' ? (product.description_ar || product.description_en || product.description) : (product.description_en || product.description || product.description_ar)}
 </p>

 {/* Price */}
 <div className="flex items-center gap-2 mb-4">
 <span className="text-2xl font-bold" style={{ color: '#38BDF8' }}>
 {product.price} {t.sar}
 </span>
 {product.original_price && (
 <span className="text-sm line-through" style={{ color: 'rgba(255,255,255,0.35)' }}>
 {product.original_price} {t.sar}
 </span>
 )}
 </div>

 <Button
 className="w-full text-white rounded-full font-semibold"
 style={{ background: 'linear-gradient(135deg, #38BDF8, #E879F9)' }}
 onClick={(e) => { e.stopPropagation(); addItem(product, { pageName: 'Products', source: 'products_grid' }); }}
 >
 <ShoppingCart className="w-4 h-4 mr-2" />
 {t.addToCart}
 </Button>
 </div>
 </Link>
 ))}
 </div>
 )}
 </div>
 </section>

 <Footer />
 </div>
 );
}
