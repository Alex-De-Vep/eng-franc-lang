import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CookieNotice } from '../src/components/CookieNotice.js';
import { COOKIE_PREFERENCES_KEY, COOKIE_PREFERENCES_VERSION, COOKIE_PREFERENCES_MAX_AGE, initCookieNotice } from '../src/cookiePreferences.js';
import ru from '../src/locales/ru.json';
import en from '../src/locales/en.json';
import fr from '../src/locales/fr.json';

const now = 1800000000000;
let controller;
const translate = resources => key => key.split('.').reduce((value, part) => value?.[part], resources);
const record = (analytics, counterId = 12345, analyticsAvailable = counterId !== null) => ({ version: COOKIE_PREFERENCES_VERSION, counterId, analyticsAvailable, analytics, savedAt: now });
function render(enabled = true, resources = ru) {
  document.body.innerHTML = CookieNotice({ t: translate(resources), analyticsEnabled: enabled, privacyUrl: '/ru/privacy/' })
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
});
afterEach(() => {
  controller?.destroy();
  controller = null;
  vi.restoreAllMocks();
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
    expect(notice().querySelector('a').getAttribute('href')).toBe('/ru/privacy/#cookies');
    expect(notice().querySelector('.cookie-notice__text').textContent).toContain(resources.cookieNotice.text);
    expect(notice().querySelector('.cookie-notice__text a').textContent).toBe(resources.cookieNotice.privacyLink);
    expect(notice().querySelector('.cookie-notice__text a').closest('details')).toBeNull();
    expect(notice().textContent).not.toMatch(/Яндекс|Yandex|MyTracker|Top\.Mail/i);
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
