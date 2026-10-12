import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ContactBlock } from '../src/components/ContactBlock.js';
import { createSiteContent } from '../src/data/content.js';
import ru from '../src/locales/ru.json';
import en from '../src/locales/en.json';
import fr from '../src/locales/fr.json';

describe('Telegram application alternative', () => {
  it.each([['ru', ru], ['en', en], ['fr', fr]])('keeps email and Telegram independent in both %s forms', (locale, resources) => {
    const t = key => key.split('.').reduce((value, part) => value?.[part], resources);
    const content = createSiteContent(t, locale);
    document.body.innerHTML = ['page', 'modal'].map(idPrefix => ContactBlock({ idPrefix, t, content })).join('');

    const alternatives = [...document.querySelectorAll('.contacts__alternative')];
    expect(alternatives).toHaveLength(2);
    expect(new Set(alternatives.map(node => node.getAttribute('aria-labelledby'))).size).toBe(2);
    alternatives.forEach(alternative => {
      const form = alternative.parentElement.querySelector('form');
      const link = alternative.querySelector('.contacts__telegram');
      expect(alternative.getAttribute('aria-labelledby')).toBe(link.id);
      expect(alternative.querySelector('h3')).toBeNull();
      expect(alternative.querySelector('.contacts__alternative-divider').textContent).toBe(resources.contact.alternativeOr);
      expect(alternative.querySelector('.contacts__telegram-panel')).toBeNull();
      expect(alternative.querySelector('.contacts__telegram-description')).toBeNull();
      expect(link.textContent).toContain(resources.contact.telegramApplication);
      expect(link.getAttribute('href')).toBe(content.contact.telegramUrl);
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
      expect(link.closest('form')).toBeNull();
      expect(link.querySelector('img').getAttribute('alt')).toBe('');
      expect(link.querySelector('img').closest('[aria-hidden="true"]')).not.toBeNull();
      expect(form.querySelectorAll('button[type="submit"]')).toHaveLength(1);
      expect(form.elements.email).not.toBeNull();
      expect(form.elements.consent).not.toBeNull();
    });
  });

  it('aligns the compact alternative with the email submit button width', () => {
    const css = readFileSync(resolve(import.meta.dirname, '../src/sections/FaqContact.css'), 'utf8');
    const alternativeRule = css.match(/\.contacts__alternative\s*\{([^}]+)\}/)[1];
    const submitRule = css.match(/\.contact-form__submit\s*\{([^}]+)\}/)[1];
    const telegramRule = css.match(/\.contacts__telegram\s*\{([^}]+)\}/)[1];
    expect(alternativeRule).toContain('max-width: 300px;');
    expect(submitRule).toContain('max-width: 300px;');
    expect(telegramRule).toContain('background: transparent;');
    expect(telegramRule).toContain('min-height: 48px;');
  });
});
