import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { renderPrivacyHtml } from './build/privacyPages.js';
import { renderLandingHtml } from './build/landingPages.js';

const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [{
    name: 'static-localized-pages',
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        const filename = context.filename.replaceAll('\\', '/');
        const privacyLocale = filename.match(/\/(ru|en|fr)\/privacy\/index\.html$/)?.[1];
        if (privacyLocale) return renderPrivacyHtml(html, privacyLocale, base);
        const locale = filename.match(/\/(ru|en|fr)\/index\.html$/)?.[1];
        return locale ? renderLandingHtml(html, locale, base) : html;
      },
    },
  }],
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        ru: resolve(import.meta.dirname, 'ru/index.html'),
        en: resolve(import.meta.dirname, 'en/index.html'),
        fr: resolve(import.meta.dirname, 'fr/index.html'),
        ruPrivacy: resolve(import.meta.dirname, 'ru/privacy/index.html'),
        enPrivacy: resolve(import.meta.dirname, 'en/privacy/index.html'),
        frPrivacy: resolve(import.meta.dirname, 'fr/privacy/index.html'),
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
