import i18next from 'i18next';
import { resources } from '../src/i18n.js';
import { createSiteContent } from '../src/data/content.js';
import { renderLanding } from '../src/renderLanding.js';
import { withBasePath } from '../src/basePath.js';
import { seoLinks } from './seoMetadata.js';

export async function renderLandingHtml(html, locale, basePath = '/') {
  if (!Object.hasOwn(resources, locale)) return html;
  const instance = i18next.createInstance();
  await instance.init({ lng: locale, resources, returnObjects: true, interpolation: { escapeValue: false } });
  const t = instance.getFixedT(locale);
  const content = createSiteContent(t, locale, '', { basePath, canonicalLinks: true });
  const noScriptMessages = {
    ru: 'Для отправки формы включите JavaScript или напишите на email:',
    en: 'To submit the form, enable JavaScript or send an email to:',
    fr: 'Pour envoyer le formulaire, activez JavaScript ou écrivez à :',
  };
  const markup = renderLanding({ locale, t, content }, basePath)
    // A static form must never fall back to GET and expose contact details in URLs.
    .replaceAll('data-contact-form novalidate', `data-contact-form novalidate method="post" action="${withBasePath('api/contact.php', basePath)}"`)
    .replaceAll('contact-form__submit" type="submit"', 'contact-form__submit" type="submit" disabled data-prerender-disabled')
    .replaceAll('</form>', `</form><noscript><p>${noScriptMessages[locale]} <a href="mailto:${content.contact.email}">${content.contact.email}</a></p></noscript>`);
  return html.replace(/\s*<link rel="(?:canonical|alternate)"[^>]*\/>/g, '')
    .replace('</head>', `${seoLinks(locale, { basePath })}\n  </head>`)
    .replace('<div id="app"></div>', () => `<div id="app" data-prerender-locale="${locale}">${markup}</div>`);
}
