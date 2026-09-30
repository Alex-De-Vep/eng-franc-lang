import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const frontendRoot = resolve(import.meta.dirname, '..');
const origin = 'https://iripurtova-languages.com';

describe('localized SEO and critical assets', () => {
  it.each(['ru', 'en', 'fr'])('uses absolute canonical and hreflang links for %s', (locale) => {
    const html = readFileSync(resolve(frontendRoot, locale, 'index.html'), 'utf8');

    expect(html).toContain(`rel="canonical" href="${origin}/${locale}/"`);
    expect(html).toContain(`hreflang="x-default" href="${origin}/"`);
    expect(html).toContain(`hreflang="ru" href="${origin}/ru/"`);
    expect(html).toContain(`hreflang="en" href="${origin}/en/"`);
    expect(html).toContain(`hreflang="fr" href="${origin}/fr/"`);
    expect(html).toContain('hero-background-960.webp');
    expect(html).toContain('hero-background.webp');
    expect(html).toContain('fetchpriority="high"');
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('fonts.gstatic.com');
  });

  it('keeps the redirect root out of the index while declaring its canonical URL', () => {
    const html = readFileSync(resolve(frontendRoot, 'index.html'), 'utf8');

    expect(html).toContain('content="noindex,follow"');
    expect(html).toContain(`rel="canonical" href="${origin}/"`);
  });

  it('publishes only localized pages in the sitemap', () => {
    const sitemap = readFileSync(resolve(frontendRoot, 'public/sitemap.xml'), 'utf8');

    expect(sitemap).toContain(`${origin}/ru/`);
    expect(sitemap).toContain(`${origin}/en/`);
    expect(sitemap).toContain(`${origin}/fr/`);
    expect(sitemap).not.toMatch(/<loc>https:\/\/iripurtova-languages\.com\/<\/loc>/);
  });
});
