import { Logo } from '../components/Logo.js';
import { MailIcon } from '../components/MailIcon.js';
function FooterSocial(item, t) {
  if (!item.url) return `<span class="site-footer__social site-footer__social--disabled" aria-label="${item.label}: ${t('common.linkUnavailable')}"><img src="${item.icon}" alt="" /></span>`;
  return `<a class="site-footer__social" href="${item.url}" aria-label="${item.label}"><img src="${item.icon}" alt="" /></a>`;
}

export function Footer({ t, content }) {
  const primary = content.navigation.slice(0, 3);
  const secondary = [
    { label: t('footer.learningGoals'), href: '#goals' },
    ...content.navigation.slice(4),
  ];

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
              <div>${primary.map((item, index) => `<a href="${item.href}">${index === 1 ? t('footer.aboutTeacher') : item.label}</a>`).join('')}</div>
              <div>${secondary.map((item) => `<a href="${item.href}">${item.label}</a>`).join('')}</div>
            </div>
          </nav>
          <div class="site-footer__contacts">
            <h2>${t('footer.contacts')}</h2>
            <p class="site-footer__email">${MailIcon('site-footer__mail')} ${content.contact.email}</p>
            <div class="site-footer__socials">${content.socialLinks.map((item) => FooterSocial(item, t)).join('')}</div>
          </div>
        </div>
        <p class="site-footer__copyright">© 2026 [Irina Purtova] • <span>${t('footer.privacy')}</span> • ${t('footer.rights')}</p>
      </div>
    </footer>
  `;
}
