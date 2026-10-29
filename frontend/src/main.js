import 'swiper/css';
import 'swiper/css/a11y';

import './styles/fonts.css';
import './styles/tokens.css';
import './styles/reset.css';
import './styles/typography.css';
import './styles/global.css';
import './styles/cookieNotice.css';

import './sections/Header.css';
import './sections/Hero.css';
import './sections/About.css';
import './sections/Approach.css';
import './sections/LearningGoals.css';
import './sections/Reviews.css';
import './sections/FaqContact.css';
import './sections/CoffeeClub.css';
import './sections/FrenchLessons.css';
import './sections/Atmosphere.css';
import './sections/Footer.css';

import { renderLanding } from './renderLanding.js';
import { CookieNotice } from './components/CookieNotice.js';
import { createSiteAnalytics } from './siteAnalytics.js';
import { initCookieNotice } from './cookiePreferences.js';
import { createSiteContent } from './data/content.js';
import { initI18n } from './i18n.js';
import { initAccordion, initAtmosphereModal, initContactForm, initContactSuccessModal, initLearningGoals, initMobileNavigation, initReviewModal, initReviewsSlider, initSmoothNavigation } from './interactions.js';

const app = document.querySelector('#app');
const { locale, t } = await initI18n();
const content = createSiteContent(t, locale, window.location.hash);
const context = { locale, t, content };
const analytics = createSiteAnalytics(import.meta.env);

document.title = t('meta.title');
document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));

if (app.dataset.prerenderLocale !== locale) app.innerHTML = renderLanding(context);
// Local previews keep navigation local; production links cross the two domains.
app.querySelectorAll('.site-header__language').forEach((link, index) => {
  link.setAttribute('href', content.languages[index].href);
});
app.querySelectorAll('a[href*="/privacy/"]').forEach(link => {
  link.setAttribute('href', content.contact.privacyUrl);
});
app.querySelectorAll('[data-current-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
app.insertAdjacentHTML('beforeend', CookieNotice({ t, analyticsEnabled: analytics.enabled, privacyUrl: content.contact.privacyUrl }));

initSmoothNavigation();
initMobileNavigation(document, t);
initLearningGoals(document, t);
initAccordion();
const contactSuccessModal = initContactSuccessModal();
initContactForm(document, t, locale, {
  onSuccess: ({ submit }) => contactSuccessModal?.open(submit),
});
app.querySelectorAll('[data-prerender-disabled]').forEach(button => {
  button.disabled = false;
  delete button.dataset.prerenderDisabled;
});
initReviewsSlider(document, t);
initReviewModal();
initAtmosphereModal();
initCookieNotice({ analytics });
