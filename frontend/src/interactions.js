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

export function initAtmosphereModal(root = document) {
  const dialog = root.querySelector('.atmosphere-modal');
  if (!dialog) return null;

  const documentRoot = root.nodeType === 9 ? root : root.ownerDocument;
  const modalImage = dialog.querySelector('.atmosphere-modal__image');
  const closeButton = dialog.querySelector('.atmosphere-modal__close');
  let opener = null;

  const closeModal = () => {
    if (dialog.open) dialog.close();
  };

  root.querySelectorAll('.atmosphere__photo-button').forEach((button) => {
    button.addEventListener('click', () => {
      const image = button.querySelector('.atmosphere__photo');

      opener = button;
      modalImage.setAttribute('src', image.dataset.fullSrc || image.currentSrc || image.getAttribute('src'));
      modalImage.setAttribute('alt', image.getAttribute('alt'));
      documentRoot.body.classList.add('atmosphere-modal-open');
      dialog.showModal();
      closeButton.focus();
    });
  });

  closeButton.addEventListener('click', closeModal);

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeModal();
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) closeModal();
  });

  dialog.addEventListener('close', () => {
    documentRoot.body.classList.remove('atmosphere-modal-open');
    opener?.focus();
    opener = null;
  });

  return dialog;
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
  const modalAge = dialog.querySelector('.review-modal__age');
  const modalCity = dialog.querySelector('.review-modal__city');
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
      modalAge.textContent = card.querySelector('.review-card__age').textContent;
      modalCity.textContent = card.querySelector('.review-card__city').textContent;
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
  const comment = form.elements.comment;
  const errors = {};
  const emailValue = email.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailValue) errors.email = t('validation.emailRequired');
  else if (!emailPattern.test(emailValue)) errors.email = t('validation.emailInvalid');
  if (comment?.value.length > 2000) errors.comment = t('validation.commentTooLong');
  if (!consent.checked) errors.consent = t('validation.consentRequired');

  return errors;
}

export function initContactSuccessModal(root = document) {
  const dialog = root.querySelector('.contact-success-modal');
  if (!dialog) return null;

  const documentRoot = root.nodeType === 9 ? root : root.ownerDocument;
  const closeButton = dialog.querySelector('.contact-success-modal__close');
  const confirmButton = dialog.querySelector('.contact-success-modal__button');
  let opener = null;

  const close = () => {
    if (dialog.open) dialog.close();
  };

  const open = (trigger = null) => {
    opener = trigger;
    documentRoot.body.classList.add('contact-success-modal-open');
    if (!dialog.open) dialog.showModal();
    confirmButton.focus();
  };

  closeButton.addEventListener('click', close);
  confirmButton.addEventListener('click', close);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('close', () => {
    documentRoot.body.classList.remove('contact-success-modal-open');
    opener?.focus();
    opener = null;
  });

  return { dialog, open, close };
}

export function initContactForm(root = document, t = (key) => key, locale = 'ru', options = {}) {
  const forms = [...root.querySelectorAll('[data-contact-form]')];
  const fetchImpl = options.fetchImpl ?? globalThis.fetch?.bind(globalThis);
  const timeoutMs = options.timeoutMs ?? 12_000;

  const fieldMessage = (field, code) => {
    if (field === 'email') return t(code === 'required' ? 'validation.emailRequired' : 'validation.emailInvalid');
    if (field === 'consent') return t('validation.consentRequired');
    if (field === 'comment') return t('validation.commentTooLong');
    return '';
  };

  forms.forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (form.dataset.submitting === 'true') return;

      const errors = validateContactForm(form, t);
      const status = form.querySelector('.contact-form__status');
      const submit = form.querySelector('[type="submit"]');

      form.querySelectorAll('[data-form-error]').forEach((errorElement) => {
        const field = errorElement.dataset.formError;
        errorElement.textContent = errors[field] ?? '';
        form.elements[field]?.setAttribute('aria-invalid', String(Boolean(errors[field])));
      });

      if (Object.keys(errors).length) {
        status.textContent = t('validation.checkForm');
        status.dataset.state = 'error';
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      form.dataset.submitting = 'true';
      form.setAttribute('aria-busy', 'true');
      submit.disabled = true;
      status.textContent = t('validation.sending');
      status.dataset.state = 'pending';

      try {
        if (!fetchImpl) throw new TypeError('Fetch is unavailable');

        const response = await fetchImpl('/api/contact.php', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.elements.email.value.trim(),
            comment: form.elements.comment?.value.trim() ?? '',
            consent: form.elements.consent.checked,
            locale,
            website: form.elements.website?.value.trim() ?? '',
          }),
          signal: controller.signal,
        });

        let payload = null;
        try {
          payload = await response.json();
        } catch {
          // A non-JSON response is treated as an unavailable API below.
        }

        if (response.ok && payload?.ok === true) {
          form.reset();
          form.querySelectorAll('[aria-invalid]').forEach((field) => field.setAttribute('aria-invalid', 'false'));
          status.textContent = t('validation.success');
          status.dataset.state = 'success';
          options.onSuccess?.({ form, submit });
          return;
        }

        if (response.status === 400 && payload?.error === 'VALIDATION_ERROR') {
          Object.entries(payload.fields ?? {}).forEach(([field, code]) => {
            const errorElement = form.querySelector(`[data-form-error="${field}"]`);
            if (errorElement) errorElement.textContent = fieldMessage(field, code);
            form.elements[field]?.setAttribute('aria-invalid', 'true');
          });
          status.textContent = t('validation.checkForm');
        } else if (response.status === 429 || payload?.error === 'RATE_LIMITED') {
          status.textContent = t('validation.rateLimited');
        } else if (response.status >= 500 && response.status < 600) {
          status.textContent = t('validation.sendError');
        } else {
          status.textContent = t('validation.serverUnavailable');
        }
        status.dataset.state = 'error';
      } catch (error) {
        status.textContent = error?.name === 'AbortError'
          ? t('validation.timeout')
          : t('validation.networkError');
        status.dataset.state = 'error';
      } finally {
        clearTimeout(timeout);
        delete form.dataset.submitting;
        form.removeAttribute('aria-busy');
        submit.disabled = false;
      }
    });
  });

  return forms;
}
