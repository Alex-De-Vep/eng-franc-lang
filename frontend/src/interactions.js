import Swiper from 'swiper';
import { A11y, Navigation, Pagination } from 'swiper/modules';

export function initMobileNavigation(root = document, t = (key) => key) {
  const header = root.querySelector('.site-header');
  const toggle = header?.querySelector('.site-header__menu-toggle');
  const panel = header?.querySelector('.site-header__panel');
  if (!header || !toggle || !panel) return null;

  const documentRoot = root.nodeType === 9 ? root : root.ownerDocument;
  const mobileMedia = typeof window.matchMedia === 'function' ? window.matchMedia('(max-width: 767px)') : null;
  const headerTop = header.querySelector('.site-header__top');
  const headerInner = header.querySelector('.site-header__inner');

  const updateHeaderHeight = () => {
    if (!mobileMedia?.matches || !headerTop || !headerInner) return;
    const innerStyles = window.getComputedStyle(headerInner);
    const verticalPadding = Number.parseFloat(innerStyles.paddingTop || 0) + Number.parseFloat(innerStyles.paddingBottom || 0);
    header.style.setProperty('--mobile-header-height', `${Math.ceil(headerTop.getBoundingClientRect().height + verticalPadding)}px`);
  };

  const setPanelAvailability = (isAvailable) => {
    panel.setAttribute('aria-hidden', String(!isAvailable));
    panel.inert = !isAvailable;
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    header.classList.remove('site-header--menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', t('common.openMenu'));
    documentRoot.body.classList.remove('mobile-menu-open');
    if (mobileMedia?.matches) setPanelAvailability(false);
    if (restoreFocus) toggle.focus();
  };

  const openMenu = () => {
    updateHeaderHeight();
    header.classList.add('site-header--menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', t('common.closeMenu'));
    documentRoot.body.classList.add('mobile-menu-open');
    setPanelAvailability(true);
  };

  toggle.addEventListener('click', () => {
    if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
    else openMenu();
  });

  panel.querySelectorAll('a[href]').forEach((link) => link.addEventListener('click', () => closeMenu()));

  documentRoot.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') closeMenu({ restoreFocus: true });
  });

  documentRoot.addEventListener('click', (event) => {
    if (
      toggle.getAttribute('aria-expanded') === 'true'
      && !panel.contains(event.target)
      && !toggle.contains(event.target)
    ) closeMenu();
  });

  mobileMedia?.addEventListener?.('change', (event) => {
    if (!event.matches) {
      closeMenu();
      setPanelAvailability(true);
      header.style.removeProperty('--mobile-header-height');
      return;
    }

    updateHeaderHeight();
    closeMenu();
  });

  window.addEventListener?.('resize', updateHeaderHeight);
  documentRoot.fonts?.ready?.then(updateHeaderHeight);

  if (mobileMedia?.matches) {
    updateHeaderHeight();
    setPanelAvailability(false);
  } else {
    setPanelAvailability(true);
  }

  return { openMenu, closeMenu, updateHeaderHeight };
}

export function initLearningGoals(root = document, t = (key) => key) {
  const tabs = [...root.querySelectorAll('.learning-goals__tab')];
  if (!tabs.length) return [];
  const mediaPanels = [...root.querySelectorAll('[data-learning-goal-media]')];
  const sliders = new Map();

  const initializeSlider = (index) => {
    const panel = mediaPanels[index];
    if (!panel || sliders.has(index)) return sliders.get(index) ?? null;

    const slider = new Swiper(panel, {
      modules: [Navigation, Pagination, A11y],
      slidesPerView: 1,
      slidesPerGroup: 1,
      speed: 400,
      loop: false,
      watchOverflow: true,
      navigation: {
        prevEl: panel.querySelector('.learning-goals__arrow--prev'),
        nextEl: panel.querySelector('.learning-goals__arrow--next'),
        disabledClass: 'learning-goals__arrow--disabled',
      },
      pagination: {
        el: panel.querySelector('.learning-goals__pagination'),
        clickable: true,
        bulletClass: 'learning-goals__pagination-bullet',
        bulletActiveClass: 'learning-goals__pagination-bullet--active',
      },
      a11y: {
        prevSlideMessage: t('swiper.previousPhoto'),
        nextSlideMessage: t('swiper.nextPhoto'),
        firstSlideMessage: t('swiper.firstPhoto'),
        lastSlideMessage: t('swiper.lastPhoto'),
        paginationBulletMessage: t('swiper.photoBullet', { index: '{{index}}' }),
      },
    });

    sliders.set(index, slider);
    return slider;
  };

  const activateTab = (activeTab) => {
    const activeIndex = tabs.indexOf(activeTab);

    tabs.forEach((tab) => {
      const isActive = tab === activeTab;
      const panel = root.querySelector(`#${tab.getAttribute('aria-controls')}`);

      tab.classList.toggle('learning-goals__tab--active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      if (panel) panel.hidden = !isActive;
    });

    mediaPanels.forEach((panel, index) => {
      panel.hidden = index !== activeIndex;
    });

    initializeSlider(activeIndex)?.update?.();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (event) => {
      let nextIndex = null;

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (nextIndex === null) return;

      event.preventDefault();
      activateTab(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });

  initializeSlider(0);

  return tabs;
}

export function initSmoothNavigation(root = document) {
  root.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const hash = link.getAttribute('href');
      const target = root.querySelector(hash);
      if (!target) return;
      event.preventDefault();
      const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      window.history.replaceState(null, '', hash);
      root.querySelectorAll('.site-header__language').forEach((languageLink) => {
        const url = new URL(languageLink.getAttribute('href'), window.location.origin);
        languageLink.setAttribute('href', `${url.pathname}${hash}`);
      });
    });
  });
}

