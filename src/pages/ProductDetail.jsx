import React, { useState, useEffect } from'react';
import { useSearchParams, Link, useNavigate, useParams } from'react-router-dom';
import { useQuery } from'@tanstack/react-query';
import Navbar from'@/components/landing/Navbar';
import Footer from'@/components/landing/Footer';
import { Button } from'@/components/ui/button';
import { ShoppingCart, Check, ChevronRight, Minus, Plus, ArrowLeft, ArrowRight, Loader2, Play } from'lucide-react';
import { supabase } from'@/lib/supabaseClient';
import { productCategories } from'@/components/shared/productsData';
import { useCart } from'@/contexts/CartContext';
import { useLanguage } from'@/components/shared/LanguageContext';
import { resolveIsCustomizable } from'@/lib/customizerPrefill';
import Seo, { SITE_URL } from '@/components/shared/Seo';
import { normalizeProduct, staticProducts } from '@/lib/products';

// Resolve a product's video_url into either a direct <video> file or an
// embeddable iframe src (YouTube / Vimeo links).
function getVideoEmbed(url) {
 if (!url) return null;
 if (/\.(mp4|webm|mov|ogg)(\?|$)/i.test(url)) {
 return { type:'file', src: url };
 }
 const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
 if (yt) return { type:'embed', src: `https://www.youtube.com/embed/${yt[1]}` };
 const vimeo = url.match(/vimeo\.com\/(\d+)/);
 if (vimeo) return { type:'embed', src: `https://player.vimeo.com/video/${vimeo[1]}` };
 return { type:'embed', src: url };
}

