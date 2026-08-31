import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ru from './locales/ru.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

export const supportedLocales = ['ru', 'en', 'fr'];
export const fallbackLocale = 'ru';

const resources = {
  ru: { translation: ru },
  en: { translation: en },
  fr: { translation: fr },
};

export async function initI18n({ documentRoot = document, detectionOrder = ['path', 'localStorage', 'navigator'] } = {}) {
  const instance = i18next.createInstance();

  await instance.use(LanguageDetector).init({
    resources,
    supportedLngs: supportedLocales,
    fallbackLng: fallbackLocale,
    load: 'languageOnly',
    returnObjects: true,
    interpolation: { escapeValue: false },
    detection: {
      order: detectionOrder,
      lookupFromPathIndex: 0,
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
      htmlTag: documentRoot.documentElement,
    },
  });

  const locale = supportedLocales.includes(instance.resolvedLanguage) ? instance.resolvedLanguage : fallbackLocale;
  documentRoot.documentElement.lang = locale;
  return { i18n: instance, locale, t: instance.getFixedT(locale) };
}

export function localePath(locale, hash = '') {
  const safeLocale = supportedLocales.includes(locale) ? locale : fallbackLocale;
  const safeHash = hash && hash.startsWith('#') ? hash : '';
  return `/${safeLocale}/${safeHash}`;
}
