import { PrivacyPage } from '../src/components/PrivacyPage.js';
import { privacyDocuments } from '../src/data/privacy.js';

export function renderPrivacyHtml(html, locale, basePath = '/') {
  const policy = privacyDocuments[locale];
  if (!policy) return html;
  const prefix = `/${String(basePath).replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\//, '/');
  const canonical = `https://iripurtova-languages.com${prefix}${locale}/privacy/`;
  const metadata = `<title>${policy.title} — Irina Purtova</title>
    <meta name="description" content="${policy.description}" />
    <link rel="canonical" href="${canonical}" />
    ${Object.keys(privacyDocuments).map(code => `<link rel="alternate" hreflang="${code}" href="https://iripurtova-languages.com${prefix}${code}/privacy/" />`).join('\n    ')}
    <link rel="alternate" hreflang="x-default" href="https://iripurtova-languages.com${prefix}en/privacy/" />`;
  return html.replace('<!-- privacy-metadata -->', metadata)
    .replace('<!-- privacy-content -->', PrivacyPage({ locale, basePath }));
}
