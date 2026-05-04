import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const VISITOR_ID_KEY = 'rawaj_site_visitor_id';
const SESSION_ID_KEY = 'rawaj_site_session_id';
const PAGE_VIEW_DEDUPE_PREFIX = 'rawaj_site_pageview:';

function randomId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

function getStorageSafe(type) {
  if (typeof window === 'undefined') return null;
  return type === 'local' ? window.localStorage : window.sessionStorage;
}

function getOrCreateId(storageType, key, prefix) {
  const storage = getStorageSafe(storageType);
  if (!storage) return randomId(prefix);

  let value = storage.getItem(key);
  if (!value) {
    value = randomId(prefix);
    storage.setItem(key, value);
  }

  return value;
}

export function getTrackingContext() {
  return {
    visitorId: getOrCreateId('local', VISITOR_ID_KEY, 'visitor'),
    sessionId: getOrCreateId('session', SESSION_ID_KEY, 'session'),
    path: typeof window !== 'undefined' ? window.location.pathname : null,
    href: typeof window !== 'undefined' ? window.location.href : null,
    referrer: typeof document !== 'undefined' ? document.referrer || null : null,
  };
}

export function buildProductTrackingData(product, extra = {}) {
  return {
    product_id: product?.id || null,
    product_slug: product?.slug || null,
    product_name: product?.name || product?.name_en || product?.title || product?.name_ar || null,
    product_name_ar: product?.name_ar || null,
    category: product?.category || null,
    price: Number(product?.price ?? product?.product_price ?? 0) || 0,
    currency: product?.currency || 'SAR',
    ...extra,
  };
}

export function buildCartTrackingData(items = []) {
  const normalizedItems = items.map((item) => ({
    product_id: item?.product_id || item?.id || null,
    product_name: item?.product_name || item?.name || null,
    quantity: Math.max(1, Number(item?.quantity) || 1),
    unit_price: Number(item?.product_price ?? item?.price ?? 0) || 0,
  }));

  return {
    items_count: normalizedItems.reduce((sum, item) => sum + item.quantity, 0),
    cart_value: normalizedItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
    items: normalizedItems,
  };
}

export async function trackWebsiteEvent(eventName, options = {}) {
  if (!isSupabaseConfigured || typeof window === 'undefined') return false;

  const context = getTrackingContext();
  const {
    pageName = null,
    path = context.path,
    referrer = context.referrer,
    metadata = {},
    userId = null,
    userEmail = null,
  } = options;

  try {
    const { error } = await supabase.from('site_events').insert({
      event_name: eventName,
      page_name: pageName,
      path,
      referrer,
      visitor_id: context.visitorId,
      session_id: context.sessionId,
      user_id: userId,
      user_email: userEmail,
      metadata: {
        ...metadata,
        href: context.href,
      },
    });

    if (error) {
      console.warn('[websiteTracker] failed to track event', eventName, error.message || error);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('[websiteTracker] unexpected tracking error', eventName, error);
    return false;
  }
}

export async function trackPageViewOnce({ pageName, path, metadata = {}, dedupeMs = 3000 }) {
  if (typeof window === 'undefined') return false;

  const effectivePath = path || window.location.pathname;
  const storage = getStorageSafe('session');
  const dedupeKey = `${PAGE_VIEW_DEDUPE_PREFIX}${effectivePath}`;
  const now = Date.now();
  const lastLoggedAt = Number(storage?.getItem(dedupeKey) || 0);

  if (lastLoggedAt && now - lastLoggedAt < dedupeMs) return false;

  storage?.setItem(dedupeKey, String(now));

  return trackWebsiteEvent('page_view', {
    pageName,
    path: effectivePath,
    metadata,
  });
}
