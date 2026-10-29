import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resources } from '../src/i18n.js';
import { renderLandingHtml } from '../build/landingPages.js';
import { landingStructuredData } from '../build/seoMetadata.js';

const read = locale => readFileSync(resolve(import.meta.dirname, `../${locale}/index.html`), 'utf8');
const parse = html => new DOMParser().parseFromString(html, 'text/html');

describe('Russian search positioning without visible changes', () => {
  it('keeps initial and runtime metadata in sync for English lessons', async () => {
    const meta = resources.ru.translation.meta;
    const source = parse(read('ru'));
    const rendered = parse(await renderLandingHtml(read('ru'), 'ru'));
    for (const doc of [source, rendered]) {
      expect(doc.title).toBe(meta.title);
      expect(doc.querySelector('meta[name="description"]').content).toBe(meta.description);
      expect(doc.querySelector('link[rel="canonical"]').href).toBe('https://iripurtova-languages.ru/ru/');
    }
    expect(meta.title).toBe('Репетитор английского онлайн — Ирина Пуртова');
    expect(rendered.querySelectorAll('h1')).toHaveLength(1);
    expect(rendered.querySelector('h1').textContent).toBe('English & Français');
    expect(rendered.querySelector('#french-lessons')).not.toBeNull();
  });

  it('links the real teacher and both existing services on the same canonical page', async () => {
    const doc = parse(await renderLandingHtml(read('ru'), 'ru'));
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].parentElement.tagName).toBe('HEAD');
    const data = JSON.parse(scripts[0].textContent);
    expect(data['@context']).toBe('https://schema.org');
    const nodes = new Map(data['@graph'].map(node => [node['@id'], node]));
    const page = data['@graph'].find(node => node['@type'] === 'WebPage');
    const english = nodes.get(page.mainEntity['@id']);
    const french = nodes.get(page.mentions['@id']);
    expect(page.name).toBe(doc.title);
    expect(page.url).toBe(doc.querySelector('link[rel="canonical"]').href);
    expect(english.name).toBe('Индивидуальные занятия английским онлайн');
    expect(french.url).toBe(page.url + '#french-lessons');
    expect(nodes.get(english.provider['@id']).name).toBe('Ирина Пуртова');
    expect(french.provider).toEqual(english.provider);
    for (const node of nodes.values()) {
      expect(node).not.toHaveProperty('aggregateRating');
      expect(node).not.toHaveProperty('offers');
    }
  });

  it.each(['en', 'fr'])('keeps %s metadata and visible heading without the new structured data', async locale => {
    const meta = resources[locale].translation.meta;
    const doc = parse(await renderLandingHtml(read(locale), locale));
    expect(doc.title).toBe(meta.title);
    expect(doc.querySelector('meta[name="description"]').content).toBe(meta.description);
    expect(doc.querySelector('h1').textContent).toBe('English & Français');
    expect(doc.querySelector('script[type="application/ld+json"]')).toBeNull();
    expect(landingStructuredData(locale, meta)).toBe('');
  });

  it('keeps preview URLs consistent and serializes metadata without breaking out of JSON', () => {
    const markup = landingStructuredData('ru', {
      title: '</script><script>alert(1)</script>', description: 'Описание',
    }, { basePath: '/preview/' });
    const doc = parse(markup);
    expect(doc.querySelectorAll('script')).toHaveLength(1);
    const data = JSON.parse(doc.querySelector('script').textContent);
    const page = data['@graph'].find(node => node['@type'] === 'WebPage');
    expect(page.url).toBe('https://iripurtova-languages.ru/preview/ru/');
    expect(page.name).toBe('</script><script>alert(1)</script>');
    expect(data['@graph'].every(node => node['@id'].startsWith(page.url))).toBe(true);
  });
});
