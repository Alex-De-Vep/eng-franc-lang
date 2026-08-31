import { localePath, supportedLocales } from '../i18n.js';

const navigationHrefs = ['#home', '#about', '#goals', '#reviews', '#faq', '#contacts'];
const goalAssets = [
  { icon: '/assets/icons/travel.svg', images: ['/assets/images/learning-goals/travel-car.jpg', '/assets/images/learning-goals/travel-mountains.jpg'] },
  { icon: '/assets/icons/business.svg', images: ['/assets/images/learning-goals/business-presentation.jpg', '/assets/images/learning-goals/business-applause.jpg', '/assets/images/learning-goals/business-phone.jpg'] },
  { icon: '/assets/icons/hobby.svg', images: ['/assets/images/learning-goals/hobby-sunflowers.jpg', '/assets/images/learning-goals/hobby-music-seaside.jpg'] },
  { icon: '/assets/icons/learning.svg', images: ['/assets/images/learning-goals/education-group-overhead.jpg', '/assets/images/learning-goals/education-study-group-overhead.jpg', '/assets/images/learning-goals/education-study-pair.jpg'] },
];
const reviewAvatars = ['/assets/icons/avatar-primary.svg', '/assets/icons/avatar.svg', '/assets/icons/avatar-primary.svg', '/assets/icons/avatar.svg', '/assets/icons/avatar-primary.svg', '/assets/icons/avatar.svg'];
const atmosphereAssets = [
  ['atmosphere__tile--portrait-left', '/assets/images/learning-goals/education-group-overhead.jpg'],
  ['atmosphere__tile--wide-top-left', '/assets/images/learning-goals/business-presentation.jpg'],
  ['atmosphere__tile--wide-top-center', '/assets/images/learning-goals/hobby-sunflowers.jpg'],
  ['atmosphere__tile--small-top', '/assets/images/learning-goals/travel-mountains.jpg'],
  ['atmosphere__tile--wide-top-right', '/assets/images/learning-goals/travel-car.jpg'],
  ['atmosphere__tile--telegram', null],
  ['atmosphere__tile--portrait-center-left', '/assets/images/learning-goals/education-study-pair.jpg'],
  ['atmosphere__tile--portrait-center-right', '/assets/images/learning-goals/business-phone.jpg'],
  ['atmosphere__tile--wide-center-right', '/assets/images/learning-goals/education-study-group-overhead.jpg'],
  ['atmosphere__tile--small-right', '/assets/images/learning-goals/hobby-sunflowers.jpg'],
  ['atmosphere__tile--small-left', '/assets/images/learning-goals/hobby-music-seaside.jpg'],
  ['atmosphere__tile--wide-center-left', '/assets/images/learning-goals/business-applause.jpg'],
  ['atmosphere__tile--instagram', null],
  ['atmosphere__tile--wide-right', '/assets/images/learning-goals/travel-mountains.jpg'],
  ['atmosphere__tile--wide-bottom-left', '/assets/images/learning-goals/education-study-group-overhead.jpg'],
  ['atmosphere__tile--large-bottom-left', '/assets/images/learning-goals/education-group-overhead.jpg'],
  ['atmosphere__tile--small-bottom-center', '/assets/images/learning-goals/travel-car.jpg'],
  ['atmosphere__tile--wide-bottom-center', '/assets/images/learning-goals/hobby-music-seaside.jpg'],
  ['atmosphere__tile--wide-bottom-right', '/assets/images/learning-goals/business-presentation.jpg'],
];

export function createSiteContent(t, locale, hash = '') {
  const navigationLabels = t('navigation', { returnObjects: true });
  const localizedGoals = t('learningGoals.items', { returnObjects: true });
  const localizedReviews = t('reviews.items', { returnObjects: true });
  const atmosphereAlts = t('atmosphere.alts', { returnObjects: true });

  return {
    navigation: navigationHrefs.map((href, index) => ({ href, label: navigationLabels[index] })),
    socialLinks: [
      { label: 'Telegram', icon: '/assets/icons/telegram.svg', url: null },
      { label: 'WhatsApp', icon: '/assets/icons/whatsapp.svg', url: null },
      { label: 'Instagram', icon: '/assets/icons/instagram.svg', url: null },
    ],
    languages: supportedLocales.map((code) => ({ code: code.toUpperCase(), locale: code, active: code === locale, href: localePath(code, hash) })),
    hero: t('hero', { returnObjects: true }),
    about: t('about', { returnObjects: true }),
    learningGoals: goalAssets.map((assets, index) => ({ ...assets, ...localizedGoals[index] })),
    reviews: reviewAvatars.map((avatar, index) => ({ avatar, ...localizedReviews[index] })),
    reviewsInstagramUrl: 'https://www.instagram.com/reels/',
    faq: t('faq.items', { returnObjects: true }),
    contact: { email: 'exapmle@gmail.com', privacyUrl: null, offerUrl: null },
    atmosphereTiles: atmosphereAssets.map(([className, image], index) => ({ className, ...(image ? { image, alt: atmosphereAlts[index] } : { qr: true }) })),
  };
}
