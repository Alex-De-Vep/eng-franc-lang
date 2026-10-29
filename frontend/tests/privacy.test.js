import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PrivacyPage } from '../src/components/PrivacyPage.js';
import { ContactBlock } from '../src/components/ContactBlock.js';
import { Footer } from '../src/sections/Footer.js';
import { CookieNotice } from '../src/components/CookieNotice.js';
import { createSiteContent } from '../src/data/content.js';
import { privacyDocuments, privacyOperator } from '../src/data/privacy.js';
import { renderPrivacyHtml } from '../build/privacyPages.js';
import ru from '../src/locales/ru.json';
import en from '../src/locales/en.json';
import fr from '../src/locales/fr.json';

const translate = resources => key => key.split('.').reduce((value, part) => value?.[part], resources);
const locales = [['ru', ru], ['en', en], ['fr', fr]];

describe('privacy policy pages', () => {
  it.each(locales)('renders the full %s document without JavaScript', (locale) => {
    const template = readFileSync(resolve(import.meta.dirname, `../${locale}/privacy/index.html`), 'utf8');
    const html = renderPrivacyHtml(template, locale);
    document.documentElement.innerHTML = html;
    const policy = privacyDocuments[locale];
    expect(document.querySelector('h1').textContent).toBe(policy.title);
    expect(document.querySelector('article').textContent).toContain('90');
    expect(document.querySelector('article').textContent).toContain('180');
    expect(document.querySelectorAll('article section')).toHaveLength(8);
    expect(document.querySelector('.privacy-page__operator').textContent).toContain(privacyOperator.name);
    expect(document.querySelector('.privacy-page__operator a').getAttribute('href')).toBe(`mailto:${privacyOperator.email}`);
    expect(document.querySelector('.privacy-page__draft')).toBeNull();
    expect(document.querySelector('meta[name="robots"]').content).toBe('noindex, follow');
    expect(document.querySelector('link[rel="canonical"]').href).toBe(`https://iripurtova-languages.${locale === 'ru' ? 'ru' : 'com'}/${locale}/privacy/`);
    expect(document.querySelectorAll('link[rel="alternate"]')).toHaveLength(4);
    expect(document.querySelector('#cookies').textContent).toContain('site_cookie_preferences');
    expect(document.querySelector('#cookies').textContent).toContain('MyTracker');
    expect(document.querySelector('article').textContent).not.toMatch(/Яндекс|Yandex|_ym_uid/);
    expect(document.querySelector('#cookies').textContent).toContain('tmr_lvid');
    expect(document.querySelector('#services').textContent).toContain('3808064');
    expect(document.querySelector('#services').textContent).toContain(privacyOperator.applicationMailbox);
    expect(document.querySelector('#services').textContent).not.toContain('Gmail');
    expect(document.querySelector('article').textContent).not.toMatch(/Telegram|Salebot/);
    expect(document.querySelector('time').dateTime).toBe(privacyOperator.revision);
    expect(document.querySelector('a[href="https://docs.tracker.my.com/ru/sdk/web/api/"]')).not.toBeNull();
    document.querySelectorAll('.privacy-page__contents a').forEach(link => {
      expect(document.querySelector(link.getAttribute('href'))).not.toBeNull();
    });
    expect(document.querySelectorAll('[src*="mc.yandex.ru"]')).toHaveLength(0);
    expect(document.querySelectorAll('[src*="mytopf.com"], [src*="top-fwz1.mail.ru"]')).toHaveLength(0);
    expect(html).not.toContain('privacy-content');
    expect(html).not.toContain('privacy-metadata');
    expect(html).not.toContain('hero-background');
  });

  it.each(['/', '/preview/', 'preview'])('keeps navigation within the configured base path %s', basePath => {
    document.body.innerHTML = PrivacyPage({ locale: 'en', basePath });
    const prefix = basePath === '/' ? '/' : '/preview/';
    expect(document.querySelector('.privacy-page__brand').getAttribute('href')).toBe(`${prefix}en/`);
    expect(document.querySelector('.privacy-page__back').getAttribute('href')).toBe(`${prefix}en/`);
    expect(document.querySelector('[aria-current="page"]').getAttribute('href')).toBe(`${prefix}en/privacy/`);
    expect([...document.querySelectorAll('.privacy-page__header nav a')].map(link => link.getAttribute('href')))
      .toEqual(['ru', 'en', 'fr'].map(locale => `${prefix}${locale}/privacy/`));
  });

  it('falls back safely for an unsupported locale', () => {
    document.body.innerHTML = PrivacyPage({ locale: 'de' });
    expect(document.querySelector('h1').textContent).toBe(privacyDocuments.ru.title);
    expect(document.querySelector('.privacy-page__back').getAttribute('href')).toBe('/ru/');
  });

  it.each(locales)('links both forms, footer and cookie details to the %s policy', (locale, resources) => {
    const t = translate(resources);
    const content = createSiteContent(t, locale);
    const url = `/${locale}/privacy/`;
    expect(content.contact.privacyUrl).toBe(url);
    document.body.innerHTML = ['page', 'modal'].map(idPrefix => ContactBlock({ idPrefix, t, content })).join('')
      + Footer({ t, content }) + CookieNotice({ t, privacyUrl: url });
    const links = [...document.querySelectorAll('.contact-form__consent a')];
    expect(links).toHaveLength(2);
    links.forEach(link => {
      expect(link.getAttribute('href')).toBe(url);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });
    expect(document.querySelectorAll('.contact-form__legal-link--disabled')).toHaveLength(0);
    expect(document.querySelector('.site-footer__privacy').getAttribute('href')).toBe(url);
    expect(document.querySelector('.cookie-notice a').getAttribute('href')).toBe(`${url}#cookies`);
    document.querySelectorAll('input[name="consent"]').forEach(input => { expect(input.checked).toBe(false); });
  });
});
