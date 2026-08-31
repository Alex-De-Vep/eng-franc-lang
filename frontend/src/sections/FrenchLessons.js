import { Button } from '../components/Button.js';
import { Divider } from '../components/Divider.js';

export function FrenchLessons({ t }) {
  const benefits = t('frenchLessons.benefits', { returnObjects: true });
  return `
    <section class="french-lessons" aria-labelledby="french-title">
      <div class="container french-lessons__content-container">
        <div class="french-lessons__content">
          <h2 class="french-lessons__heading" id="french-title">${t('frenchLessons.headingLine1')}<br />${t('frenchLessons.headingLine2')}</h2>
          ${Divider('french-lessons__divider')}
          <p class="french-lessons__benefit"><img src="/assets/icons/french-coffee.svg" alt="" />${benefits[0]}</p>
          <p class="french-lessons__benefit"><img class="french-lessons__croissant" src="/assets/icons/croissant.svg" alt="" />${benefits[1]}</p>
          ${Button({ label: t('common.trial'), href: '#contacts', className: 'french-lessons__cta' })}
        </div>
      </div>
    </section>
  `;
}
