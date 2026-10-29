import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { createMyTracker, MYTRACKER_SCRIPT_URL, MYTRACKER_FALLBACK_URL } from '../src/myTracker.js';
import { getMyTrackerConfig, myTrackerConfig } from '../src/myTrackerConfig.js';
import { createSiteAnalytics } from '../src/siteAnalytics.js';
import { initCookieNotice, COOKIE_PREFERENCES_KEY, COOKIE_PREFERENCES_VERSION } from '../src/cookiePreferences.js';
import { CookieNotice } from '../src/components/CookieNotice.js';
import ru from '../src/locales/ru.json';

const t = key => key.split('.').reduce((value, part) => value?.[part], ru);
const loader = () => document.querySelector('[data-mytracker-loader]');
const action = name => document.querySelector(`[data-cookie-action="${name}"]`).click();
const trackerKeys = ['tmr_lvid', 'tmr_lvidTS', 'tmr_detect', 'tmr_reqNum', 'tmr_trgfpid', 'tmr_future_key', 'rb_sync_id', 'domain_sid'];
function seedTrackerStorage(windowRoot) {
  for (const name of ['localStorage', 'sessionStorage']) {
    for (const key of trackerKeys) windowRoot[name].setItem(key, 'tracker-value');
  }
}
let controller;
function mount(analytics = createSiteAnalytics(), reload = vi.fn()) {
  document.body.innerHTML = CookieNotice({ t, analyticsEnabled: analytics.enabled })
    + '<button data-cookie-settings>Settings</button>';
  controller = initCookieNotice({ analytics, reload });
  return { analytics, reload };
}
beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  document.body.innerHTML = '';
  delete window._tmr;
  delete window.ym;
});
afterEach(() => {
  controller?.destroy();
  controller = null;
  document.querySelectorAll('[data-mytracker-loader], [data-metrika-loader]').forEach(node => node.remove());
  for (const cookie of document.cookie.split(';')) document.cookie = `${cookie.split('=')[0]}=;Max-Age=0;Path=/`;
  vi.restoreAllMocks();
});

