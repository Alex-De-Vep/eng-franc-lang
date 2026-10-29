import { siteBasePath, withBasePath } from './basePath.js';

export const localeOrigins = Object.freeze({
  ru: 'https://iripurtova-languages.ru',
  en: 'https://iripurtova-languages.com',
  fr: 'https://iripurtova-languages.com',
});

export const seoLocales = Object.keys(localeOrigins);
export const defaultSeoLocale = 'en';

export function isPublicSite(hostname = globalThis.location?.hostname) {
  return /^(www\.)?iripurtova-languages\.(ru|com)$/.test(hostname || '');
}

export function localizedHref(locale, { page = '', hash = '', basePath = siteBasePath, canonical = false } = {}) {
  const language = Object.hasOwn(localeOrigins, locale) ? locale : 'ru';
  const suffix = page ? `${page.replace(/^\/+|\/+$/g, '')}/` : '';
  const path = withBasePath(`${language}/${suffix}`, basePath);
  return `${canonical ? localeOrigins[language] : ''}${path}${hash.startsWith('#') ? hash : ''}`;
}

export function canonicalUrl(locale, options = {}) {
  return localizedHref(locale, { ...options, basePath: options.basePath ?? '/', canonical: true });
}

export function rootRedirectTarget(location, basePath = siteBasePath) {
  const locale = /(^|\.)iripurtova-languages\.ru$/.test(location.hostname) ? 'ru' : 'en';
  return `${localizedHref(locale, { basePath, canonical: isPublicSite(location.hostname) })}${location.search || ''}${location.hash || ''}`;
}
