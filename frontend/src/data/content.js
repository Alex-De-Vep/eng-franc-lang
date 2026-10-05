import { localePath, supportedLocales } from '../i18n.js';

const navigationHrefs = ['#home', '#about', '#goals', '#reviews', '#faq', '#contacts'];

const galleryImage = (name, height) => ({
  src: `/assets/images/learning-goals/${name}-640.webp`,
  srcSet: `/assets/images/learning-goals/${name}-640.webp 640w, /assets/images/learning-goals/${name}.webp 1200w`,
  fullSrc: `/assets/images/learning-goals/${name}.webp`,
  width: 1200,
  height,
});

const galleryImages = {
  travelCar: galleryImage('travel-car', 800),
  travelMountains: galleryImage('travel-mountains', 800),
  travelImg0327: galleryImage('travel-img-0327', 675),
  travelImg3546: galleryImage('travel-img-3546', 1600),
  travelImg3836: galleryImage('travel-img-3836', 900),
  travelImg4359: galleryImage('travel-img-4359', 675),
  travelImg4362: galleryImage('travel-img-4362', 1474),
  travelImg4372: galleryImage('travel-img-4372', 675),
  travelImg5814: galleryImage('travel-img-5814', 1600),
  travelImg8225: galleryImage('travel-img-8225', 675),
  travelImg9191: galleryImage('travel-img-9191', 675),
  travelImg9538: galleryImage('travel-img-9538', 675),
  travelImg2873: galleryImage('travel-img-2873', 1027),
  travelImg9603: galleryImage('travel-img-9603', 675),
  atmosphereImg9937: galleryImage('atmosphere-img-9937', 2134),
  atmosphereImg4353: galleryImage('atmosphere-img-4353', 675),
  atmosphereImg1957: galleryImage('atmosphere-img-1957', 675),
  atmosphereImg4393: galleryImage('atmosphere-img-4393', 900),
  atmosphereImg4356: galleryImage('atmosphere-img-4356', 675),
  atmosphereImg8427: galleryImage('atmosphere-img-8427', 2134),
  atmosphereImg6447: galleryImage('atmosphere-img-6447', 2134),
  atmosphereImg4369: galleryImage('atmosphere-img-4369', 675),
  atmosphereImg7151: galleryImage('atmosphere-img-7151', 1600),
  atmosphereImg4362: galleryImage('atmosphere-img-4362', 1474),
  atmosphereImg4354: galleryImage('atmosphere-img-4354', 675),
  atmosphereImg0575: galleryImage('atmosphere-img-0575', 2134),
  atmosphereImg2032: galleryImage('atmosphere-img-2032', 2134),
  atmosphereImg4365: galleryImage('atmosphere-img-4365', 2134),
  atmosphereImg4360: galleryImage('atmosphere-img-4360', 2134),
  atmosphereImg2289: galleryImage('atmosphere-img-2289', 2134),
  atmosphereImg4373: galleryImage('atmosphere-img-4373', 2134),
  atmosphereImg6441: galleryImage('atmosphere-img-4391', 1749),
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
  businessImg2: galleryImage('business-img-0535', 900),
  businessImg3: galleryImage('business-img-3', 675),
  businessImg4399: galleryImage('business-img-4399', 676),
  businessImg4402: galleryImage('business-img-4402', 677),
  hobbyImg1: galleryImage('hobby-img-1', 900),
  hobbyImg2: galleryImage('hobby-img-2', 931),
  hobbyImg3: galleryImage('hobby-img-3', 941),
  hobbyImg4: galleryImage('hobby-img-4', 758),
  hobbyImg5: galleryImage('hobby-img-5', 900),
  hobbyImg6: galleryImage('hobby-img-6', 675),
  hobbyImg7: galleryImage('hobby-img-7', 895),
  hobbyImg10: galleryImage('hobby-img-10', 676),
  hobbyImg11: galleryImage('hobby-img-11', 675),
  hobbyImg7440: galleryImage('hobby-img-7440', 900),
  hobbyImg6868: galleryImage('hobby-img-6868', 786),
  hobbyImg7177: galleryImage('hobby-img-7177', 900),
  hobbyImg4321: galleryImage('hobby-img-4321', 675),
  hobbyImg7907: galleryImage('hobby-img-7907', 900),
  educationImg1: galleryImage('education-img-1', 675),
  educationImg2: galleryImage('education-img-1204', 876),
  educationImg3: galleryImage('education-img-3', 824),
  educationImg4: galleryImage('education-img-7477', 900),
  educationImg5: galleryImage('education-img-0324', 676),
  educationImg6: galleryImage('education-img-2860', 890),
  educationImg7: galleryImage('education-img-7', 810),
  educationImg8: galleryImage('education-img-8', 794),
  educationImg9: galleryImage('education-img-9', 801),
  educationImg10: galleryImage('education-img-10', 801),
};

