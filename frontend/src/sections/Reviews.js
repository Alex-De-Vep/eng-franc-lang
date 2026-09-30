import { SectionHeading } from '../components/SectionHeading.js';
import { ContactBlock } from '../components/ContactBlock.js';
import { Divider } from '../components/Divider.js';

function ReviewCard(review, index, t) {
  return `
    <div class="reviews__slide swiper-slide">
      <article class="review-card">
        <div class="review-card__header">
          <img class="review-card__avatar" src="${review.avatar}" alt="${t('reviews.avatarAlt')}" />
          <div class="review-card__meta">
            <h3 class="review-card__name">${review.name}</h3>
            <p class="review-card__occupation">${review.occupation}</p>
            <p class="review-card__age">${review.age}</p>
            <p class="review-card__city">${review.city}</p>
            <img class="review-card__stars" src="/assets/icons/stars.svg" alt="${t('reviews.starsAlt')}" />
          </div>
        </div>
        <p class="review-card__text">${review.text}</p>
        <button class="review-card__more" type="button" data-review-index="${index}">${t('reviews.readMore')} <img src="/assets/icons/arrow-right.svg" alt="" /></button>
      </article>
    </div>
  `;
}

export function Reviews({ t, content }) {
  return `
    <section class="reviews" id="reviews" aria-labelledby="reviews-title">
      <div class="reviews__inner">
        <div class="reviews__header">
          ${SectionHeading(t('reviews.heading'), 'reviews__heading')}
          <div class="reviews__controls" aria-label="${t('reviews.controls')}">
            <button class="reviews__button reviews__button--prev" type="button" aria-label="${t('reviews.previous')}" disabled>
              <img src="/assets/icons/arrow-right.svg" alt="" />
            </button>
            <button class="reviews__button reviews__button--next" type="button" aria-label="${t('reviews.next')}">
              <img src="/assets/icons/arrow-right.svg" alt="" />
            </button>
          </div>
        </div>
        <div class="reviews__viewport swiper" aria-label="${t('reviews.viewport')}">
          <div class="reviews__track swiper-wrapper">${content.reviews.map((review, index) => ReviewCard(review, index, t)).join('')}</div>
        </div>
      </div>
      <dialog class="review-modal" aria-labelledby="review-modal-name">
        <div class="review-modal__shell">
          <button class="review-modal__close" type="button" aria-label="${t('reviews.close')}">
            <img src="/assets/icons/review-modal-close-line.svg" alt="" />
            <img src="/assets/icons/review-modal-close-line.svg" alt="" />
          </button>
          <section class="review-modal__view review-modal__view--review">
            <header class="review-modal__header">
              <img class="review-modal__avatar" src="" alt="" />
              <div class="review-modal__meta">
                <h2 class="review-modal__name" id="review-modal-name"></h2>
                <p class="review-modal__occupation"></p>
                <p class="review-modal__age"></p>
                <p class="review-modal__city"></p>
                <img class="review-modal__stars" src="/assets/icons/stars.svg" alt="${t('reviews.starsAlt')}" />
              </div>
            </header>
            ${Divider('review-modal__divider')}
            <div class="review-modal__text"></div>
            <footer class="review-modal__footer">
              <button class="review-modal__back" type="button"><img src="/assets/icons/arrow-right.svg" alt="" />${t('reviews.back')}</button>
              <button class="button button--primary review-modal__cta" type="button">${t('common.trial')}</button>
            </footer>
          </section>
          <section class="review-modal__view review-modal__view--contact" hidden>
            ${ContactBlock({ idPrefix: 'modal', className: 'contacts--modal', t, content })}
          </section>
        </div>
      </dialog>
    </section>
  `;
}
