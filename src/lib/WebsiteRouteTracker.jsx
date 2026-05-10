import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageViewOnce } from '@/lib/websiteTracker';

function resolveTrackedPage(pathname) {
  if (pathname === '/') return { pageName: 'Home', section: 'landing' };
  if (pathname === '/demohome') return { pageName: 'Demo Home', section: 'landing' };
  if (pathname === '/NFC') return { pageName: 'NFC Landing', section: 'landing' };
  if (pathname === '/customize') return { pageName: 'Product Customization', section: 'customization' };
  if (pathname === '/CardSamples') return { pageName: 'Card Samples', section: 'samples' };
  if (pathname === '/Products' || pathname === '/products') return { pageName: 'Products', section: 'store' };
  if (pathname === '/Checkout') return { pageName: 'Checkout', section: 'checkout' };
  if (pathname === '/CheckoutSuccess') return { pageName: 'Checkout Success', section: 'checkout' };
  if (pathname.startsWith('/products/')) return { pageName: 'Product Detail', section: 'store' };
  return null;
}

export default function WebsiteRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const page = resolveTrackedPage(location.pathname);
    if (!page) return;

    trackPageViewOnce({
      pageName: page.pageName,
      path: location.pathname,
      metadata: {
        section: page.section,
        search: location.search || null,
      },
    });
  }, [location.pathname, location.search]);

  return null;
}
