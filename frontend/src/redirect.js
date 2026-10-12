import { localePath } from './i18n.js';

window.location.replace(localePath('en', window.location.hash));
