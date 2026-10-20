import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CookieNotice } from '../src/components/CookieNotice.js';
import { createMetrika, normalizeCounterId } from '../src/analytics.js';
import { getMetrikaConfig, metrikaConfig } from '../src/metrikaConfig.js';
import { COOKIE_PREFERENCES_KEY, COOKIE_PREFERENCES_VERSION, COOKIE_PREFERENCES_MAX_AGE, initCookieNotice } from '../src/cookiePreferences.js';
import ru from '../src/locales/ru.json';
import en from '../src/locales/en.json';
import fr from '../src/locales/fr.json';

const now = 1800000000000;
let controller;
const translate = resources => key => key.split('.').reduce((value, part) => value?.[part], resources);
const record = (analytics, counterId = 12345, analyticsAvailable = counterId !== null) => ({ version: COOKIE_PREFERENCES_VERSION, counterId, analyticsAvailable, analytics, savedAt: now });
function render(enabled = true, resources = ru) {
  document.body.innerHTML = CookieNotice({ t: translate(resources), analyticsEnabled: enabled })
    + '<button type="button" data-cookie-settings>Settings</button>';
}
function setup({ enabled = true, counterId = 12345, ...options } = {}) {
  render(enabled);
  const analytics = { enabled, counterId, start: vi.fn(), stop: vi.fn() };
  controller = initCookieNotice({ analytics, now: () => now, ...options });
  return analytics;
}
const action = name => document.querySelector(`[data-cookie-action="${name}"]`).click();
const notice = () => document.querySelector('[data-cookie-notice]');

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  document.body.innerHTML = '';
  document.head.querySelectorAll('[data-metrika-loader]').forEach(node => node.remove());
  delete window.ym;
});
afterEach(() => {
  controller?.destroy();
  controller = null;
  vi.restoreAllMocks();
  document.head.querySelectorAll('[data-metrika-loader]').forEach(node => node.remove());
  delete window.ym;
});

describe('cookie notice and preferences', () => {
  it.each([['ru', ru], ['en', en], ['fr', fr]])('renders localized controls and disclosure in %s', (_, resources) => {
    render(true, resources);
    expect(notice().getAttribute('role')).toBe('region');
    expect(notice().querySelector('h2').textContent).toBe(resources.cookieNotice.title);
    expect(notice().getAttribute('aria-labelledby')).toBe(notice().querySelector('h2').id);
    expect(notice().querySelector('summary').textContent).toBe(resources.cookieNotice.details);
    expect(notice().querySelector('[data-cookie-action="accept"]').textContent).toBe(resources.cookieNotice.accept);
    expect(notice().querySelector('[data-cookie-action="reject"]').textContent).toBe(resources.cookieNotice.reject);
    expect(notice().querySelector('a').getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('does not start analytics before a choice', () => {
    const analytics = setup();
    expect(notice().hidden).toBe(false);
    expect(analytics.start).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(COOKIE_PREFERENCES_KEY)).toBeNull();
  });

  it('saves permission only after accepting', () => {
    const analytics = setup();
    action('accept');
    expect(JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY))).toEqual(record(true));
    expect(analytics.start).toHaveBeenCalledOnce();
    expect(notice().hidden).toBe(true);
  });

  it('saves rejection without starting analytics', () => {
    const analytics = setup();
    action('reject');
    expect(JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY))).toEqual(record(false));
    expect(analytics.start).not.toHaveBeenCalled();
    expect(notice().hidden).toBe(true);
  });

  it.each([true, false])('restores a previous analytics choice: %s', allowed => {
    window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(record(allowed)));
    const analytics = setup();
    expect(notice().hidden).toBe(true);
    expect(analytics.start.mock.calls).toHaveLength(allowed ? 1 : 0);
  });

  it.each([
    ['invalid JSON', 'not-json'],
    ['old version', JSON.stringify({ ...record(true), version: 0 })],
    ['different counter', JSON.stringify(record(true, 54321))],
    ['expired choice', JSON.stringify({ ...record(true), savedAt: now - COOKIE_PREFERENCES_MAX_AGE })],
    ['future date', JSON.stringify({ ...record(true), savedAt: now + 1 })],
    ['wrong boolean type', JSON.stringify({ ...record(true), analytics: 'true' })],
  ])('asks again for %s and does not load analytics', (_, saved) => {
    window.localStorage.setItem(COOKIE_PREFERENCES_KEY, saved);
    const analytics = setup();
    expect(notice().hidden).toBe(false);
    expect(analytics.start).not.toHaveBeenCalled();
  });

  it('shows an informational notice when no counter is configured and requests a fresh choice after configuration', () => {
    setup({ enabled: false, counterId: null });
    expect(notice().querySelector('[data-cookie-action="accept"]')).toBeNull();
    expect(notice().textContent).toContain(ru.cookieNotice.disabledText);
    action('acknowledge');
    expect(JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY))).toEqual(record(false, null));
    controller.destroy();
    const analytics = setup();
    expect(notice().hidden).toBe(false);
    expect(analytics.start).not.toHaveBeenCalled();
  });

  it('requests new permission when a prepared counter becomes available', () => {
    setup({ enabled: false, counterId: 113677290 });
    action('acknowledge');
    expect(JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY))).toEqual(record(false, 113677290, false));
    controller.destroy();
    const analytics = setup({ enabled: true, counterId: 113677290 });
    expect(notice().hidden).toBe(false);
    expect(analytics.start).not.toHaveBeenCalled();
    action('accept');
    expect(analytics.start).toHaveBeenCalledOnce();
  });

  it('reopens through the footer, closes without changing consent and allows withdrawal', () => {
    const analytics = setup();
    action('accept');
    const settings = document.querySelector('[data-cookie-settings]');
    settings.click();
    expect(notice().hidden).toBe(false);
    expect(document.activeElement).toBe(notice().querySelector('h2'));
    action('close');
    expect(notice().hidden).toBe(true);
    expect(document.activeElement).toBe(settings);
    expect(JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY)).analytics).toBe(true);
    settings.click();
    analytics.stop.mockClear();
    action('reject');
    expect(analytics.stop).toHaveBeenCalledOnce();
    expect(JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY)).analytics).toBe(false);
  });

  it('honours withdrawal from another tab', () => {
    const analytics = setup();
    action('accept');
    analytics.stop.mockClear();
    window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(record(false)));
    window.dispatchEvent(new StorageEvent('storage', { key: COOKIE_PREFERENCES_KEY }));
    expect(analytics.stop).toHaveBeenCalledOnce();
  });

  it('works for the current visit if reading local storage is blocked', () => {
    const windowRoot = {
      get localStorage() { throw new Error('Blocked'); },
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
    };
    const analytics = setup({ windowRoot });
    action('accept');
    expect(analytics.start).toHaveBeenCalledOnce();
    expect(notice().hidden).toBe(true);
  });

  it('works if saving to local storage fails', () => {
    const analytics = setup();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Blocked'); });
    action('reject');
    expect(analytics.start).not.toHaveBeenCalled();
    expect(notice().hidden).toBe(true);
  });
});

