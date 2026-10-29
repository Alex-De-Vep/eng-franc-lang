import { Header } from './sections/Header.js';
import { Hero } from './sections/Hero.js';
import { About } from './sections/About.js';
import { Approach } from './sections/Approach.js';
import { LearningGoals } from './sections/LearningGoals.js';
import { Reviews } from './sections/Reviews.js';
import { FaqContact } from './sections/FaqContact.js';
import { CoffeeClub } from './sections/CoffeeClub.js';
import { FrenchLessons } from './sections/FrenchLessons.js';
import { Atmosphere } from './sections/Atmosphere.js';
import { Footer } from './sections/Footer.js';
import { ContactSuccessModal } from './components/ContactSuccessModal.js';
import { resolveAssetMarkup } from './basePath.js';

// Build and browser fallback share the existing components and their markup.
// Optional analytics/consent UI is initialized only in the browser.
export function renderLanding(context, basePath) {
  return resolveAssetMarkup([
    Header(context), '<main>', Hero(context), About(context), Approach(context),
    LearningGoals(context), Reviews(context), FaqContact(context), CoffeeClub(context),
    FrenchLessons(context), Atmosphere(context), '</main>', Footer(context),
    ContactSuccessModal(context.t),
  ].join(''), basePath);
}
