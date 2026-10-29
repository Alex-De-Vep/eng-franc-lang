import './styles/fonts.css';
import './styles/tokens.css';
import './styles/reset.css';
import './styles/typography.css';
import './styles/global.css';
import './styles/privacy.css';
import './styles/cookieNotice.css';
import { initI18n } from './i18n.js';
import { isPublicSite, localizedHref } from './siteUrls.js';
import { CookieNotice } from './components/CookieNotice.js';
import { createSiteAnalytics } from './siteAnalytics.js';
import { initCookieNotice } from './cookiePreferences.js';

const { t, locale } = await initI18n();
const analytics = createSiteAnalytics(import.meta.env);
const canonical = isPublicSite();
document.querySelectorAll('.privacy-page__header nav a').forEach(link => {
  link.href = localizedHref(link.lang, { page: 'privacy', canonical });
});
document.querySelectorAll('.privacy-page__brand, .privacy-page__back, .privacy-page__footer > a').forEach(link => {
  link.href = localizedHref(locale, { canonical });
});
document.querySelectorAll('[data-current-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
document.body.insertAdjacentHTML('beforeend', CookieNotice({
  t, analyticsEnabled: analytics.enabled, privacyUrl: localizedHref(locale, { page: 'privacy', canonical }),
}));
document.querySelectorAll('[data-cookie-settings]').forEach(button => { button.hidden = false; });
initCookieNotice({ analytics });