describe('consent-controlled MyTracker', () => {
  it('configures one public counter and a fixed COM CDN for both website domains', () => {
    expect(myTrackerConfig).toEqual({ counterId: 3808064, enabled: true });
    expect(getMyTrackerConfig()).toEqual(myTrackerConfig);
    expect(MYTRACKER_SCRIPT_URL).toBe('https://mytopf.com/js/code.js');
    const { analytics } = mount();
    expect(analytics.enabled).toBe(true);
    expect(loader()).toBeNull();
    expect(window._tmr).toBeUndefined();
    expect(window.ym).toBeUndefined();
    expect(document.querySelector('img[src*="mytopf.com"]')).toBeNull();
    expect(document.querySelector('[data-cookie-notice]').textContent).toContain(ru.cookieNotice.text);
  });

  it('does not load either provider when rejected, including after a new initialization', () => {
    mount();
    action('reject');
    controller.destroy();
    mount();
    expect(document.querySelectorAll('[data-mytracker-loader], [data-metrika-loader]')).toHaveLength(0);
    expect(window._tmr).toBeUndefined();
    expect(document.querySelector('[data-cookie-notice]').hidden).toBe(true);
  });

  it('loads only MyTracker once after permission and sends exactly one minimal page view', () => {
    const { analytics } = mount();
    action('accept');
    analytics.start();
    analytics.start();
    expect(document.querySelectorAll('[data-mytracker-loader]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-metrika-loader]')).toHaveLength(0);
    expect(window.ym).toBeUndefined();
    expect(loader().id).toBe('tmr-code');
    expect(loader().src).toBe(MYTRACKER_SCRIPT_URL);
    expect(loader().async).toBe(true);
    expect(window._tmr).toEqual([]);
    loader().onload();
    expect(window._tmr).toEqual([{
      id: '3808064', type: 'pageView', start: expect.any(Number),
      url: window.location.origin + window.location.pathname, referrer: '',
    }]);
    expect(document.querySelector('[src*="top-fwz1.mail.ru"]')).toBeNull();
  });

  it('strips URL/referrer query and fragment instead of leaking form or link parameters', () => {
    const windowRoot = { location: { href: 'https://iripurtova-languages.ru/ru/?email=private@example.com#secret' } };
    const documentRoot = { head: document.head, createElement: tag => document.createElement(tag), referrer: 'https://example.com/?token=secret#private' };
    const analytics = createMyTracker({ counterId: 3808064, enabled: true, windowRoot, documentRoot });
    analytics.start();
    loader().onload();
    expect(windowRoot._tmr[0]).toEqual({
      id: '3808064', type: 'pageView', start: expect.any(Number),
      url: 'https://iripurtova-languages.ru/ru/', referrer: 'https://example.com/',
    });
  });

  it('saves refusal before reloading to terminate an already requested SDK', () => {
    const reload = vi.fn(() => {
      expect(JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY)).analytics).toBe(false);
      expect(loader()).toBeNull();
      expect(document.querySelector('[data-metrika-loader]')).toBeNull();
    });
    mount(createSiteAnalytics(), reload);
    action('accept');
    loader().onload();
    document.querySelector('[data-cookie-settings]').click();
    action('reject');
    expect(reload).toHaveBeenCalledOnce();
    controller.destroy();
    mount(); // The new document must not load analytics after withdrawal.
    expect(loader()).toBeNull();
  });

  it('does not reload a document that never requested MyTracker', () => {
    const { reload } = mount();
    action('reject');
    controller.destroy();
    expect(reload).not.toHaveBeenCalled();
  });

  it('ignores a late onload after withdrawal while SDK download was pending', () => {
    const { analytics, reload } = mount();
    action('accept');
    const lateLoad = loader().onload;
    document.querySelector('[data-cookie-settings]').click();
    action('reject');
    lateLoad();
    analytics.start();
    expect(window._tmr).toEqual([]);
    expect(loader()).toBeNull();
    expect(reload).toHaveBeenCalledOnce();
  });

  it('withdraws across tabs and refreshes the document that had loaded MyTracker', () => {
    const { reload } = mount();
    action('accept');
    const choice = JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY));
    window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify({ ...choice, analytics: false }));
    window.dispatchEvent(new StorageEvent('storage', { key: COOKIE_PREFERENCES_KEY }));
    expect(reload).toHaveBeenCalledOnce();
    expect(loader()).toBeNull();
  });

  it('requires new permission for the previous Metrica-only consent version', () => {
    window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify({
      version: 2, counterId: 113677290, analyticsAvailable: true, analytics: true, savedAt: Date.now(),
    }));
    mount();
    expect(COOKIE_PREFERENCES_VERSION).toBeGreaterThan(2);
    expect(document.querySelector('[data-cookie-notice]').hidden).toBe(false);
    expect(loader()).toBeNull();
    expect(window.ym).toBeUndefined();
  });

  it('binds consent to the MyTracker counter ID and availability flag', () => {
    const original = createSiteAnalytics().counterId;
    for (const env of [
      { VITE_MYTRACKER_ID: '123456' }, { VITE_MYTRACKER_ENABLED: 'false' },
    ]) expect(createSiteAnalytics(env).counterId).not.toBe(original);
    expect(createSiteAnalytics().counterId).toBe(original);
  });

  it.each(['', 'false', '1', 'TRUE'])('honours the MyTracker global off flag %j', flag => {
    const config = getMyTrackerConfig({ VITE_MYTRACKER_ENABLED: flag });
    expect(config.enabled).toBe(false);
    createMyTracker(config).start();
    expect(loader()).toBeNull();
  });

  it.each(['', 'invalid', '0', '-1', '1.5'])('does not load an invalid counter ID %j', counterId => {
    const analytics = createMyTracker({ counterId, enabled: true });
    expect(analytics.enabled).toBe(false);
    analytics.start();
    expect(loader()).toBeNull();
  });

  it('does not enable Yandex Metrica even with a legacy environment override', () => {
    mount(createSiteAnalytics({ VITE_YANDEX_METRIKA_ENABLED: 'true' }));
    action('accept');
    expect(loader()).not.toBeNull();
    expect(window.ym).toBeUndefined();
    expect(document.querySelector('[data-metrika-loader]')).toBeNull();
  });

  it('shows the informational notice with MyTracker globally disabled', () => {
    const { analytics } = mount(createSiteAnalytics({ VITE_MYTRACKER_ENABLED: 'false' }));
    expect(analytics.enabled).toBe(false);
    expect(document.querySelector('[data-cookie-action="accept"]')).toBeNull();
    action('acknowledge');
    expect(loader()).toBeNull();
  });

  it('falls back to the official RU CDN on COM failure without duplicate views', () => {
    const analytics = createMyTracker(myTrackerConfig);
    analytics.start();
    const lateLoad = loader().onload;
    loader().onerror();
    expect(loader().src).toBe(MYTRACKER_FALLBACK_URL);
    expect(document.querySelectorAll('[data-mytracker-loader]')).toHaveLength(1);
    lateLoad();
    expect(window._tmr).toEqual([]);
    loader().onload();
    expect(window._tmr).toHaveLength(1);
    expect(window._tmr[0].id).toBe('3808064');
  });

  it('can retry both blocked CDNs without queuing or sending a page view', () => {
    const analytics = createMyTracker(myTrackerConfig);
    analytics.start();
    const lateLoad = loader().onload;
    loader().onerror();
    loader().onerror();
    expect(loader()).toBeNull();
    lateLoad();
    expect(window._tmr).toEqual([]);
    analytics.start();
    expect(loader()).not.toBeNull();
    loader().onload();
    expect(window._tmr).toHaveLength(1);
  });

  it('does not start a fallback after consent is withdrawn during download', () => {
    const { reload } = mount();
    action('accept');
    const lateError = loader().onerror;
    document.querySelector('[data-cookie-settings]').click();
    action('reject');
    lateError();
    expect(loader()).toBeNull();
    expect(window._tmr).toEqual([]);
    expect(reload).toHaveBeenCalledOnce();
  });

  it('clears accessible tracker keys without deleting language, consent or unrelated data', () => {
    window.localStorage.setItem('tmr_lvid', 'id');
    window.sessionStorage.setItem('tmr_lvidTS', 'ts');
    window.localStorage.setItem('i18nextLng', 'en');
    window.localStorage.setItem('other', 'keep');
    window.localStorage.setItem(COOKIE_PREFERENCES_KEY, 'keep');
    document.cookie = 'tmr_detect=test; Path=/';
    document.cookie = 'other=keep; Path=/';
    createMyTracker(myTrackerConfig).stop();
    expect(window.localStorage.getItem('tmr_lvid')).toBeNull();
    expect(window.sessionStorage.getItem('tmr_lvidTS')).toBeNull();
    expect(window.localStorage.getItem('i18nextLng')).toBe('en');
    expect(window.localStorage.getItem('other')).toBe('keep');
    expect(window.localStorage.getItem(COOKIE_PREFERENCES_KEY)).toBe('keep');
    expect(document.cookie).not.toContain('tmr_detect');
    expect(document.cookie).toContain('other=keep');
  });

  it.each(['iripurtova-languages.ru', 'iripurtova-languages.com'])('clears SDK identifiers at accessible cookie paths and domains on %s', hostname => {
    const dom = new JSDOM('', { url: `https://www.${hostname}/ru/privacy/` });
    const windowRoot = dom.window;
    const documentRoot = windowRoot.document;
    try {
      seedTrackerStorage(windowRoot);
      for (const name of ['localStorage', 'sessionStorage']) {
        for (const key of ['i18nextLng', COOKIE_PREFERENCES_KEY, 'other', 'tmrSetting']) windowRoot[name].setItem(key, 'keep');
      }
      for (const key of trackerKeys) {
        for (const path of ['/', '/ru', '/ru/', '/ru/privacy', '/ru/privacy/']) {
          documentRoot.cookie = `${key}=host; Path=${path}; Secure`;
          documentRoot.cookie = `${key}=domain; Domain=.${hostname}; Path=${path}; Secure`;
        }
      }
      documentRoot.cookie = 'other=keep; Path=/';
      expect(documentRoot.cookie).toContain('tmr_reqNum=');
      expect(documentRoot.cookie).toContain('domain_sid=');

      createMyTracker({ ...myTrackerConfig, windowRoot, documentRoot }).stop();

      for (const name of ['localStorage', 'sessionStorage']) {
        for (const key of trackerKeys) expect(windowRoot[name].getItem(key), `${name}: ${key}`).toBeNull();
        for (const key of ['i18nextLng', COOKIE_PREFERENCES_KEY, 'other', 'tmrSetting']) expect(windowRoot[name].getItem(key)).toBe('keep');
      }
      expect(documentRoot.cookie).toBe('other=keep');
    } finally {
      dom.window.close();
    }
  });

  it('cleans SDK storage before withdrawal reload and cleans late SDK writes on the next initialization', () => {
    const reload = vi.fn(() => {
      for (const key of trackerKeys) {
        expect(window.localStorage.getItem(key)).toBeNull();
        expect(window.sessionStorage.getItem(key)).toBeNull();
      }
      expect(document.cookie).not.toMatch(/domain_sid|rb_sync_id|tmr_/);
      expect(JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY)).analytics).toBe(false);
    });
    mount(createSiteAnalytics(), reload);
    action('accept');
    loader().onload();
    seedTrackerStorage(window);
    document.cookie = 'domain_sid=tracker; Path=/';
    document.cookie = 'rb_sync_id=tracker; Path=/';
    window.localStorage.setItem('i18nextLng', 'fr');
    action('reject');
    expect(reload).toHaveBeenCalledOnce();
    controller.destroy();

    // Simulate an SDK unload handler writing identifiers during the reload.
    seedTrackerStorage(window);
    document.cookie = 'domain_sid=late-write; Path=/';
    const { reload: nextReload } = mount();
    for (const key of trackerKeys) expect(window.localStorage.getItem(key)).toBeNull();
    expect(document.cookie).not.toContain('domain_sid');
    expect(window.localStorage.getItem('i18nextLng')).toBe('fr');
    expect(JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY)).analytics).toBe(false);
    expect(loader()).toBeNull();
    expect(nextReload).not.toHaveBeenCalled();
  });

  it('still clears SDK cookies when browser storage access is blocked', () => {
    const windowRoot = {
      location: window.location,
      get localStorage() { throw new Error('Storage blocked'); },
      get sessionStorage() { throw new Error('Storage blocked'); },
    };
    document.cookie = 'domain_sid=tracker; Path=/';
    document.cookie = 'tmr_reqNum=tracker; Path=/';
    expect(() => createMyTracker({ ...myTrackerConfig, windowRoot, documentRoot: document }).stop()).not.toThrow();
    expect(document.cookie).not.toMatch(/domain_sid|tmr_reqNum/);
  });
});
