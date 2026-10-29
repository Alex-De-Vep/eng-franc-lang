import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Approach } from '../src/sections/Approach.js';
import { createSiteContent } from '../src/data/content.js';
import ru from '../src/locales/ru.json';
import en from '../src/locales/en.json';
import fr from '../src/locales/fr.json';

describe('teaching approach', () => {
  it.each([['ru', ru], ['en', en], ['fr', fr]])('renders all seven complete principles in %s', (locale, resources) => {
    const t = (key) => key.split('.').reduce((value, part) => value?.[part], resources);
    const content = createSiteContent(t, locale);
    document.body.innerHTML = Approach({ content });

    const section = document.querySelector('#approach');
    const cards = [...section.querySelectorAll('.approach-card')];
    expect(section.querySelector('h2').textContent).toBe(resources.approach.heading);
    expect(section.getAttribute('aria-labelledby')).toBe(section.querySelector('h2').id);
    expect(section.querySelector('.approach__statement').textContent).toBe(resources.approach.statement);
    expect(section.querySelectorAll('.approach__statement br')).toHaveLength(
      /[.—]\s+/.test(resources.approach.statement) ? 1 : 0
    );
    expect(cards).toHaveLength(7);
    cards.forEach((card, index) => {
      const header = card.querySelector('.approach-card__header');
      expect(header.querySelector('.approach-card__number')).toBe(card.querySelector('.approach-card__number'));
      expect(header.querySelector('h3')).toBe(card.querySelector('h3'));
      expect(card.querySelector('h3').textContent).toBe(resources.approach.items[index].title);
      expect(card.querySelector('p').textContent).toBe(resources.approach.items[index].text);
      expect(card.querySelector('.approach-card__number').textContent).toBe(String(index + 1).padStart(2, '0'));
      expect(card.querySelector('.approach-card__number').getAttribute('aria-hidden')).toBe('true');
    });
    expect(section.querySelectorAll('[hidden]')).toHaveLength(0);
    expect(section.querySelector('.approach__cta').getAttribute('href')).toBe('#contacts');
    expect(section.querySelector('.approach__cta').textContent).toBe(resources.approach.cta);
    expect(section.textContent).toContain(resources.approach.closingText);
    expect(section.textContent).toContain(resources.approach.invitation);
  });

  it('places the new section after About and before Learning Goals', () => {
    const source = readFileSync(resolve(import.meta.dirname, '../src/renderLanding.js'), 'utf8');
    expect(source.indexOf('Approach(context)')).toBeGreaterThan(source.indexOf('About(context)'));
    expect(source.indexOf('Approach(context)')).toBeLessThan(source.indexOf('LearningGoals(context)'));
  });

  it.each([
    ['Английский или французский — ваш темп, ваши цели, ваш результат.', 'Английский или французский —'],
    ['English or French — your pace, your goals, your results.', 'English or French —'],
    ['Anglais ou français — votre rythme, vos objectifs, vos résultats.', 'Anglais ou français —'],
    ['Язык тогда, когда он нужен. И для того, что вам важно.', 'Язык тогда, когда он нужен.'],
  ])('keeps the statement in two lines without changing the wording: %s', (statement, firstLine) => {
    document.body.innerHTML = Approach({ content: { approach: { ...ru.approach, statement } } });
    const paragraph = document.querySelector('.approach__statement');
    expect(paragraph.querySelectorAll('br')).toHaveLength(1);
    expect(paragraph.textContent).toBe(statement);
    expect(paragraph.firstChild.textContent).toBe(firstLine);
  });

  it('sets the requested card heading styles directly', () => {
    const css = readFileSync(resolve(import.meta.dirname, '../src/sections/Approach.css'), 'utf8');
    const titleRule = css.match(/\.approach-card__title\s*\{([^}]+)\}/)[1];
    for (const declaration of [
      'color: #684C3B;',
      'font-family: var(--font-display);',
      'font-size: 24px;',
      'font-weight: 500;',
      'line-height: 1.15;',
    ]) {
      expect(titleRule).toContain(declaration);
    }
    expect(titleRule).not.toContain('text-align: center;');
    expect(titleRule).not.toContain('text-transform: uppercase;');
  });

  it('keeps the number beside the start of the title and separates the header from the body', () => {
    const css = readFileSync(resolve(import.meta.dirname, '../src/sections/Approach.css'), 'utf8');
    const headerRule = css.match(/\.approach-card__header\s*\{([^}]+)\}/)[1];
    expect(headerRule).toContain('grid-template-columns: 36px minmax(0, 1fr);');
    expect(headerRule).toContain('align-items: start;');
    expect(headerRule).toContain('border-bottom: 1px solid var(--color-border-gold);');
  });

  it('uses a consistent typeface and color for the two introduction lines without italics', () => {
    const css = readFileSync(resolve(import.meta.dirname, '../src/sections/Approach.css'), 'utf8');
    const statementRule = css.match(/\.approach__statement\s*\{([^}]+)\}/)[1];
    const descriptionRule = css.match(/\.approach__description\s*\{([^}]+)\}/)[1];
    for (const rule of [statementRule, descriptionRule]) {
      expect(rule).toContain('font-family: var(--font-display);');
      expect(rule).toContain('color: #684C3B;');
      expect(rule).not.toContain('font-style: italic;');
    }
    expect(statementRule).toContain('font-size: 24px;');
    expect(descriptionRule).toContain('font-size: 20px;');
  });

  it('separates the introduction columns with a gold line and stacks them on mobile', () => {
    const css = readFileSync(resolve(import.meta.dirname, '../src/sections/Approach.css'), 'utf8');
    const introRule = css.match(/\.approach__intro\s*\{([^}]+)\}/)[1];
    const descriptionRule = css.match(/\.approach__description\s*\{([^}]+)\}/)[1];
    expect(introRule).toContain('grid-template-columns: minmax(0, max-content) minmax(0, 420px);');
    expect(introRule).toContain('width: fit-content;');
    expect(introRule).toContain('max-width: 100%;');
    expect(introRule).toContain('margin: 20px auto 32px;');
    expect(introRule).toContain('text-align: left;');
    expect(descriptionRule).toContain('border-left: 2px solid var(--color-gold);');
    expect(descriptionRule).toContain('align-items: center;');
    const mobileRules = css.slice(css.indexOf('@media (max-width: 767px)'));
    expect(mobileRules).toMatch(/\.approach__intro\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\);/);
    expect(mobileRules).toMatch(/\.approach__description\s*\{[^}]*border-left: 0;[^}]*border-top: 1px solid var\(--color-gold\);/);
  });

  it('aligns the statement toward the divider while keeping mobile text left-aligned', () => {
    const css = readFileSync(resolve(import.meta.dirname, '../src/sections/Approach.css'), 'utf8');
    const statementRule = css.match(/\.approach__statement\s*\{([^}]+)\}/)[1];
    expect(statementRule).toContain('text-align: right;');
    expect(statementRule).toContain('padding-right: 20px;');
    const mobileRules = css.slice(css.indexOf('@media (max-width: 767px)'));
    expect(mobileRules).toMatch(/\.approach__statement\s*\{[^}]*padding-right: 0;[^}]*text-align: left;/);
  });
});
