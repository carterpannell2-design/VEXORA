
/**
 * Vexora AdBlocker Service
 * A client-side content filter that blocks common ad domains and elements.
 */

const AD_DOMAINS = [
  'doubleclick.net',
  'googleadservices.com',
  'googlesyndication.com',
  'adnxs.com',
  'advertising.com',
  'amazon-adsystem.com',
  'casalemedia.com',
  'criteo.com',
  'openx.net',
  'pubmatic.com',
  'rubiconproject.com',
  'taboola.com',
  'outbrain.com',
  'adroll.com',
  'adform.net',
  'bidswitch.net',
  'carbonads.net',
  'buysellads.com',
  'media.net',
  'yieldmo.com',
  'moatads.com',
  'quantserve.com',
  'scorecardresearch.com',
  'crazygames.com/ads', // Specific for game sites
  'poki.com/ads',
  'y8.com/ads',
  'gamemonetize.com',
  'gamemonetize.co',
  'google-analytics.com',
  'googletagmanager.com',
  'googletagservices.com',
  'pagead2.googlesyndication.com',
  'partner.googleadservices.com',
  'adservice.google.com',
  'adservice.google.com.au',
  'securepubads.g.doubleclick.net',
  'tpc.googlesyndication.com',
  'google.com/adsense',
  'google.com/ads',
  'ad.doubleclick.net',
  'ads.pubmatic.com',
  'ads.rubiconproject.com',
  'criteo.net',
  'ads.yieldmo.com',
  'script.google.com/macros/s/AKfycbzNG4z_PlG6Ke_bX5wSPKK2uBRB3IY9ouVzqM1shucYhSTvsJWRmyMyZaaC2z5S3ADN/exec'
];

const AD_SELECTORS = [
  '.adsbygoogle',
  '[id^="google_ads_"]',
  '[class^="ad-"]',
  '[id^="ad-"]',
  '.ad-container',
  '.ad-wrapper',
  '.ad-slot',
  '.ad-banner',
  '.sponsored-content',
  '.promoted-content',
  'iframe[src*="ads"]',
  'iframe[src*="doubleclick"]',
  'iframe[src*="gamemonetize"]',
  'iframe[src*="script.google.com/macros"]',
  'ins.adsbygoogle',
  '#ad-box',
  '.ad-box',
  '.ad-unit',
  '.ad-sidebar',
  '.ad-header',
  '.ad-footer',
  '.ad-overlay',
  '.ad-popup',
  '#ad-container',
  '#close-ad',
  '#ad-iframe'
];

let isEnabled = false;
let observer: MutationObserver | null = null;
let originalFetch: typeof fetch | null = null;
let originalXHR: typeof XMLHttpRequest | null = null;

/**
 * Checks if a URL should be blocked
 */
function shouldBlock(url: string): boolean {
  if (!isEnabled) return false;
  const lowerUrl = url.toLowerCase();
  return AD_DOMAINS.some(domain => lowerUrl.includes(domain));
}

/**
 * Removes ad elements from the DOM
 */
function removeAds() {
  if (!isEnabled) return;
  AD_SELECTORS.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      (el as HTMLElement).style.display = 'none';
      el.remove();
    });
  });
}

/**
 * Initializes the AdBlocker
 */
export function initAdBlocker(enabled: boolean) {
  isEnabled = enabled;

  if (isEnabled) {
    enable();
  } else {
    disable();
  }
}

/**
 * Enables the AdBlocker
 */
function enable() {
  isEnabled = true;
  
  // 1. Intercept Fetch
  if (!originalFetch) {
    originalFetch = window.fetch;
    try {
      const interceptedFetch = async (...args: any[]) => {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
        if (shouldBlock(url)) {
          console.warn(`[Vexora AdBlocker] Blocked fetch: ${url}`);
          return new Response(null, { status: 204, statusText: 'No Content' });
        }
        return (originalFetch as any)(...args);
      };

      Object.defineProperty(window, 'fetch', {
        value: interceptedFetch,
        configurable: true,
        writable: true,
        enumerable: true
      });
    } catch (e) {
      console.error('[Vexora AdBlocker] Failed to intercept fetch:', e);
    }
  }

  // 2. Intercept XHR
  if (!originalXHR) {
    originalXHR = window.XMLHttpRequest;
    try {
      const open = XMLHttpRequest.prototype.open;
      // @ts-ignore
      XMLHttpRequest.prototype.open = function(method: string, url: string) {
        if (shouldBlock(url)) {
          console.warn(`[Vexora AdBlocker] Blocked XHR: ${url}`);
          // We still call the original open but with a dummy URL or just skip it
          // Actually, skipping it might cause send() to throw.
          // Better to redirect to a non-existent local URL that returns nothing.
          return open.apply(this, [method, 'data:text/plain,blocked'] as any);
        }
        return open.apply(this, arguments as any);
      };
    } catch (e) {
      console.error('[Vexora AdBlocker] Failed to intercept XHR:', e);
    }
  }

  // 3. DOM Observer
  if (!observer) {
    observer = new MutationObserver(() => {
      removeAds();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 4. Initial cleanup
  removeAds();

  // 5. Inject CSS
  const styleId = 'vexora-adblocker-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      ${AD_SELECTORS.join(', ')} {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  console.log('[Vexora AdBlocker] Enabled');
}

/**
 * Disables the AdBlocker
 */
function disable() {
  isEnabled = false;

  // Restore Fetch
  if (originalFetch) {
    try {
      Object.defineProperty(window, 'fetch', {
        value: originalFetch,
        configurable: true,
        writable: true,
        enumerable: true
      });
    } catch (e) {
      // @ts-ignore
      window.fetch = originalFetch;
    }
    originalFetch = null;
  }

  // Restore XHR
  if (originalXHR) {
    try {
      XMLHttpRequest.prototype.open = originalXHR.prototype.open;
    } catch (e) {
      console.error('[Vexora AdBlocker] Failed to restore XHR:', e);
    }
    originalXHR = null;
  }

  // Stop Observer
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Remove CSS
  const style = document.getElementById('vexora-adblocker-style');
  if (style) {
    style.remove();
  }

  console.log('[Vexora AdBlocker] Disabled');
}

/**
 * Updates the AdBlocker state
 */
export function updateAdBlocker(enabled: boolean) {
  if (enabled === isEnabled) return;
  if (enabled) {
    enable();
  } else {
    disable();
  }
}
