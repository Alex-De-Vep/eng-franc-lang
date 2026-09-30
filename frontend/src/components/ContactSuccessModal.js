export function ContactSuccessModal(t) {
  return `
    <dialog class="contact-success-modal" aria-labelledby="contact-success-title" aria-describedby="contact-success-text">
      <div class="contact-success-modal__shell">
        <button class="contact-success-modal__close" type="button" aria-label="${t('contact.successCloseLabel')}">
          <img src="/assets/icons/review-modal-close-line.svg" alt="" />
          <img src="/assets/icons/review-modal-close-line.svg" alt="" />
        </button>
        <div class="contact-success-modal__icon" aria-hidden="true">✓</div>
        <p class="contact-success-modal__eyebrow">${t('contact.successEyebrow')}</p>
        <h2 class="contact-success-modal__title" id="contact-success-title">${t('contact.successTitle')}</h2>
        <p class="contact-success-modal__text" id="contact-success-text">${t('contact.successText')}</p>
        <button class="button button--primary contact-success-modal__button" type="button">${t('contact.successClose')}</button>
      </div>
    </dialog>
  `;
}