describe('consent-controlled Yandex Metrica', () => {
  it('enables the approved counter without loading it before consent', () => {
    expect(metrikaConfig).toEqual({ counterId: 113677290, enabled: true });
    expect(getMetrikaConfig()).toEqual(metrikaConfig);
    const analytics = createMetrika(getMetrikaConfig());
    expect(analytics.counterId).toBe(113677290);
    expect(analytics.enabled).toBe(true);
    document.body.innerHTML = CookieNotice({ t: translate(ru), analyticsEnabled: analytics.enabled });
    controller = initCookieNotice({ analytics, now: () => now });
    expect(window.ym).toBeUndefined();
    expect(document.querySelector('[data-metrika-loader]')).toBeNull();
    expect(document.querySelector('img[src*="mc.yandex.ru"]')).toBeNull();
  });

  it.each(['', 'false', '1', 'TRUE'])('honours a disabled activation override: %s', flag => {
    const options = getMetrikaConfig({ VITE_YANDEX_METRIKA_ID: '113677290', VITE_YANDEX_METRIKA_ENABLED: flag });
    const analytics = createMetrika(options);
    expect(analytics.enabled).toBe(false);
    analytics.start();
    expect(document.querySelector('[data-metrika-loader]')).toBeNull();
  });

  it('does not reuse an old permission while collection is switched off', () => {
    window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(record(true, 113677290)));
    const analytics = createMetrika(getMetrikaConfig({ VITE_YANDEX_METRIKA_ENABLED: 'false' }));
    document.body.innerHTML = CookieNotice({ t: translate(ru), analyticsEnabled: analytics.enabled });
    controller = initCookieNotice({ analytics, now: () => now });
    expect(notice().hidden).toBe(false);
    expect(document.querySelector('[data-metrika-loader]')).toBeNull();
    expect(window.ym).toBeUndefined();
  });

  it('does not load the approved counter when a visitor rejects analytics', () => {
    const analytics = createMetrika(getMetrikaConfig());
    document.body.innerHTML = CookieNotice({ t: translate(ru), analyticsEnabled: analytics.enabled });
    controller = initCookieNotice({ analytics, now: () => now });
    action('reject');
    expect(document.querySelector('[data-metrika-loader]')).toBeNull();
    expect(window.ym).toBeUndefined();
    expect(JSON.parse(window.localStorage.getItem(COOKIE_PREFERENCES_KEY))).toEqual(record(false, 113677290));
  });

  it('initializes the approved counter with limited settings and supports withdrawal', () => {
    window.ym = vi.fn();
    const analytics = createMetrika(getMetrikaConfig());
    document.body.innerHTML = CookieNotice({ t: translate(ru), analyticsEnabled: analytics.enabled })
      + '<button type="button" data-cookie-settings>Settings</button>';
    controller = initCookieNotice({ analytics, now: () => now });
    expect(window.ym).not.toHaveBeenCalled();
    action('accept');
    document.querySelector('[data-metrika-loader]').onload();
    expect(window.ym).toHaveBeenCalledWith(113677290, 'init', {
      defer: true, webvisor: false, clickmap: false, trackLinks: false, accurateTrackBounce: false,
    });
    expect(window.ym.mock.calls.filter(call => call[1] === 'hit')).toHaveLength(1);
    document.querySelector('[data-cookie-settings]').click();
    action('reject');
    expect(window.ym).toHaveBeenCalledWith(113677290, 'destruct');
    expect(document.querySelector('[data-metrika-loader]')).toBeNull();
  });

  it('still waits for permission after the activation flag is explicitly enabled', () => {
    const analytics = createMetrika(getMetrikaConfig({ VITE_YANDEX_METRIKA_ENABLED: 'true' }));
    document.body.innerHTML = CookieNotice({ t: translate(ru), analyticsEnabled: analytics.enabled });
    controller = initCookieNotice({ analytics, now: () => now });
    expect(analytics.enabled).toBe(true);
    expect(document.querySelector('[data-metrika-loader]')).toBeNull();
    action('accept');
    expect(document.querySelector('[data-metrika-loader]').dataset.metrikaLoader).toBe('113677290');
  });

  it.each([undefined, '', 'abc', '12x', '0', '-1', '2.5', '9007199254740992'])('disables an invalid counter ID: %s', id => {
    expect(normalizeCounterId(id)).toBeNull();
    const analytics = createMetrika({ counterId: id, enabled: true });
    analytics.start();
    expect(document.querySelector('[data-metrika-loader]')).toBeNull();
  });

  it('loads one script only after starting and sends a minimal page view without query or hash', () => {
    window.history.replaceState({}, '', '/ru/?email=private@example.com#form');
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://example.com/page?secret=abc#part');
    window.ym = vi.fn();
    const analytics = createMetrika({ counterId: '12345', enabled: true });
    expect(document.querySelector('[data-metrika-loader]')).toBeNull();
    analytics.start();
    analytics.start();
    const script = document.querySelector('[data-metrika-loader]');
    expect(document.querySelectorAll('[data-metrika-loader]')).toHaveLength(1);
    expect(script.src).toBe('https://mc.yandex.ru/metrika/tag.js');
    expect(window.ym).not.toHaveBeenCalled();
    script.onload();
    expect(window.ym).toHaveBeenCalledWith(12345, 'init', {
      defer: true, webvisor: false, clickmap: false, trackLinks: false, accurateTrackBounce: false,
    });
    expect(window.ym).toHaveBeenCalledWith(12345, 'hit', window.location.origin + '/ru/', { referer: 'https://example.com/page' });
    analytics.stop();
    expect(window.ym).toHaveBeenCalledWith(12345, 'destruct');
    expect(document.querySelector('[data-metrika-loader]')).toBeNull();
  });

  it('does not initialize or send a hit if permission is withdrawn while the script is loading', () => {
    window.ym = vi.fn();
    const analytics = createMetrika({ counterId: 12345, enabled: true });
    analytics.start();
    const oldLoad = document.querySelector('[data-metrika-loader]').onload;
    analytics.stop();
    oldLoad();
    expect(window.ym).not.toHaveBeenCalled();
  });

  it('allows a retry after a script loading error', () => {
    const analytics = createMetrika({ counterId: 12345, enabled: true });
    analytics.start();
    document.querySelector('[data-metrika-loader]').onerror();
    expect(document.querySelector('[data-metrika-loader]')).toBeNull();
    analytics.start();
    expect(document.querySelectorAll('[data-metrika-loader]')).toHaveLength(1);
    analytics.stop();
  });

  it('clears accessible Metrica data but keeps language and privacy preferences', () => {
    window.localStorage.setItem('_ym_uid', '123');
    window.sessionStorage.setItem('_ym_debugger_state', '1');
    window.localStorage.setItem('i18nextLng', 'ru');
    window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(record(false)));
    document.cookie = '_ym_uid=123; Path=/';
    const analytics = createMetrika({ counterId: 12345 });
    analytics.stop();
    expect(window.localStorage.getItem('_ym_uid')).toBeNull();
    expect(window.sessionStorage.getItem('_ym_debugger_state')).toBeNull();
    expect(window.localStorage.getItem('i18nextLng')).toBe('ru');
    expect(window.localStorage.getItem(COOKIE_PREFERENCES_KEY)).not.toBeNull();
    expect(document.cookie).not.toContain('_ym_uid=');
  });
});