const goalAssets = [
  { icon: '/assets/icons/travel.svg', images: [galleryImages.travelImg0327, galleryImages.travelImg3546, galleryImages.travelImg3836, galleryImages.travelImg4359, galleryImages.travelImg4372, galleryImages.travelImg5814, galleryImages.travelImg8225, galleryImages.travelImg9191, galleryImages.travelImg9538, galleryImages.travelImg2873, galleryImages.travelImg9603] },
  { icon: '/assets/icons/business.svg', images: [galleryImages.businessImg4402, galleryImages.businessImg2, galleryImages.businessImg1, galleryImages.businessImg4399, galleryImages.businessPhone] },
  { icon: '/assets/icons/hobby.svg', images: [galleryImages.educationImg1, galleryImages.hobbyImg7, galleryImages.hobbyImg1, galleryImages.hobbyImg11, galleryImages.hobbyImg7907, galleryImages.businessImg3, galleryImages.hobbyImg6868, galleryImages.hobbyImg7177, galleryImages.hobbyImg7440, galleryImages.hobbyImg4321] },
  { icon: '/assets/icons/learning.svg', images: [galleryImages.hobbyImg10, galleryImages.educationImg4059, galleryImages.educationImg9, galleryImages.educationImg8, galleryImages.educationImg2, galleryImages.educationImg10, galleryImages.educationImg4, galleryImages.educationImg5, galleryImages.educationImg6, galleryImages.educationImg7] },
];
const reviewAvatars = ['/assets/icons/avatar-primary.svg', '/assets/icons/avatar.svg', '/assets/icons/avatar-primary.svg', '/assets/icons/avatar.svg', '/assets/icons/avatar-primary.svg', '/assets/icons/avatar.svg'];
const atmosphereAssets = [
  ['atmosphere__tile--p1', galleryImages.atmosphereImg8427],
  ['atmosphere__tile--p2', galleryImages.atmosphereImg6447],
  ['atmosphere__tile--p3', galleryImages.atmosphereImg0575],
  ['atmosphere__tile--p4', galleryImages.atmosphereImg2032],
  ['atmosphere__tile--p5', galleryImages.atmosphereImg4365],
  ['atmosphere__tile--p6', galleryImages.atmosphereImg4360],
  ['atmosphere__tile--p7', galleryImages.atmosphereImg2289],
  ['atmosphere__tile--p8', galleryImages.atmosphereImg4373],
  ['atmosphere__tile--pbig1', galleryImages.atmosphereImg9937],
  ['atmosphere__tile--pbig2', galleryImages.atmosphereImg7151],
  ['atmosphere__tile--telegram', null, {
    image: '/assets/images/qr-telegram.webp',
    url: 'https://t.me/iriskame',
    altKey: 'telegramQrAlt',
  }],
  ['atmosphere__tile--p9', galleryImages.atmosphereImg6441],
  ['atmosphere__tile--w1', galleryImages.atmosphereImg4353],
  ['atmosphere__tile--w2', galleryImages.atmosphereImg1957],
  ['atmosphere__tile--w3', galleryImages.atmosphereImg4356],
  ['atmosphere__tile--w4', galleryImages.atmosphereImg4369],
  ['atmosphere__tile--w5', galleryImages.atmosphereImg4354],
  ['atmosphere__tile--s1', galleryImages.atmosphereImg4393],
  ['atmosphere__tile--s2', galleryImages.atmosphereImg4362],
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
    contact: { email: 'ipurtova.37@gmail.com', privacyUrl: null, offerUrl: null },
    atmosphereTiles: atmosphereAssets.map(([className, image, qr], index) => ({
      className,
      ...(image ? { image, alt: atmosphereAlts[index] } : { qr: { ...qr, alt: t(`atmosphere.${qr.altKey}`) } }),
    })),
  };
}