export default function ProductDetail() {
 const { slug: slugParam } = useParams();
 const [searchParams] = useSearchParams();
 const legacyProductId = searchParams.get('id');
 const productIdentifier = slugParam || legacyProductId;
 const { lang, isRTL } = useLanguage();
 const language = lang;
 const { addItem } = useCart();
 const navigate = useNavigate();

 const [quantity, setQuantity] = useState(1);
 const [added, setAdded] = useState(false);
 const [selectedImage, setSelectedImage] = useState('');
 const [showVideo, setShowVideo] = useState(false);

 // Try fetching from Supabase
 const { data: dbProduct, isLoading: isLoadingProduct } = useQuery({
 queryKey: ['product-detail', productIdentifier],
 queryFn: async () => {
 if (!productIdentifier) return null;
 if (slugParam) {
 const { data: bySlug, error: slugError } = await supabase
 .from('products')
 .select('*')
 .eq('status','published')
 .eq('slug', productIdentifier)
 .maybeSingle();

 if (bySlug && !slugError) return normalizeProduct(bySlug);

 const { data: byId, error: idError } = await supabase
 .from('products')
 .select('*')
 .eq('status','published')
 .eq('id', productIdentifier)
 .maybeSingle();

 if (idError || !byId) return null;
 return normalizeProduct(byId);
 }

 const { data, error } = await supabase
 .from('products')
 .select('*')
 .eq('status','published')
 .eq('id', productIdentifier)
 .maybeSingle();

 if (error || !data) return null;
 return normalizeProduct(data);
 },
 enabled: !!productIdentifier,
 staleTime: 1000 * 60 * 5,
 });

 // Fallback to static data — only once the Supabase query has settled,
 // so we never flash the fallback copy and then swap it for the real one.
 const staticProduct = staticProducts.find((p) => p.slug === productIdentifier || p.id === productIdentifier);
 const product = isLoadingProduct ? dbProduct : (dbProduct || staticProduct);

 const galleryImages = [
 product?.main_image || product?.image_url,
 ...(Array.isArray(product?.extra_images) ? product.extra_images : []),
 ].filter(Boolean);

 const videoEmbed = getVideoEmbed(product?.video_url);

 useEffect(() => {
 setSelectedImage(galleryImages[0] ||'');
 setShowVideo(false);
 }, [product?.id, product?.slug]);

 const category = productCategories.find((c) => c.value === product?.category);

 // Related products (same category, exclude current)
 const { data: dbRelatedProducts = [], isLoading: isLoadingRelated } = useQuery({
 queryKey: ['related-products', product?.category, product?.id],
 queryFn: async () => {
 const { data, error } = await supabase
 .from('products')
 .select('*')
 .eq('status','published')
 .eq('category', product.category)
 .neq('id', product.id)
 .order('sort_order', { ascending: true })
 .limit(4);
 if (error) return [];
 return (data || []).map(normalizeProduct);
 },
 enabled: !!product?.category,
 staleTime: 1000 * 60 * 5,
 });

 const relatedProducts = isLoadingRelated
 ? []
 : dbRelatedProducts.length
 ? dbRelatedProducts
 : staticProducts
 .filter((p) => p.category === product?.category && p.id !== product?.id)
 .slice(0, 4);

 const handleAddToCart = () => {
 if (!product) return;
 for (let i = 0; i < quantity; i++) addItem(product, { pageName:'Product Detail', source:'product_detail', quantity: 1 });
 setAdded(true);
 setTimeout(() => setAdded(false), 2500);
 };

 if (isLoadingProduct && !product) {
 return (
 <div className="min-h-screen" style={{backgroundColor:'#0C1429'}}>
 <Navbar />
 <div className="public-subpage-offset flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
 <Loader2 className="h-10 w-10 animate-spin" style={{color:'#38BDF8'}} />
 </div>
 <Footer />
 </div>
 );
 }

 if (!product) {
 return (
 <div className="min-h-screen" style={{backgroundColor:'#0C1429'}}>
 <Navbar />
 <div className="public-subpage-offset flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
 <p className="text-xl text-slate-300">
 {language ==='ar' ?'المنتج غير موجود' :'Product not found'}
 </p>
 <Button onClick={() => navigate('/Products')} variant="outline">
 {language ==='ar' ?'العودة للمنتجات' :'Back to Products'}
 </Button>
 </div>
 <Footer />
 </div>
 );
 }

 const productName = language ==='ar' ? (product.name_ar || product.name_en || product.name) : (product.name_en || product.name || product.name_ar);
 const productDescription = language ==='ar' ? (product.description_ar || product.description_en || product.description) : (product.description_en || product.description || product.description_ar);
 const productSlug = product.slug || product.id;
 const productImage = product.main_image || product.image_url;

 return (
 <div className="min-h-screen" style={{backgroundColor:'#0C1429'}} dir={isRTL ?'rtl' :'ltr'}>
 <Seo
 title={`${productName} | Rawajcard`}
 description={productDescription || (language ==='ar' ? `اطلب ${productName} من رواج كارد بسعر ${product.price} ر.س.` : `Order ${productName} from Rawajcard for ${product.price} SAR.`)}
 path={`/products/${encodeURIComponent(productSlug)}`}
 image={productImage}
 type="product"
 jsonLd={[
 {
 '@context':'https://schema.org',
 '@type':'Product',
 name: productName,
 description: productDescription || undefined,
 image: productImage ? [productImage] : undefined,
 sku: String(product.id),
 offers: {
 '@type':'Offer',
 url: `${SITE_URL}/products/${encodeURIComponent(productSlug)}`,
 priceCurrency:'SAR',
 price: String(product.price),
 availability:'https://schema.org/InStock',
 },
 },
 {
 '@context':'https://schema.org',
 '@type':'BreadcrumbList',
 itemListElement: [
 { '@type':'ListItem', position: 1, name:'Home', item: SITE_URL },
 { '@type':'ListItem', position: 2, name:'Products', item: `${SITE_URL}/products` },
 { '@type':'ListItem', position: 3, name: productName, item: `${SITE_URL}/products/${encodeURIComponent(productSlug)}` },
 ],
 },
 ]}
 />
 <Navbar />

 <div className="container public-subpage-offset mx-auto px-4 md:px-6 pb-20">

 {/* Breadcrumb */}
 <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 mb-10">
 <Link to="/" className="hover:text-sky-400 transition-colors">
 {language ==='ar' ?'الرئيسية' :'Home'}
 </Link>
 <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
 <Link to="/Products" className="hover:text-sky-400 transition-colors">
 {language ==='ar' ?'المنتجات' :'Products'}
 </Link>
 {category && (
 <>
 <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
 <Link
 to={`/Products?category=${category.value}`}
 className="hover:text-sky-400 transition-colors"
 >
 {language ==='ar' ? category.label_ar : category.label_en}
 </Link>
 </>
 )}
 <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
 <span className="text-white font-medium line-clamp-1">
 {language ==='ar' ? (product.name_ar || product.name_en || product.name) : (product.name_en || product.name || product.name_ar)}
 </span>
 </nav>

 {/* Main Product Section */}
 <div className="grid lg:grid-cols-2 gap-12 mb-24">

 {/* Product Image */}
 <div className="space-y-4">
 <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-square shadow-xl">
 {showVideo && videoEmbed ? (
 videoEmbed.type ==='file' ? (
 <video
 src={videoEmbed.src}
 controls
 autoPlay
 className="w-full h-full object-contain"
 />
 ) : (
 <iframe
 src={videoEmbed.src}
 title={language ==='ar' ? (product.name_ar || product.name_en) : (product.name_en || product.name_ar)}
 className="w-full h-full"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
 allowFullScreen
 />
 )
 ) : (
 <img
 src={selectedImage || product.main_image || product.image_url}
 alt={language ==='ar' ? (product.name_ar || product.name_ar || product.name_en) : (product.name_en || product.name || product.name_ar)}
 className="w-full h-full object-contain"
 />
 )}
 {!showVideo && product.discount_percentage > 0 && (
 <div className="absolute top-5 ltr:right-5 rtl:left-5 bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
 -{product.discount_percentage}%
 </div>
 )}
 {!showVideo && resolveIsCustomizable(product) && (
 <div className="absolute top-5 ltr:left-5 rtl:right-5 bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow">
 {language ==='ar' ?'قابل للتخصيص' :'Customizable'}
 </div>
 )}
 </div>
 {(galleryImages.length > 1 || videoEmbed) && (
 <div className="grid grid-cols-5 gap-2">
 {galleryImages.map((img, idx) => (
 <button
 key={`${img}-${idx}`}
 type="button"
 onClick={() => { setSelectedImage(img); setShowVideo(false); }}
 className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
 !showVideo && selectedImage === img
 ?'border-sky-400 ring-2 ring-sky-400/30'
 :'border-slate-700 hover:border-sky-400'
 }`}
 >
 <img src={img} alt="" className="w-full h-full object-cover" />
 </button>
 ))}
 {videoEmbed && (
 <button
 type="button"
 onClick={() => setShowVideo(true)}
 className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all bg-slate-800 ${
 showVideo
 ?'border-sky-400 ring-2 ring-sky-400/30'
 :'border-slate-700 hover:border-sky-400'
 }`}
 aria-label={language ==='ar' ?'تشغيل فيديو المنتج' :'Play product video'}
 >
 {(product.main_image || product.image_url) && (
 <img src={product.main_image || product.image_url} alt="" className="w-full h-full object-cover opacity-50" />
 )}
 <span className="absolute inset-0 flex items-center justify-center">
 <Play className="w-6 h-6 text-white fill-white" />
 </span>
 </button>
 )}
 </div>
 )}
 </div>

 {/* Product Info */}
 <div className="flex flex-col justify-center space-y-6">

 {/* Category badge */}
 {category && (
 <Link
 to={`/Products?category=${category.value}`}
 className="inline-flex items-center gap-1.5 text-cyan-600 text-sm font-semibold hover:underline w-fit"
 >
 <span>{category.icon}</span>
 {language ==='ar' ? category.label_ar : category.label_en}
 </Link>
 )}

 {/* Name */}
 <h1 className="text-3xl md:text-4xl font-bold text-white leading-snug">
 {language ==='ar' ? (product.name_ar || product.name_en || product.name) : (product.name_en || product.name || product.name_ar)}
 </h1>

 {/* Description */}
 {(product.description_ar || product.description_en) && (
 <p className="text-slate-300 text-lg leading-relaxed">
 {language ==='ar' ? (product.description_ar || product.description_en || product.description) : (product.description_en || product.description || product.description_ar)}
 </p>
 )}

 {/* Price */}
 <div className="flex flex-wrap items-baseline gap-3">
 <span className="text-4xl font-extrabold" style={{color:'#38BDF8'}}>
 {product.price}
 <span className="text-xl font-semibold ml-1">
 {language ==='ar' ?'ر.س' :'SAR'}
 </span>
 </span>
 {product.original_price && (
 <span className="text-xl text-slate-400 line-through">
 {product.original_price} {language ==='ar' ?'ر.س' :'SAR'}
 </span>
 )}
 {product.discount_percentage > 0 && (
 <span className="bg-red-900/40 text-red-400 px-3 py-1 rounded-full text-sm font-bold">
 {language ==='ar'
 ?`وفر ${product.discount_percentage}%`
 :`Save ${product.discount_percentage}%`}
 </span>
 )}
 </div>

 {/* Features */}
 {(product.features_en?.length || product.features_ar?.length) ? (
 <div>
 <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
 {language ==='ar' ?'المميزات' :'Features'}
 </p>
 <ul className="grid sm:grid-cols-2 gap-2">
 {(language ==='ar' ? product.features_ar : product.features_en)?.map((f, i) => (
 <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
 <Check className="w-4 h-4 text-cyan-500 flex-shrink-0" />
 {f}
 </li>
 ))}
 </ul>
 </div>
 ) : null}

 {/* Quantity selector + Add to cart */}
 <div className="flex items-center gap-4 pt-2">
 <div className="flex items-center border border-slate-700 rounded-full overflow-hidden">
 <button
 onClick={() => setQuantity((q) => Math.max(1, q - 1))}
 className="px-4 py-3 hover:bg-slate-800 transition-colors"
 aria-label="Decrease quantity"
 >
 <Minus className="w-4 h-4" />
 </button>
 <span className="px-5 py-3 font-bold text-lg min-w-[3.5rem] text-center select-none">
 {quantity}
 </span>
 <button
 onClick={() => setQuantity((q) => q + 1)}
 className="px-4 py-3 hover:bg-slate-800 transition-colors"
 aria-label="Increase quantity"
 >
 <Plus className="w-4 h-4" />
 </button>
 </div>

 <Button
 onClick={handleAddToCart}
 className="flex-1 bg-gradient-to-r from-sky-500 to-fuchsia-500 hover:from-sky-400 hover:to-fuchsia-400 text-white rounded-full h-12 text-base font-semibold shadow-lg shadow-sky-500/20 transition-all"
 >
 {added ? (
 <>
 <Check className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
 {language ==='ar' ?'تمت الإضافة!' :'Added to Cart!'}
 </>
 ) : (
 <>
 <ShoppingCart className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
 {language ==='ar' ?'أضف للسلة' :'Add to Cart'}
 </>
 )}
 </Button>
 </div>
 </div>
 </div>

 {/* Related Products */}
 {relatedProducts.length > 0 && (
 <section>
 <div className="flex items-center justify-between mb-8">
 <h2 className="text-2xl font-bold text-white">
 {language ==='ar' ?'منتجات مشابهة' :'Related Products'}
 </h2>
 {category && (
 <Link
 to={`/Products?category=${category.value}`}
 className="text-sm text-cyan-600 font-medium hover:underline flex items-center gap-1"
 >
 {language ==='ar' ?'عرض الكل' :'View all'}
 {isRTL ? (
 <ArrowLeft className="w-4 h-4" />
 ) : (
 <ArrowRight className="w-4 h-4" />
 )}
 </Link>
 )}
 </div>
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {relatedProducts.map((p) => (
 <Link
 key={p.id}
 to={`/products/${encodeURIComponent(p.slug || p.id)}`}
 className="group rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all duration-300" style={{backgroundColor:'#1E1B4B', border:'1px solid rgba(56,189,248,0.15)'}}
 >
 <div className="relative aspect-square overflow-hidden bg-slate-900">
 <img
 src={p.image_url}
 alt={language ==='ar' ? (p.name_ar || p.name_en || p.name) : (p.name_en || p.name || p.name_ar)}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
 />
 {p.discount_percentage > 0 && (
 <div className="absolute top-2 ltr:right-2 rtl:left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
 -{p.discount_percentage}%
 </div>
 )}
 </div>
 <div className="p-4">
 <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2">
 {language ==='ar' ? (p.name_ar || p.name_en || p.name) : (p.name_en || p.name || p.name_ar)}
 </h3>
 <div className="flex items-center gap-2">
 <span className="text-cyan-600 font-bold">
 {p.price} {language ==='ar' ?'ر.س' :'SAR'}
 </span>
 {p.original_price && (
 <span className="text-xs text-slate-400 line-through">
 {p.original_price}
 </span>
 )}
 </div>
 </div>
 </Link>
 ))}
 </div>
 </section>
 )}
 </div>

 <Footer />
 </div>
 );
}
