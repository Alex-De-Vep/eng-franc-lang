import { ContactBlock } from '../components/ContactBlock.js';
import { Divider } from '../components/Divider.js';
export function FaqContact({ t, content }) {
  return `
    ${Divider('page-divider')}
    <section class="faq-contact" aria-label="${t('faq.sectionLabel')}">
      <div class="container faq-contact__inner">
        <div class="faq" id="faq">
          <h2 class="faq__heading">${t('faq.heading')}</h2>
          <div class="faq__list">
            ${content.faq.map((item, index) => `
              <article class="faq__item">
                <h3>
                  <button class="faq__trigger" type="button" aria-expanded="false" aria-controls="faq-answer-${index}">
                    <span>${item.question}</span>
                    <span class="faq__plus" aria-hidden="true"><img src="/assets/icons/plus-horizontal.svg" alt="" /><img src="/assets/icons/plus-vertical.svg" alt="" /></span>
                  </button>
                </h3>
                <div class="faq__answer" id="faq-answer-${index}" aria-hidden="true">
                  <div class="faq__answer-inner"><div class="faq__answer-content">${item.answer}</div></div>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
        ${ContactBlock({ idPrefix: 'page', id: 'contacts', t, content })}
      </div>
    </section>
  `;
}
