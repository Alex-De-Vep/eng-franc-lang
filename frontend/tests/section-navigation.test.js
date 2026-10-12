import { describe, expect, it, vi } from 'vitest';
vi.mock('swiper', () => ({ default: vi.fn() }));
vi.mock('swiper/modules', () => ({ A11y: {}, Navigation: {}, Pagination: {} }));

import { Header } from '../src/sections/Header.js';
import { Footer } from '../src/sections/Footer.js';
import { Hero } from '../src/sections/Hero.js';
import { About } from '../src/sections/About.js';
import { Approach } from '../src/sections/Approach.js';
import { LearningGoals } from '../src/sections/LearningGoals.js';
import { Reviews } from '../src/sections/Reviews.js';
import { FaqContact } from '../src/sections/FaqContact.js';
import { CoffeeClub } from '../src/sections/CoffeeClub.js';
import { FrenchLessons } from '../src/sections/FrenchLessons.js';
import { Atmosphere } from '../src/sections/Atmosphere.js';
import { createSiteContent } from '../src/data/content.js';
import { initSmoothNavigation } from '../src/interactions.js';
import ru from '../src/locales/ru.json';
import en from '../src/locales/en.json';
import fr from '../src/locales/fr.json';

const sections = [Hero, About, Approach, LearningGoals, Reviews, FaqContact, CoffeeClub, FrenchLessons, Atmosphere];
const hrefs = ['#home', '#about', '#approach', '#goals', '#reviews', '#faq', '#contacts', '#coffee-club', '#french-lessons', '#atmosphere'];

describe('section navigation', () => {
  it.each([['ru', ru], ['en', en], ['fr', fr]])('links to all %s sections in the footer and adds Club and Atmosphere without Home or Contact in the header', (locale, resources) => {
    const t = key => key.split('.').reduce((value, part) => value?.[part], resources);
    const content = createSiteContent(t, locale);
    const context = { t, content, locale };
    document.body.innerHTML = Header(context) + sections.map(render => render(context)).join('') + Footer(context);

    const footerLinks = [...document.querySelectorAll('.site-footer__navigation a')];
    expect(footerLinks.map(link => link.getAttribute('href'))).toEqual(hrefs);
    footerLinks.forEach((link, index) => {
      expect(link.textContent).toBe(content.footerNavigation[index].label);
      expect(document.querySelectorAll(link.getAttribute('href'))).toHaveLength(1);
    });
    const columns = document.querySelectorAll('.site-footer__navigation-columns > div');
    expect([...columns].map(column => column.querySelectorAll('a').length)).toEqual([5, 5]);
    const headerLinks = [...document.querySelectorAll('.site-header__nav-link')];
    expect(headerLinks.map(link => link.getAttribute('href'))).toEqual(content.navigation.filter(item => !['#home', '#contacts'].includes(item.href)).map(item => item.href));
    expect(document.querySelector('.site-header__nav-link[href="#home"]')).toBeNull();
    expect(document.querySelector('.site-header__nav-link[href="#contacts"]')).toBeNull();
    expect(document.querySelector('.site-header__cta').getAttribute('href')).toBe('#contacts');
    expect(document.querySelector('.site-header__nav-link[href="#coffee-club"]').textContent).toBe(resources.navigation[6]);
    expect(document.querySelector('.site-header__nav-link[href="#atmosphere"]').textContent).toBe(resources.navigation[7]);
    headerLinks.forEach(link => expect(document.querySelectorAll(link.getAttribute('href'))).toHaveLength(1));
    expect(document.querySelector('.site-header__brand').getAttribute('href')).toBe('#home');
  });

  it('smoothly navigates to the newly linked sections', () => {
    const t = key => key.split('.').reduce((value, part) => value?.[part], ru);
    const content = createSiteContent(t, 'ru');
    const context = { t, content, locale: 'ru' };
    window.history.replaceState({}, '', '/ru/');
    document.body.innerHTML = sections.map(render => render(context)).join('') + Footer(context);
    initSmoothNavigation();
    for (const href of ['#approach', '#coffee-club', '#french-lessons', '#atmosphere']) {
      const target = document.querySelector(href);
      target.scrollIntoView = vi.fn();
      document.querySelector(`.site-footer__navigation a[href="${href}"]`).click();
      expect(target.scrollIntoView).toHaveBeenCalled();
      expect(window.location.hash).toBe(href);
    }
  });
});
