import { Button } from '../components/Button.js';

export function Approach({ content }) {
  const { approach } = content;

  return `
    <section class="approach" id="approach" aria-labelledby="approach-title">
      <div class="container approach__inner">
        <h2 class="section-heading approach__heading" id="approach-title">${approach.heading}</h2>
        <div class="approach__intro">
          <p class="approach__statement">${approach.statement.replace(/([.—])(\s+)/, '$1<br />$2')}</p>
          <p class="approach__description">${approach.description}</p>
        </div>
        <ol class="approach__cards" role="list">
          ${approach.items.map((item, index) => `
            <li class="approach-card approach-card--${index + 1}">
              <div class="approach-card__header">
                <span class="approach-card__number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
                <h3 class="approach-card__title">${item.title}</h3>
              </div>
              <p class="approach-card__text">${item.text}</p>
            </li>
          `).join('')}
        </ol>
        <div class="approach__closing">
          <div class="approach__closing-copy">
            <h3 class="approach__closing-title">${approach.closingTitle}</h3>
            <p>${approach.closingText}</p>
            <p>${approach.invitation}</p>
          </div>
          ${Button({ label: approach.cta, href: '#contacts', className: 'approach__cta' })}
        </div>
      </div>
    </section>
  `;
}
