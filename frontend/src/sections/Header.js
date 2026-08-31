import { Logo } from '../components/Logo.js';
import { Button } from '../components/Button.js';

function SocialItem(item, t) {
    if (!item.url) {
        return `<span class="site-header__social-link site-header__social-link--disabled" aria-label="${item.label}: ${t('common.linkUnavailable')}"><img src="${item.icon}" alt="" /></span>`;
    }

    return `<a class="site-header__social-link" href="${item.url}" aria-label="${item.label}"><img src="${item.icon}" alt="" /></a>`;
}

export function Header({ t, content }) {
    return `
    <header class="site-header">
      <div class="site-header__inner">
        <div class="site-header__top">
          ${Logo('site-header__brand', t)}
          <div class="site-header__controls">
            <div class="site-header__languages" aria-label="${t('common.languageSelection')}">
              ${content.languages.map((item, index) => `${index ? '<span aria-hidden="true">/</span>' : ''}<a class="site-header__language ${item.active ? 'site-header__language--active' : ''}" href="${item.href}"${item.active ? ' aria-current="page"' : ''}>${item.code}</a>`).join('')}
            </div>
            <button class="site-header__menu-toggle" type="button" aria-expanded="false" aria-controls="site-header-menu" aria-label="${t('common.openMenu')}">
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
        <div class="site-header__panel" id="site-header-menu">
          <nav class="site-header__nav" aria-label="${t('common.mainNavigation')}">
            ${content.navigation.map((item) => `<a class="site-header__nav-link" href="${item.href}">${item.label}</a>`).join('')}
          </nav>
          <div class="site-header__right">
            ${Button({ label: t('common.trial'), href: '#contacts', className: 'site-header__cta' })}
            <div class="site-header__socials" aria-label="${t('common.socialNetworks')}">
              ${content.socialLinks.slice(0, 2).map((item) => SocialItem(item, t)).join('')}
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
}
