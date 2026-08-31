export function Logo(className = '', t = (key) => key) {
  return `
    <div class="brand ${className}" aria-label="${t('common.logoLabel')}">
      <span class="brand__first-name">Irina</span>
      <span class="brand__last-name">Purtova</span>
      <img class="brand__divider" src="/assets/icons/brand-divider.svg" alt="" />
      <span class="brand__role">${t('common.logoRole')}</span>
    </div>
  `;
}
