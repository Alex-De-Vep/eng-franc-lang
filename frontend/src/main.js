import 'swiper/css';
import 'swiper/css/a11y';

import './styles/tokens.css';
import './styles/reset.css';
import './styles/typography.css';
import './styles/global.css';

import './sections/Header.css';
import './sections/Hero.css';
import './sections/About.css';
import './sections/LearningGoals.css';
import './sections/Reviews.css';
import './sections/FaqContact.css';
import './sections/CoffeeClub.css';
import './sections/FrenchLessons.css';
import './sections/Atmosphere.css';
import './sections/Footer.css';

import { Header } from './sections/Header.js';
import { Hero } from './sections/Hero.js';
import { About } from './sections/About.js';
import { LearningGoals } from './sections/LearningGoals.js';
import { Reviews } from './sections/Reviews.js';
import { FaqContact } from './sections/FaqContact.js';
import { CoffeeClub } from './sections/CoffeeClub.js';
import { FrenchLessons } from './sections/FrenchLessons.js';
import { Atmosphere } from './sections/Atmosphere.js';
import { Footer } from './sections/Footer.js';
import { createSiteContent } from './data/content.js';
import { initI18n } from './i18n.js';
import { initAccordion, initContactForm, initLearningGoals, initMobileNavigation, initReviewModal, initReviewsSlider, initSmoothNavigation } from './interactions.js';

const app = document.querySelector('#app');
const { locale, t } = await initI18n();
const content = createSiteContent(t, locale, window.location.hash);
const context = { locale, t, content };

document.title = t('meta.title');
document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));

app.innerHTML = [
  Header(context),
  '<main>',
  Hero(context),
  About(context),
  LearningGoals(context),
  Reviews(context),
  FaqContact(context),
  CoffeeClub(context),
  FrenchLessons(context),
  Atmosphere(context),
  '</main>',
  Footer(context),
].join('');

initSmoothNavigation();
initMobileNavigation(document, t);
initLearningGoals(document, t);
initAccordion();
initContactForm(document, t);
initReviewsSlider(document, t);
initReviewModal();
