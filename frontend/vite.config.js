import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
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
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
