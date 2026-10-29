import { PrivacyPage } from '../src/components/PrivacyPage.js';
import { privacyDocuments } from '../src/data/privacy.js';
import { seoLinks } from './seoMetadata.js';

export function renderPrivacyHtml(html, locale, basePath = '/') {
  const policy = privacyDocuments[locale];
  if (!policy) return html;
  const metadata = `<title>${policy.title} — Irina Purtova</title>
    <meta name="description" content="${policy.description}" />
    ${seoLinks(locale, { page: 'privacy', basePath })}`;
  return html.replace('<!-- privacy-metadata -->', metadata)
    .replace('<!-- privacy-content -->', () => PrivacyPage({ locale, basePath, canonicalLinks: true }));
}
