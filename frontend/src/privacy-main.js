import './styles/fonts.css';
import './styles/tokens.css';
import './styles/reset.css';
import './styles/typography.css';
import './styles/global.css';
import './styles/privacy.css';
import './styles/cookieNotice.css';
import { initI18n } from './i18n.js';
import { withBasePath } from './basePath.js';
import { CookieNotice } from './components/CookieNotice.js';
import { createSiteAnalytics } from './siteAnalytics.js';
import { initCookieNotice } from './cookiePreferences.js';

const { t, locale } = await initI18n();
const analytics = createSiteAnalytics(import.meta.env);
document.body.insertAdjacentHTML('beforeend', CookieNotice({
  t, analyticsEnabled: analytics.enabled, privacyUrl: withBasePath(`${locale}/privacy/`),
}));
document.querySelectorAll('[data-cookie-settings]').forEach(button => { button.hidden = false; });
initCookieNotice({ analytics });
