import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import i18next from 'i18next';
import { resources } from '../src/i18n.js';
import { createSiteContent } from '../src/data/content.js';
import { renderLanding } from '../src/renderLanding.js';
import { renderLandingHtml } from '../build/landingPages.js';
import { canonicalUrl, localizedHref, rootRedirectTarget } from '../src/siteUrls.js';
import { initSmoothNavigation } from '../src/interactions.js';

const front = resolve(import.meta.dirname, '..');
const read = path => readFileSync(resolve(front, path), 'utf8');
const htmlDocument = html => new DOMParser().parseFromString(html, 'text/html');
const expected = {
  ru: 'https://iripurtova-languages.ru/ru/',
  en: 'https://iripurtova-languages.com/en/',
  fr: 'https://iripurtova-languages.com/fr/',
};
afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = ''; });

describe('canonical multilingual URLs', () => {
  it.each(Object.entries(expected))('uses the canonical domain for %s', (locale, url) => {
    expect(canonicalUrl(locale)).toBe(url);
    expect(canonicalUrl(locale, { page: 'privacy' })).toBe(url + 'privacy/');
    expect(canonicalUrl(locale, { basePath: '/preview/' })).toBe(url.replace(`/${locale}/`, `/preview/${locale}/`));
    expect(localizedHref(locale, { canonical: true, hash: '#faq' })).toBe(url + '#faq');
    expect(localizedHref(locale, { basePath: '/preview/', hash: '#faq' })).toBe(`/preview/${locale}/#faq`);
  });

  it.each(['iripurtova-languages.ru', 'www.iripurtova-languages.ru'])('keeps the %s root Russian and preserves query and fragment', hostname => {
    expect(rootRedirectTarget({ hostname, search: '?utm_source=test', hash: '#contacts' }))
      .toBe(expected.ru + '?utm_source=test#contacts');
  });

  it('keeps the .com root English and local previews on their own origin', () => {
    expect(rootRedirectTarget({ hostname: 'iripurtova-languages.com', search: '?tmr_debug=1', hash: '' }))
      .toBe(expected.en + '?tmr_debug=1');
    expect(rootRedirectTarget({ hostname: 'localhost', search: '?test=1', hash: '#faq' }, '/preview/'))
      .toBe('/preview/en/?test=1#faq');
  });

  it('preserves cross-domain language targets after anchor navigation', () => {
    document.body.innerHTML = `<a href="#goals">Goals</a><div id="goals"></div>
      <a class="site-header__language" href="${expected.ru}">RU</a>
      <a class="site-header__language" href="${expected.fr}">FR</a>`;
    document.querySelector('#goals').scrollIntoView = vi.fn();
    initSmoothNavigation();
    document.querySelector('a[href="#goals"]').click();
    expect([...document.querySelectorAll('.site-header__language')].map(link => link.href))
      .toEqual([expected.ru + '#goals', expected.fr + '#goals']);
  });
});

