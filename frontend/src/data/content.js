import { localePath, supportedLocales } from '../i18n.js';

const navigationHrefs = ['#home', '#about', '#goals', '#reviews', '#faq', '#contacts'];

const galleryImage = (name, height) => ({
  src: `/assets/images/learning-goals/${name}-640.webp`,
  srcSet: `/assets/images/learning-goals/${name}-640.webp 640w`,
  fullSrc: `/assets/images/learning-goals/${name}.webp`,
  width: 1200,
  height,
});

const galleryImages = {
  travelCar: galleryImage('travel-car', 800),
  travelMountains: galleryImage('travel-mountains', 800),
  businessPresentation: galleryImage('business-presentation', 800),
  businessApplause: galleryImage('business-applause', 800),
  businessPhone: galleryImage('business-phone', 800),
  hobbySunflowers: galleryImage('hobby-sunflowers', 904),
  hobbyMusicSeaside: galleryImage('hobby-music-seaside', 800),
  educationGroupOverhead: galleryImage('education-group-overhead', 798),
  educationStudyGroupOverhead: galleryImage('education-study-group-overhead', 800),
  educationStudyPair: galleryImage('education-study-pair', 800),
  educationImg4059: galleryImage('education-img-4059', 758),
  businessImg1: galleryImage('business-img-1', 937),
  businessImg2: galleryImage('business-img-2', 900),
  businessImg3: galleryImage('business-img-3', 675),
  hobbyImg1: galleryImage('hobby-img-1', 900),
  hobbyImg2: galleryImage('hobby-img-2', 931),
  hobbyImg3: galleryImage('hobby-img-3', 941),
  hobbyImg4: galleryImage('hobby-img-4', 758),
  hobbyImg5: galleryImage('hobby-img-5', 900),
  hobbyImg6: galleryImage('hobby-img-6', 675),
  hobbyImg7: galleryImage('hobby-img-7', 895),
  hobbyImg10: galleryImage('hobby-img-10', 676),
  hobbyImg11: galleryImage('hobby-img-11', 675),
  educationImg1: galleryImage('education-img-1', 675),
  educationImg2: galleryImage('education-img-2', 856),
  educationImg3: galleryImage('education-img-3', 824),
  educationImg4: galleryImage('education-img-4', 900),
  educationImg5: galleryImage('education-img-5', 900),
  educationImg6: galleryImage('education-img-6', 900),
  educationImg7: galleryImage('education-img-7', 810),
  educationImg8: galleryImage('education-img-8', 794),
  educationImg9: galleryImage('education-img-9', 801),
  educationImg10: galleryImage('education-img-10', 801),
};

const goalAssets = [
  { icon: '/assets/icons/travel.svg', images: [galleryImages.travelCar, galleryImages.travelMountains] },
  { icon: '/assets/icons/business.svg', images: [galleryImages.businessImg3, galleryImages.businessApplause, galleryImages.businessImg1, galleryImages.businessPhone, galleryImages.businessImg2, galleryImages.businessPresentation] },
  { icon: '/assets/icons/hobby.svg', images: [galleryImages.hobbyImg11, galleryImages.hobbyImg1, galleryImages.hobbyImg10, galleryImages.hobbyImg2, galleryImages.hobbyImg3, galleryImages.hobbyImg5, galleryImages.hobbyImg6, galleryImages.hobbyImg7] },
  { icon: '/assets/icons/learning.svg', images: [galleryImages.educationImg2, galleryImages.educationImg1, galleryImages.educationImg9, galleryImages.educationImg4059, galleryImages.educationImg3, galleryImages.educationImg10, galleryImages.educationGroupOverhead, galleryImages.educationImg4, galleryImages.educationImg5, galleryImages.educationImg6, galleryImages.educationStudyGroupOverhead, galleryImages.educationImg7, galleryImages.educationImg8, galleryImages.educationStudyPair] },
];
const reviewAvatars = ['/assets/icons/avatar-primary.svg', '/assets/icons/avatar.svg', '/assets/icons/avatar-primary.svg', '/assets/icons/avatar.svg', '/assets/icons/avatar-primary.svg', '/assets/icons/avatar.svg'];
const atmosphereAssets = [
  ['atmosphere__tile--portrait-left', galleryImages.educationGroupOverhead],
  ['atmosphere__tile--wide-top-left', galleryImages.businessPresentation],
  ['atmosphere__tile--wide-top-center', galleryImages.hobbySunflowers],
  ['atmosphere__tile--small-top', galleryImages.travelMountains],
  ['atmosphere__tile--wide-top-right', galleryImages.travelCar],
  ['atmosphere__tile--telegram', null, {
    image: '/assets/images/qr-telegram.webp',
    url: 'https://t.me/iriskame',
    altKey: 'telegramQrAlt',
  }],
  ['atmosphere__tile--portrait-center-left', galleryImages.educationStudyPair],
  ['atmosphere__tile--portrait-center-right', galleryImages.businessPhone],
  ['atmosphere__tile--wide-center-right', galleryImages.educationStudyGroupOverhead],
  ['atmosphere__tile--small-right', galleryImages.hobbySunflowers],
  ['atmosphere__tile--small-left', galleryImages.hobbyMusicSeaside],
  ['atmosphere__tile--wide-center-left', galleryImages.businessApplause],
  ['atmosphere__tile--accent', galleryImages.businessPresentation],
  ['atmosphere__tile--wide-right', galleryImages.travelMountains],
  ['atmosphere__tile--wide-bottom-left', galleryImages.educationStudyGroupOverhead],
  ['atmosphere__tile--large-bottom-left', galleryImages.educationGroupOverhead],
  ['atmosphere__tile--small-bottom-center', galleryImages.travelCar],
  ['atmosphere__tile--wide-bottom-center', galleryImages.hobbyMusicSeaside],
  ['atmosphere__tile--wide-bottom-right', galleryImages.businessPresentation],
];

export function createSiteContent(t, locale, hash = '') {
  const navigationLabels = t('navigation', { returnObjects: true });
  const localizedGoals = t('learningGoals.items', { returnObjects: true });
  const localizedReviews = t('reviews.items', { returnObjects: true });
  const atmosphereAlts = t('atmosphere.alts', { returnObjects: true });

  return {
    navigation: navigationHrefs.map((href, index) => ({ href, label: navigationLabels[index] })),
    socialLinks: [
      { label: 'Telegram', icon: '/assets/icons/telegram.svg', url: 'https://t.me/iriskame' },
      { label: 'WhatsApp', icon: '/assets/icons/whatsapp.svg', url: 'https://wa.me/qr/7XAE6K2W2LJLM1' },
    ],
    languages: supportedLocales.map((code) => ({ code: code.toUpperCase(), locale: code, active: code === locale, href: localePath(code, hash) })),
    hero: t('hero', { returnObjects: true }),
    about: t('about', { returnObjects: true }),
    learningGoals: goalAssets.map((assets, index) => ({ ...assets, ...localizedGoals[index] })),
    reviews: localizedReviews.map((review, index) => ({
      ...review,
      avatar: review.avatar || reviewAvatars[index % reviewAvatars.length],
    })),
    faq: t('faq.items', { returnObjects: true }),
    contact: { email: 'exapmle@gmail.com', privacyUrl: null, offerUrl: null },
    atmosphereTiles: atmosphereAssets.map(([className, image, qr], index) => ({
      className,
      ...(image ? { image, alt: atmosphereAlts[index] } : { qr: { ...qr, alt: t(`atmosphere.${qr.altKey}`) } }),
    })),
  };
}
