import { cleanUrl, clearAnalyticsStorage, normalizeCounterId } from './analytics.js';

export const MYTRACKER_SCRIPT_URL = 'https://mytopf.com/js/code.js';
export const MYTRACKER_FALLBACK_URL = 'https://top-fwz1.mail.ru/js/code.js';
const scriptUrls = [MYTRACKER_SCRIPT_URL, MYTRACKER_FALLBACK_URL];
// MyTracker also creates first-party identifiers through its privacy sync SDK.
const syncStorageKeys = new Set(['rb_sync_id', 'domain_sid']);
const isTrackerStorageKey = key => key.startsWith('tmr_') || syncStorageKeys.has(key);

export function createMyTracker({ counterId, enabled = false, windowRoot = window, documentRoot = document } = {}) {
  const id = normalizeCounterId(counterId);
  const isEnabled = enabled === true && id !== null;
  let script = null;
  let requested = false;
  let generation = 0;
  let needsReload = false;
  let revoked = false;

  const load = index => {
    const currentGeneration = ++generation;
    script = documentRoot.createElement('script');
    script.id = 'tmr-code';
    script.async = true;
    script.src = scriptUrls[index];
    script.dataset.mytrackerLoader = String(id);
    script.onload = () => {
      if (!requested || currentGeneration !== generation) return;
      // Do not queue a page view before load: a revoked pending load must
      // never drain an old event. No form data, UserID or custom goals.
      windowRoot._tmr.push({
        id: String(id), type: 'pageView', start: Date.now(),
        url: cleanUrl(windowRoot.location.href),
        referrer: cleanUrl(documentRoot.referrer),
      });
    };
    script.onerror = () => {
      if (currentGeneration !== generation) return;
      script?.remove();
      script = null;
      if (index + 1 < scriptUrls.length) load(index + 1);
      else requested = false;
    };
    // A removed script can still finish executing. Once requested, revocation
    // needs a fresh document, even if onload has not fired yet. MyTracker's
    // public API has no documented counterpart to Metrica's destruct.
    needsReload = true;
    documentRoot.head.append(script);
  };

  const start = () => {
    if (!isEnabled || requested || revoked) return;
    requested = true;
    windowRoot._tmr ??= [];
    load(0);
  };

  const stop = () => {
    generation++;
    requested = false;
    revoked = needsReload;
    if (script) {
      script.onload = null;
      script.onerror = null;
      script.remove();
      script = null;
    }
    clearAnalyticsStorage(windowRoot, documentRoot, isTrackerStorageKey);
    return needsReload;
  };

  return { counterId: id, enabled: isEnabled, start, stop };
}
