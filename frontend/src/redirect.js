import { initI18n, localePath } from './i18n.js';

const { locale } = await initI18n({ detectionOrder: ['localStorage', 'navigator'] });
window.location.replace(localePath(locale, window.location.hash));
