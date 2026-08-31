import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { swiperConstructor } = vi.hoisted(() => ({
  swiperConstructor: vi.fn(function Swiper(container, options) {
    this.container = container;
    this.options = options;
  }),
}));

vi.mock('swiper', () => ({ default: swiperConstructor }));
vi.mock('swiper/modules', () => ({ A11y: { name: 'A11y' }, Navigation: { name: 'Navigation' }, Pagination: { name: 'Pagination' } }));

import { initAccordion, initContactForm, initLearningGoals, initMobileNavigation, initReviewModal, initReviewsSlider, initSmoothNavigation, validateContactForm } from '../src/interactions.js';
import { Header } from '../src/sections/Header.js';
import { Reviews } from '../src/sections/Reviews.js';
import { FaqContact } from '../src/sections/FaqContact.js';
import { LearningGoals } from '../src/sections/LearningGoals.js';
import { Atmosphere } from '../src/sections/Atmosphere.js';
import { createSiteContent } from '../src/data/content.js';
import { initI18n, localePath } from '../src/i18n.js';
import ru from '../src/locales/ru.json';
import en from '../src/locales/en.json';
import fr from '../src/locales/fr.json';

function createTestTranslator(resources) {
  return (key, options = {}) => {
    const value = key.split('.').reduce((result, part) => result?.[part], resources);
    if (typeof value !== 'string') return value;
    return value.replace(/{{(\w+)}}/g, (_, name) => options[name] ?? `{{${name}}}`);
  };
}

const t = createTestTranslator(ru);
const siteContent = createSiteContent(t, 'ru');
const context = { t, content: siteContent, locale: 'ru' };

describe('atmosphere gallery', () => {
  it('fills every non-social tile with an optimized photograph', () => {
    document.body.innerHTML = Atmosphere(context);
    const photoTiles = siteContent.atmosphereTiles.filter((tile) => tile.image);

    expect(document.querySelectorAll('.atmosphere__photo')).toHaveLength(photoTiles.length);
    expect(document.querySelectorAll('.atmosphere__qr')).toHaveLength(2);
    expect([...document.querySelectorAll('.atmosphere__photo')].every((image) => image.getAttribute('src').startsWith('/assets/images/learning-goals/'))).toBe(true);
  });
});

