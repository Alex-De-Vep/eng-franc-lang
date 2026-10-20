export function CookieNotice({ t, analyticsEnabled = false, privacyUrl = null }) {
  return `
    <section class="cookie-notice" data-cookie-notice role="region" aria-labelledby="cookie-notice-title" hidden>
      <div class="cookie-notice__copy">
        <h2 class="cookie-notice__title" id="cookie-notice-title" tabindex="-1">${t('cookieNotice.title')}</h2>
        <p class="cookie-notice__text">${t(analyticsEnabled ? 'cookieNotice.text' : 'cookieNotice.disabledText')}</p>
        <details class="cookie-notice__details">
          <summary>${t('cookieNotice.details')}</summary>
          <p>${t('cookieNotice.necessaryDetails')}</p>
          <p>${t(analyticsEnabled ? 'cookieNotice.analyticsDetails' : 'cookieNotice.disabledDetails')}</p>
          <p>${t('cookieNotice.changeDetails')}</p>
          ${analyticsEnabled ? `<a href="https://yandex.ru/support/metrica/ru/general/cookie-usage" target="_blank" rel="noopener noreferrer">${t('cookieNotice.yandexDetails')}</a>` : ''}
          ${privacyUrl ? `<p><a href="${privacyUrl}#cookies" target="_blank" rel="noopener noreferrer">${t('footer.privacy')}</a></p>` : ''}
        </details>
      </div>
      <div class="cookie-notice__actions">
        ${analyticsEnabled ? `
          <button class="cookie-notice__choice" type="button" data-cookie-action="reject">${t('cookieNotice.reject')}</button>
          <button class="cookie-notice__choice" type="button" data-cookie-action="accept">${t('cookieNotice.accept')}</button>
        ` : `<button class="cookie-notice__choice" type="button" data-cookie-action="acknowledge">${t('cookieNotice.acknowledge')}</button>`}
        <button class="cookie-notice__close" type="button" data-cookie-action="close" hidden>${t('cookieNotice.close')}</button>
      </div>
    </section>
  `;
}