export function initReviewsSlider(root = document, t = (key) => key) {
  const container = root.querySelector('.reviews__viewport');
  if (!container) return null;

  const section = container.closest('.reviews');
  const previousButton = section.querySelector('.reviews__button--prev');
  const nextButton = section.querySelector('.reviews__button--next');

  return new Swiper(container, {
    modules: [Navigation, A11y],
    slidesPerView: 'auto',
    slidesPerGroup: 1,
    slidesOffsetBefore: 16,
    slidesOffsetAfter: 16,
    spaceBetween: 23,
    speed: 400,
    loop: false,
    watchOverflow: true,
    grabCursor: true,
    breakpoints: {
      768: {
        slidesOffsetBefore: 32,
        slidesOffsetAfter: 32,
      },
      1280: {
        slidesOffsetBefore: 24,
        slidesOffsetAfter: 24,
      },
    },
    navigation: {
      prevEl: previousButton,
      nextEl: nextButton,
      disabledClass: 'reviews__button--disabled',
    },
    a11y: {
      prevSlideMessage: t('swiper.previousReview'),
      nextSlideMessage: t('swiper.nextReview'),
      firstSlideMessage: t('swiper.firstReview'),
      lastSlideMessage: t('swiper.lastReview'),
    },
  });
}

export function initReviewModal(root = document) {
  const dialog = root.querySelector('.review-modal');
  if (!dialog) return null;

  const documentRoot = root.nodeType === 9 ? root : root.ownerDocument;
  const reviewView = dialog.querySelector('.review-modal__view--review');
  const contactView = dialog.querySelector('.review-modal__view--contact');
  const modalAvatar = dialog.querySelector('.review-modal__avatar');
  const modalName = dialog.querySelector('.review-modal__name');
  const modalOccupation = dialog.querySelector('.review-modal__occupation');
  const modalText = dialog.querySelector('.review-modal__text');
  const closeButton = dialog.querySelector('.review-modal__close');
  const backButton = dialog.querySelector('.review-modal__back');
  const ctaButton = dialog.querySelector('.review-modal__cta');
  const contactHeading = contactView.querySelector('.contacts__heading');
  let opener = null;

  const showReviewView = () => {
    reviewView.hidden = false;
    contactView.hidden = true;
    dialog.setAttribute('aria-labelledby', 'review-modal-name');
  };

  const closeModal = () => {
    if (dialog.open) dialog.close();
  };

  root.querySelectorAll('.review-card__more').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.review-card');
      const avatar = card.querySelector('.review-card__avatar');

      opener = button;
      modalAvatar.setAttribute('src', avatar.getAttribute('src'));
      modalAvatar.setAttribute('alt', avatar.getAttribute('alt'));
      modalName.textContent = card.querySelector('.review-card__name').textContent;
      modalOccupation.textContent = card.querySelector('.review-card__occupation').textContent;
      modalText.textContent = card.querySelector('.review-card__text').textContent;
      showReviewView();
      documentRoot.body.classList.add('review-modal-open');
      dialog.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener('click', closeModal);
  backButton.addEventListener('click', closeModal);

  ctaButton.addEventListener('click', () => {
    reviewView.hidden = true;
    contactView.hidden = false;
    dialog.setAttribute('aria-labelledby', contactHeading.id);
    contactHeading.focus();
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeModal();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeModal();
  });

  dialog.addEventListener('close', () => {
    documentRoot.body.classList.remove('review-modal-open');
    showReviewView();
    opener?.focus();
    opener = null;
  });

  return dialog;
}

export function initAccordion(root = document) {
  const buttons = [...root.querySelectorAll('.faq__trigger')];

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq__item');
      const willOpen = button.getAttribute('aria-expanded') !== 'true';

      buttons.forEach((otherButton) => {
        const otherItem = otherButton.closest('.faq__item');
        otherButton.setAttribute('aria-expanded', 'false');
        otherItem.classList.remove('faq__item--open');
        otherItem.querySelector('.faq__answer').setAttribute('aria-hidden', 'true');
      });

      if (willOpen) {
        button.setAttribute('aria-expanded', 'true');
        item.classList.add('faq__item--open');
        item.querySelector('.faq__answer').setAttribute('aria-hidden', 'false');
      }
    });
  });
}

export function validateContactForm(form, t = (key) => key) {
  const email = form.elements.email;
  const consent = form.elements.consent;
  const errors = {};
  const emailValue = email.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailValue) errors.email = t('validation.emailRequired');
  else if (!emailPattern.test(emailValue)) errors.email = t('validation.emailInvalid');
  if (!consent.checked) errors.consent = t('validation.consentRequired');

  return errors;
}

export function initContactForm(root = document, t = (key) => key) {
  const forms = [...root.querySelectorAll('[data-contact-form]')];

  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const errors = validateContactForm(form, t);
      const emailError = form.querySelector('[data-form-error="email"]');
      const consentError = form.querySelector('[data-form-error="consent"]');
      const status = form.querySelector('.contact-form__status');

      emailError.textContent = errors.email ?? '';
      consentError.textContent = errors.consent ?? '';
      form.elements.email.setAttribute('aria-invalid', String(Boolean(errors.email)));
      form.elements.consent.setAttribute('aria-invalid', String(Boolean(errors.consent)));

      if (Object.keys(errors).length) {
        status.textContent = t('validation.checkForm');
        status.dataset.state = 'error';
        return;
      }

      status.textContent = t('validation.success');
      status.dataset.state = 'success';
    });
  });

  return forms;
}
