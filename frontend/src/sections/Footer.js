import { Logo } from '../components/Logo.js';
import { MailIcon } from '../components/MailIcon.js';
function FooterSocial(item, t) {
  if (!item.url) return `<span class="site-footer__social site-footer__social--disabled" aria-hidden="true"><img src="${item.icon}" alt="" /></span>`;
  return `<a class="site-footer__social" href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="${item.label}"><img src="${item.icon}" alt="" /></a>`;
}

export function Footer({ t, content }) {
  const currentYear = new Date().getFullYear();
  const splitIndex = Math.ceil(content.footerNavigation.length / 2);
  const primary = content.footerNavigation.slice(0, splitIndex);
  const secondary = content.footerNavigation.slice(splitIndex);

  return `
    <footer class="site-footer">
      <div class="site-footer__container">
        <div class="site-footer__inner">
          <div class="site-footer__about">
            ${Logo('site-footer__brand', t)}
            <p>${t('footer.description')}</p>
          </div>
          <nav class="site-footer__navigation" aria-label="${t('footer.navigationLabel')}">
            <h2>${t('footer.navigation')}</h2>
            <div class="site-footer__navigation-columns">
              <div>${primary.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}</div>
              <div>${secondary.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}</div>
            </div>
          </nav>
          <div class="site-footer__contacts">
            <h2>${t('footer.contacts')}</h2>
            <a class="site-footer__email" href="mailto:${content.contact.email}">${MailIcon('site-footer__mail')} ${content.contact.email}</a>
            <a class="site-footer__telegram" href="${content.contact.telegramUrl}" target="_blank" rel="noopener noreferrer">${t('footer.telegramApplication')}</a>
            <div class="site-footer__socials">${content.socialLinks.map((item) => FooterSocial(item, t)).join('')}</div>
          </div>
        </div>
        <p class="site-footer__copyright">© ${currentYear} [Irina Purtova] • <span>${t('footer.privacy')}</span> • ${t('footer.rights')}</p>
      </div>
    </footer>
  `;
}
