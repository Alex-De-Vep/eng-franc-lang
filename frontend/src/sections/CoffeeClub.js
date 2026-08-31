import { Button } from '../components/Button.js';
import { Divider } from '../components/Divider.js';

const featureIcons = ['/assets/icons/group.svg', '/assets/icons/coffee.svg', '/assets/icons/chat.svg', '/assets/icons/globe.svg'];

export function CoffeeClub({ t }) {
  const features = t('coffee.features', { returnObjects: true });
  return `
    <section class="coffee-club" aria-labelledby="coffee-title">
      <div class="container coffee-club__inner">
        <div class="coffee-club__visual">
          <img class="coffee-club__photo" src="/assets/images/coffee-club.png" alt="${t('coffee.photoAlt')}" />
          <div class="coffee-club__signature-block">
            <div class="coffee-club__signature"><img src="/assets/icons/fleur-large.svg" alt="" /><span>English Coffee Club</span></div>
            <span class="coffee-club__signature-line" aria-hidden="true"></span>
          </div>
        </div>
        <div class="coffee-club__content">
          <span class="coffee-club__badge">${t('coffee.badge')}</span>
          <h2 class="coffee-club__heading" id="coffee-title">${t('coffee.headingLine1')}<br />${t('coffee.headingLine2')}</h2>
          <p class="coffee-club__description">${t('coffee.description')}</p>
          ${Divider('coffee-club__divider')}
          <div class="coffee-club__features">
            ${features.map((text, index) => `<div class="coffee-club__feature"><img src="${featureIcons[index]}" alt="" /><p>${text}</p></div>`).join('')}
          </div>
          ${Button({ label: t('coffee.cta'), href: '#contacts', className: 'coffee-club__cta' })}
        </div>
      </div>
    </section>
  `;
}