describe('mobile navigation', () => {
  let mobileMedia;
  let mediaListeners;

  beforeEach(() => {
    mediaListeners = [];
    mobileMedia = {
      matches: true,
      addEventListener: vi.fn((eventName, listener) => {
        if (eventName === 'change') mediaListeners.push(listener);
      }),
    };
    vi.stubGlobal('matchMedia', vi.fn(() => mobileMedia));
    document.body.className = '';
    document.body.innerHTML = Header(context);
    initMobileNavigation(document, t);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps the panel hidden and unfocusable until the burger is opened', () => {
    const panel = document.querySelector('.site-header__panel');
    const languages = document.querySelector('.site-header__languages');

    expect(panel.getAttribute('aria-hidden')).toBe('true');
    expect(panel.inert).toBe(true);
    expect(panel.contains(languages)).toBe(false);
    expect(document.querySelector('.site-header__top').contains(languages)).toBe(true);
  });

  it('opens and closes the menu while updating accessibility state', () => {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.site-header__menu-toggle');
    const panel = document.querySelector('.site-header__panel');

    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(header.classList.contains('site-header--menu-open')).toBe(true);
    expect(document.body.classList.contains('mobile-menu-open')).toBe(true);
    expect(panel.getAttribute('aria-hidden')).toBe('false');
    expect(panel.inert).toBe(false);

    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(header.classList.contains('site-header--menu-open')).toBe(false);
    expect(document.body.classList.contains('mobile-menu-open')).toBe(false);
    expect(panel.getAttribute('aria-hidden')).toBe('true');
    expect(panel.inert).toBe(true);
  });

  it('orders navigation, CTA and social links inside the panel', () => {
    const panel = document.querySelector('.site-header__panel');
    const navigation = panel.querySelector('.site-header__nav');
    const cta = panel.querySelector('.site-header__cta');
    const socials = panel.querySelector('.site-header__socials');

    expect(navigation.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(cta.compareDocumentPosition(socials) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('closes on Escape and returns focus to the toggle', () => {
    const toggle = document.querySelector('.site-header__menu-toggle');
    toggle.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });

  it('closes after choosing a navigation link or clicking outside the panel', () => {
    const toggle = document.querySelector('.site-header__menu-toggle');
    toggle.click();
    document.querySelector('.site-header__nav-link').click();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');

    toggle.click();
    document.querySelector('.site-header__brand').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('restores the desktop and tablet panel when leaving the mobile breakpoint', () => {
    const toggle = document.querySelector('.site-header__menu-toggle');
    const panel = document.querySelector('.site-header__panel');
    toggle.click();

    mobileMedia.matches = false;
    mediaListeners.forEach((listener) => listener({ matches: false }));

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(panel.getAttribute('aria-hidden')).toBe('false');
    expect(panel.inert).toBe(false);
    expect(document.body.classList.contains('mobile-menu-open')).toBe(false);
  });
});

describe('localized navigation', () => {
  it('updates language links with the selected section hash', () => {
    window.history.replaceState({}, '', '/ru/');
    document.body.innerHTML = `${Header(context)}<section id="reviews"></section>`;
    document.querySelector('#reviews').scrollIntoView = vi.fn();
    initSmoothNavigation();

    document.querySelector('a[href="#reviews"]').click();

    expect(window.location.hash).toBe('#reviews');
    expect(document.querySelector('.site-header__language[href="/en/#reviews"]')).not.toBeNull();
    expect(document.querySelector('.site-header__language[href="/fr/#reviews"]')).not.toBeNull();
  });
});

describe('learning goals', () => {
  beforeEach(() => {
    swiperConstructor.mockClear();
    document.body.innerHTML = LearningGoals(context);
    initLearningGoals(document, t);
  });

  it('renders every goal and shows the first goal initially', () => {
    const tabs = document.querySelectorAll('.learning-goals__tab');
    const panels = document.querySelectorAll('.learning-goals__panel');
    const mediaPanels = document.querySelectorAll('[data-learning-goal-media]');

    expect(tabs).toHaveLength(siteContent.learningGoals.length);
    expect(panels).toHaveLength(siteContent.learningGoals.length);
    expect(mediaPanels).toHaveLength(siteContent.learningGoals.length);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(panels[0].hidden).toBe(false);
    expect(mediaPanels[0].hidden).toBe(false);
    expect([...panels].slice(1).every((panel) => panel.hidden)).toBe(true);
    expect([...mediaPanels].slice(1).every((panel) => panel.hidden)).toBe(true);
  });

  it('shows the selected goal title and points', () => {
    const tabs = document.querySelectorAll('.learning-goals__tab');
    tabs[2].click();
    const panel = document.querySelector('#learning-goal-panel-2');

    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    expect(panel.hidden).toBe(false);
    expect(panel.querySelector('h3').textContent).toBe(siteContent.learningGoals[2].title);
    expect([...panel.querySelectorAll('li')].map((item) => item.textContent)).toEqual(siteContent.learningGoals[2].points);
    expect(document.querySelector('[data-learning-goal-media="2"]').hidden).toBe(false);
    expect(document.querySelectorAll('[data-learning-goal-media="2"] .learning-goals__slide')).toHaveLength(siteContent.learningGoals[2].images.length);
  });

  it('initializes one slider per opened category with navigation and pagination', () => {
    const firstMedia = document.querySelector('[data-learning-goal-media="0"]');

    expect(swiperConstructor).toHaveBeenCalledOnce();
    expect(swiperConstructor).toHaveBeenCalledWith(
      firstMedia,
      expect.objectContaining({
        slidesPerView: 1,
        slidesPerGroup: 1,
        speed: 400,
        loop: false,
        navigation: expect.objectContaining({
          prevEl: firstMedia.querySelector('.learning-goals__arrow--prev'),
          nextEl: firstMedia.querySelector('.learning-goals__arrow--next'),
        }),
        pagination: expect.objectContaining({
          el: firstMedia.querySelector('.learning-goals__pagination'),
          clickable: true,
        }),
      }),
    );

    document.querySelectorAll('.learning-goals__tab')[1].click();
    expect(swiperConstructor).toHaveBeenCalledTimes(2);
  });
});

describe('reviews slider', () => {
  beforeEach(() => {
    swiperConstructor.mockClear();
    document.body.innerHTML = `
      <section class="reviews">
        <button class="reviews__button--prev" type="button"></button>
        <button class="reviews__button--next" type="button"></button>
        <div class="reviews__viewport"></div>
      </section>
    `;
  });

  it('initializes Swiper with one-card navigation and fixed spacing', () => {
    const slider = initReviewsSlider();
    const container = document.querySelector('.reviews__viewport');
    const previousButton = document.querySelector('.reviews__button--prev');
    const nextButton = document.querySelector('.reviews__button--next');

    expect(slider).toBeInstanceOf(swiperConstructor);
    expect(swiperConstructor).toHaveBeenCalledOnce();
    expect(swiperConstructor).toHaveBeenCalledWith(
      container,
      expect.objectContaining({
        slidesPerView: 'auto',
        slidesPerGroup: 1,
        slidesOffsetBefore: 16,
        slidesOffsetAfter: 16,
        spaceBetween: 23,
        speed: 400,
        loop: false,
        breakpoints: {
          768: { slidesOffsetBefore: 32, slidesOffsetAfter: 32 },
          1280: { slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
        },
        navigation: expect.objectContaining({ prevEl: previousButton, nextEl: nextButton }),
      }),
    );
  });

  it('does nothing when the reviews section is absent', () => {
    document.body.innerHTML = '';

    expect(initReviewsSlider()).toBeNull();
    expect(swiperConstructor).not.toHaveBeenCalled();
  });

  it('renders the Instagram Reels link first and keeps every review', () => {
    document.body.innerHTML = Reviews(context);
    const slides = document.querySelectorAll('.reviews__slide');
    const instagramLink = slides[0].querySelector('.review-card--instagram');

    expect(slides).toHaveLength(siteContent.reviews.length + 1);
    expect(instagramLink.getAttribute('href')).toBe(siteContent.reviewsInstagramUrl);
    expect(instagramLink.getAttribute('target')).toBe('_blank');
    expect(instagramLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(slides[0].querySelector('.review-card__more')).toBeNull();
    expect(document.querySelectorAll('.review-card__more')).toHaveLength(siteContent.reviews.length);
  });
});

describe('review modal', () => {
  beforeEach(() => {
    document.body.className = '';
    document.body.innerHTML = Reviews(context);
    const dialog = document.querySelector('.review-modal');
    dialog.showModal = vi.fn(() => dialog.setAttribute('open', ''));
    dialog.close = vi.fn(() => {
      dialog.removeAttribute('open');
      dialog.dispatchEvent(new Event('close'));
    });
    initReviewModal();
  });

  it('opens with data from the selected card', () => {
    const cards = document.querySelectorAll('.review-card');
    cards[1].querySelector('.review-card__more').click();
    const dialog = document.querySelector('.review-modal');

    expect(dialog.showModal).toHaveBeenCalledOnce();
    expect(dialog.querySelector('.review-modal__name').textContent).toBe(cards[1].querySelector('.review-card__name').textContent);
    expect(dialog.querySelector('.review-modal__occupation').textContent).toBe(cards[1].querySelector('.review-card__occupation').textContent);
    expect(dialog.querySelector('.review-modal__text').textContent).toBe(cards[1].querySelector('.review-card__text').textContent);
    expect(document.body.classList.contains('review-modal-open')).toBe(true);
  });

  it('switches the same dialog from the review to the shared contact form', () => {
    document.querySelector('.review-card__more').click();
    document.querySelector('.review-modal__cta').click();

    expect(document.querySelector('.review-modal__view--review').hidden).toBe(true);
    expect(document.querySelector('.review-modal__view--contact').hidden).toBe(false);
    expect(document.querySelector('#modal-contact-form')).not.toBeNull();
    expect(document.querySelector('.review-modal').getAttribute('aria-labelledby')).toBe('modal-contacts-heading');
  });

  it('closes with the cross, restores the review view and returns focus', () => {
    const opener = document.querySelector('.review-card__more');
    const dialog = document.querySelector('.review-modal');
    opener.click();
    document.querySelector('.review-modal__cta').click();
    document.querySelector('.review-modal__close').click();

    expect(dialog.close).toHaveBeenCalledOnce();
    expect(document.body.classList.contains('review-modal-open')).toBe(false);
    expect(document.querySelector('.review-modal__view--review').hidden).toBe(false);
    expect(document.activeElement).toBe(opener);
  });

  it('closes on cancel and backdrop click', () => {
    const dialog = document.querySelector('.review-modal');
    const opener = document.querySelector('.review-card__more');
    opener.click();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(dialog.close).toHaveBeenCalledTimes(1);

    opener.click();
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(dialog.close).toHaveBeenCalledTimes(2);
  });
});

describe('FAQ accordion', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <article class="faq__item">
        <button class="faq__trigger" aria-expanded="false"></button>
        <div class="faq__answer" aria-hidden="true">Первый ответ</div>
      </article>
      <article class="faq__item">
        <button class="faq__trigger" aria-expanded="false"></button>
        <div class="faq__answer" aria-hidden="true">Второй ответ</div>
      </article>
    `;
    initAccordion();
  });

  it('opens an item and updates aria-expanded', () => {
    const [first] = document.querySelectorAll('.faq__trigger');
    first.click();

    expect(first.getAttribute('aria-expanded')).toBe('true');
    expect(first.closest('.faq__item').classList.contains('faq__item--open')).toBe(true);
    expect(first.closest('.faq__item').querySelector('.faq__answer').getAttribute('aria-hidden')).toBe('false');
  });

  it('keeps only one item open', () => {
    const [first, second] = document.querySelectorAll('.faq__trigger');
    first.click();
    second.click();

    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(first.closest('.faq__item').querySelector('.faq__answer').getAttribute('aria-hidden')).toBe('true');
    expect(second.closest('.faq__item').querySelector('.faq__answer').getAttribute('aria-hidden')).toBe('false');
  });
});

describe('contact form', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form data-contact-form>
        <input name="email" />
        <input name="consent" type="checkbox" />
        <p data-form-error="email"></p>
        <p data-form-error="consent"></p>
        <p class="contact-form__status"></p>
      </form>
    `;
  });

  it('reports invalid email and missing consent', () => {
    const form = document.querySelector('form');
    form.elements.email.value = 'wrong-address';

    expect(validateContactForm(form, t)).toEqual({
      email: 'Введите корректный email',
      consent: 'Подтвердите согласие на обработку данных',
    });
  });

  it('accepts a valid email and shows the demo status without a request', () => {
    const form = document.querySelector('form');
    form.elements.email.value = 'student@example.com';
    form.elements.consent.checked = true;
    initContactForm(document, t);

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(form.querySelector('.contact-form__status').dataset.state).toBe('success');
    expect(form.querySelector('.contact-form__status').textContent).toContain('backend');
  });

  it('renders page and modal forms without duplicate ids', () => {
    document.body.innerHTML = `${FaqContact(context)}${Reviews(context)}`;
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(document.querySelector('#page-contact-form')).not.toBeNull();
    expect(document.querySelector('#modal-contact-form')).not.toBeNull();
  });
});

describe('localization', () => {
  const dictionaries = { ru, en, fr };

  function shape(value) {
    if (Array.isArray(value)) return value.map(shape);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
    return typeof value;
  }

  it('keeps the same keys and array sizes in every dictionary', () => {
    expect(shape(en)).toEqual(shape(ru));
    expect(shape(fr)).toEqual(shape(ru));
  });

  it.each(['ru', 'en', 'fr'])('renders the %s language and active language link', (locale) => {
    const localeT = createTestTranslator(dictionaries[locale]);
    const localeContent = createSiteContent(localeT, locale, '#reviews');
    const localeContext = { t: localeT, content: localeContent, locale };
    document.body.innerHTML = `${Header(localeContext)}${LearningGoals(localeContext)}${FaqContact(localeContext)}`;

    expect(document.querySelector('.learning-goals__heading').textContent).toBe(dictionaries[locale].learningGoals.heading);
    expect(document.querySelector('.faq__heading').textContent).toBe(dictionaries[locale].faq.heading);
    expect(document.querySelector('.site-header__language[aria-current="page"]').textContent).toBe(locale.toUpperCase());
    expect(document.querySelector(`a[href="/${locale}/#reviews"]`)).not.toBeNull();
  });

  it('preserves a supported locale and hash in language paths', () => {
    expect(localePath('en', '#reviews')).toBe('/en/#reviews');
    expect(localePath('de', '#faq')).toBe('/ru/#faq');
  });

  it('gives the language in the URL priority over a saved choice', async () => {
    window.history.replaceState({}, '', '/fr/#reviews');
    window.localStorage.setItem('i18nextLng', 'en');

    const result = await initI18n();

    expect(result.locale).toBe('fr');
    expect(document.documentElement.lang).toBe('fr');
  });

  it.each([
    ['en-US', 'en'],
    ['fr-FR', 'fr'],
    ['de-DE', 'ru'],
  ])('detects %s from the browser as %s', async (browserLanguage, expectedLocale) => {
    window.history.replaceState({}, '', '/');
    window.localStorage.clear();
    const originalLanguage = Object.getOwnPropertyDescriptor(window.navigator, 'language');
    const originalLanguages = Object.getOwnPropertyDescriptor(window.navigator, 'languages');
    Object.defineProperty(window.navigator, 'language', { configurable: true, value: browserLanguage });
    Object.defineProperty(window.navigator, 'languages', { configurable: true, value: [browserLanguage] });

    const result = await initI18n({ detectionOrder: ['localStorage', 'navigator'] });

    expect(result.locale).toBe(expectedLocale);
    if (originalLanguage) Object.defineProperty(window.navigator, 'language', originalLanguage);
    if (originalLanguages) Object.defineProperty(window.navigator, 'languages', originalLanguages);
  });

  it('uses localized form validation messages', () => {
    document.body.innerHTML = '<form><input name="email"><input name="consent" type="checkbox"></form>';
    const form = document.querySelector('form');
    form.elements.email.value = 'invalid';
    const frenchT = createTestTranslator(fr);

    expect(validateContactForm(form, frenchT)).toEqual({
      email: fr.validation.emailInvalid,
      consent: fr.validation.consentRequired,
    });
  });
});
