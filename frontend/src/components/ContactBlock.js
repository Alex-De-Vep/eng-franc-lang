import { FormField } from './FormField.js';
import { MailIcon } from './MailIcon.js';

function LegalLabel(label, url) {
  if (url) return `<a class="contact-form__legal-link" href="${url}">${label}</a>`;
  return `<span class="contact-form__legal-link contact-form__legal-link--disabled">${label}</span>`;
}

export function ContactBlock({ idPrefix, id = '', className = '', t, content }) {
  const emailId = `${idPrefix}-email`;
  const commentId = `${idPrefix}-comment`;
  const consentId = `${idPrefix}-consent`;
  const headingId = `${idPrefix}-contacts-heading`;

  return `
    <div class="contacts ${className}"${id ? ` id="${id}"` : ''}>
      <h2 class="contacts__heading" id="${headingId}" tabindex="-1">${t('contact.heading')}</h2>
      <p class="contacts__intro">${t('contact.intro')}</p>
      <form class="contact-form" id="${idPrefix}-contact-form" data-contact-form novalidate>
        ${FormField({ id: emailId, name: 'email', label: t('contact.email'), type: 'email', placeholder: content.contact.email })}
        ${FormField({ id: commentId, name: 'comment', label: t('contact.comment'), placeholder: t('contact.commentPlaceholder'), textarea: true })}
        <div class="contact-form__consent">
          <input id="${consentId}" name="consent" type="checkbox" />
          <label for="${consentId}">${t('contact.consentStart')} ${LegalLabel(t('contact.privacy'), content.contact.privacyUrl)} ${t('contact.and')} ${LegalLabel(t('contact.offer'), content.contact.offerUrl)}</label>
        </div>
        <p class="contact-form__consent-error" id="${consentId}-error" data-form-error="consent" aria-live="polite"></p>
        <button class="button button--primary contact-form__submit" type="submit">${t('contact.submit')}</button>
        <p class="contact-form__status" aria-live="polite"></p>
      </form>
      <p class="contacts__note">${MailIcon()} ${t('contact.note')}</p>
    </div>
  `;
}
