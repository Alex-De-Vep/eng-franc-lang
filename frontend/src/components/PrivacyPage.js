import { privacyDocuments, privacyOperator } from '../data/privacy.js';
import { localizedHref } from '../siteUrls.js';

const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

// Also rendered by Vite: the entire policy remains readable without JavaScript.
export function PrivacyPage({ locale, basePath = '/', canonicalLinks = false }) {
  const language = Object.hasOwn(privacyDocuments, locale) ? locale : 'ru';
  const policy = privacyDocuments[language];
  const homeHref = localizedHref(language, { basePath, canonical: canonicalLinks });
  const policyHref = code => localizedHref(code, { page: 'privacy', basePath, canonical: canonicalLinks });
  return `
    <div class="privacy-page">
      <header class="privacy-page__header">
        <a class="privacy-page__brand" href="${escape(homeHref)}">Irina Purtova</a>
        <nav aria-label="${escape(policy.languages)}">${Object.keys(privacyDocuments).map(code =>
          `<a href="${escape(policyHref(code))}" lang="${code}"${code === language ? ' aria-current="page"' : ''}>${code.toUpperCase()}</a>`).join('')}</nav>
      </header>
      <main id="privacy-main">
        <a class="privacy-page__back" href="${escape(homeHref)}">← ${escape(policy.back)}</a>
        <h1>${escape(policy.title)}</h1>
        <p class="privacy-page__date"><time datetime="${privacyOperator.revision}">${escape(policy.updated)}</time></p>
        <div class="privacy-page__operator">
          <p>${escape(policy.operatorLabel)}</p>
          <p><strong>${escape(privacyOperator.name)}</strong> · ${escape(policy.country)}</p>
          <p>${escape(policy.contactLabel)}: <a href="mailto:${escape(privacyOperator.email)}">${escape(privacyOperator.email)}</a></p>
        </div>
        <nav class="privacy-page__contents" aria-label="${escape(policy.contents)}">
          <h2>${escape(policy.contents)}</h2>
          <ul>${policy.sections.map(section => `<li><a href="#${section.id}">${escape(section.title)}</a></li>`).join('')}</ul>
        </nav>
        <article aria-label="${escape(policy.title)}">
          ${policy.sections.map(section => `<section id="${section.id}">
            <h2>${escape(section.title)}</h2>
            ${section.paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}
            ${section.id === 'cookies' ? `<p><a href="https://docs.tracker.my.com/ru/sdk/web/api/" target="_blank" rel="noopener noreferrer">${escape(policy.myTrackerDetails)}</a></p>
            <button class="privacy-page__settings" type="button" data-cookie-settings hidden>${escape(policy.cookieSettings)}</button>` : ''}
          </section>`).join('')}
        </article>
      </main>
      <footer class="privacy-page__footer"><a href="${escape(homeHref)}">← ${escape(policy.back)}</a><span>© <span data-current-year>${new Date().getFullYear()}</span> Irina Purtova</span></footer>
    </div>`;
}
