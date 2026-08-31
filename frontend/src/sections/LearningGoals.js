import { SectionHeading } from '../components/SectionHeading.js';
export function LearningGoals({ t, content }) {
  return `
    <section class="learning-goals" id="goals" aria-labelledby="goals-title">
      <div class="container learning-goals__inner">
        ${SectionHeading(t('learningGoals.heading'), 'learning-goals__heading')}
        <div class="learning-goals__layout">
          <div class="learning-goals__tabs" role="tablist" aria-label="${t('learningGoals.tabsLabel')}" aria-orientation="vertical">
            ${content.learningGoals.map((goal, index) => `
              <button
                class="learning-goals__tab ${index === 0 ? 'learning-goals__tab--active' : ''}"
                id="learning-goal-tab-${index}"
                type="button"
                role="tab"
                aria-selected="${index === 0}"
                aria-controls="learning-goal-panel-${index}"
                tabindex="${index === 0 ? '0' : '-1'}"
              >
                <span class="learning-goals__tab-icon" style="--learning-goal-icon: url('${goal.icon}')" aria-hidden="true"></span>
                <span>${goal.title}</span>
              </button>
            `).join('')}
          </div>
          <div class="learning-goals__media">
            ${content.learningGoals.map((goal, goalIndex) => `
              <div class="learning-goals__media-panel swiper" data-learning-goal-media="${goalIndex}" ${goalIndex === 0 ? '' : 'hidden'}>
                <div class="learning-goals__slides swiper-wrapper">
                  ${goal.images.map((image, imageIndex) => `
                    <div class="learning-goals__slide swiper-slide">
                      <img src="${image}" alt="${t('learningGoals.imageAlt', { goal: goal.title, index: imageIndex + 1 })}" loading="lazy" decoding="async" />
                    </div>
                  `).join('')}
                </div>
                <button class="learning-goals__arrow learning-goals__arrow--prev" type="button" aria-label="${t('learningGoals.previousImage', { goal: goal.title })}">
                  <img src="/assets/icons/arrow-right.svg" alt="" />
                </button>
                <button class="learning-goals__arrow learning-goals__arrow--next" type="button" aria-label="${t('learningGoals.nextImage', { goal: goal.title })}">
                  <img src="/assets/icons/arrow-right.svg" alt="" />
                </button>
                <div class="learning-goals__pagination" aria-label="${t('learningGoals.pagination')}"></div>
              </div>
            `).join('')}
          </div>
          <div class="learning-goals__copy">
            ${content.learningGoals.map((goal, index) => `
              <div
                class="learning-goals__panel"
                id="learning-goal-panel-${index}"
                role="tabpanel"
                aria-labelledby="learning-goal-tab-${index}"
                ${index === 0 ? '' : 'hidden'}
              >
                <h3>${goal.title}</h3>
                <ul>${goal.points.map((point) => `<li>${point}</li>`).join('')}</ul>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>
  `;
}
