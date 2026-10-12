export function Logo(className = '', t = (key) => key) {
  return `
    <a class="brand ${className}" href="#home" aria-label="${t('common.logoLabel')}">
      <img class="hero__monogram" src="/assets/images/logo-transparent.webp" width="180" height="168" alt="" aria-hidden="true" />
    </a>
  `;
}
