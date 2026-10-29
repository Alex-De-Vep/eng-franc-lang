import { canonicalUrl, defaultSeoLocale, seoLocales } from '../src/siteUrls.js';

export function seoLinks(locale, options = {}) {
  return `<link rel="canonical" href="${canonicalUrl(locale, options)}" />
    ${seoLocales.map(code => `<link rel="alternate" hreflang="${code}" href="${canonicalUrl(code, options)}" />`).join('\n    ')}
    <link rel="alternate" hreflang="x-default" href="${canonicalUrl(defaultSeoLocale, options)}" />`;
}
