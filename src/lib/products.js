import { productsData } from '@/components/shared/productsData';

// Map a Supabase `products` row to the display shape shared by the
// Products, ProductDetail, and Home pages.
export const normalizeProduct = (p) => ({
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

// Static fallback data, shown while Supabase is loading or has no rows yet.
export const staticProducts = productsData.map((p) => ({
  ...p,
  slug: p.slug || p.id,
  main_image: p.image_url,
  extra_images: p.extra_images ?? [],
  product_name: p.name_en,
  product_price: p.price,
  product_image: p.image_url,
}));

export async function fetchPublishedProducts(supabase) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []).map(normalizeProduct);
}