describe('static localized landing pages', () => {
  it.each(['ru', 'en', 'fr'])('renders complete %s content before JavaScript', async locale => {
    const html = await renderLandingHtml(read(`${locale}/index.html`), locale);
    const doc = htmlDocument(html);
    expect(doc.documentElement.lang).toBe(locale);
    expect(doc.querySelector('#app').dataset.prerenderLocale).toBe(locale);
    expect(doc.querySelectorAll('main')).toHaveLength(1);
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.querySelector('main').textContent.length).toBeGreaterThan(10000);
    for (const id of ['home', 'about', 'approach', 'goals', 'reviews', 'faq', 'contacts', 'coffee-club', 'french-lessons', 'atmosphere']) {
      expect(doc.getElementById(id), id).not.toBeNull();
    }
    expect(doc.querySelectorAll('.faq__answer-content')).toHaveLength(9);
    expect(doc.querySelectorAll('[data-contact-form]')).toHaveLength(2);
    expect(doc.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(doc.querySelector('link[rel="canonical"]').href).toBe(expected[locale]);
    expect(doc.querySelectorAll('link[rel="alternate"]')).toHaveLength(4);
    for (const code of ['ru', 'en', 'fr']) {
      expect(doc.querySelector(`link[hreflang="${code}"]`).href).toBe(expected[code]);
    }
    expect([...doc.querySelectorAll('.site-header__language')].map(link => link.href)).toEqual(Object.values(expected));
    expect(doc.querySelector('.site-footer__privacy').href).toBe(expected[locale] + 'privacy/');
    expect(doc.querySelector('[data-cookie-notice]')).toBeNull();
    expect(doc.querySelector('script[src*="mytopf"], script[src*="mail.ru"]')).toBeNull();
    expect(html).not.toMatch(/\bundefined\b|\[object Object\]/);
  });

  it('reuses existing component markup without changing the design', async () => {
    const instance = i18next.createInstance();
    await instance.init({ lng: 'ru', resources, returnObjects: true, interpolation: { escapeValue: false } });
    const t = instance.getFixedT('ru');
    const content = createSiteContent(t, 'ru', '', { canonicalLinks: true });
    const doc = htmlDocument(await renderLandingHtml(read('ru/index.html'), 'ru'));
    const app = doc.querySelector('#app');
    app.querySelectorAll('noscript').forEach(node => node.remove());
    app.querySelectorAll('form').forEach(form => { form.removeAttribute('method'); form.removeAttribute('action'); });
    app.querySelectorAll('[data-prerender-disabled]').forEach(button => {
      button.removeAttribute('disabled'); button.removeAttribute('data-prerender-disabled');
    });
    expect(app.innerHTML.trim()).toBe(htmlDocument(renderLanding({ locale: 'ru', t, content })).body.innerHTML.trim());
  });

  it('prevents no-JS form submissions from putting personal data in query strings', async () => {
    const doc = htmlDocument(await renderLandingHtml(read('ru/index.html'), 'ru'));
    doc.querySelectorAll('form').forEach(form => {
      expect(form.method).toBe('post');
      expect(form.getAttribute('action')).toBe('/api/contact.php');
      expect(form.querySelector('button[type="submit"]').disabled).toBe(true);
    });
    expect(doc.querySelector('noscript a[href^="mailto:"]')).not.toBeNull();
  });

  it('supports a preview base path without doubled asset prefixes', async () => {
    const doc = htmlDocument(await renderLandingHtml(read('en/index.html'), 'en', '/preview/'));
    expect(doc.querySelector('link[rel="canonical"]').href).toBe('https://iripurtova-languages.com/preview/en/');
    expect(doc.querySelector('img').getAttribute('src')).toMatch(/^\/preview\/assets\//);
    expect(doc.querySelector('form').getAttribute('action')).toBe('/preview/api/contact.php');
    expect(doc.querySelector('#app').innerHTML).not.toContain('/preview/preview/');
  });

  it('does not render unsupported languages or invent pages', async () => {
    expect(await renderLandingHtml('unchanged', 'de')).toBe('unchanged');
  });
});

describe('domain-specific crawl configuration', () => {
  it.each([['sitemap.xml', ['en', 'fr']], ['sitemap-ru.xml', ['ru']]])('publishes only canonical pages in %s', (filename, locales) => {
    const doc = new DOMParser().parseFromString(read(`public/${filename}`), 'application/xml');
    expect(doc.querySelector('parsererror')).toBeNull();
    expect([...doc.getElementsByTagName('loc')].map(node => node.textContent)).toEqual(locales.map(locale => expected[locale]));
    for (const url of doc.getElementsByTagName('url')) {
      const alternates = [...url.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'link')];
      expect(alternates).toHaveLength(4);
      for (const code of ['ru', 'en', 'fr']) {
        expect(alternates.find(link => link.getAttribute('hreflang') === code).getAttribute('href')).toBe(expected[code]);
      }
    }
    expect(doc.documentElement.textContent).not.toContain('/privacy/');
  });

  it.each(['com', 'ru'])('advertises the %s sitemap and does not block JS or public pages', domain => {
    const robots = read(`public/robots${domain === 'ru' ? '-ru' : ''}.txt`);
    expect(robots).toContain(`Sitemap: https://iripurtova-languages.${domain}/sitemap.xml`);
    expect(robots).toContain('Disallow: /api/');
    expect(robots).not.toContain('Disallow: /assets/');
    expect(robots).not.toContain('Disallow: /ru/');
  });

  it('uses absolute HTTPS redirects without an app-shell catch-all', () => {
    const config = read('public/.htaccess');
    expect(config).not.toMatch(/^RewriteRule\s+\S+\s+\/(?:ru|en)\//m);
    expect(config).not.toContain('http://');
    expect(config).not.toContain('!-f');
    expect(config).toContain('robots-ru.txt');
    expect(config).toContain('sitemap-ru.xml');
  });
});
