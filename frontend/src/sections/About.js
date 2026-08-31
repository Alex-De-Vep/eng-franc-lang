import { SectionHeading } from '../components/SectionHeading.js';
import { Divider } from '../components/Divider.js';
export function About({ content }) {
  const { about } = content;

  return `
    <section class="about" id="about" aria-labelledby="about-title">
      <div class="container about__inner">
        ${SectionHeading(about.heading, 'about__heading')}
        <div class="about__cards">
          <article class="about-card about-card--intro">
            <div class="about-card__portrait"><img src="/assets/icons/person.svg" alt="${about.portraitAlt}" /></div>
            <div class="about-card__intro-copy">
              <h3 class="about-card__title">${about.introCardTitle}</h3>
              <div class="about-card__ornament about-card__ornament--short"></div>
              <p>${about.introTitle}</p>
              <p>${about.introText}</p>
            </div>
            <div class="about-card__facts">${about.facts.map((fact) => `<p>${fact}</p>`).join('')}</div>
          </article>
          <article class="about-card about-card--education">
            <img class="about-card__icon" src="/assets/icons/education.svg" alt="${about.educationIconAlt}" />
            <h3 class="about-card__title">${about.educationCardTitle}</h3>
            ${Divider('about-card__divider')}
            <ul class="about-card__list">${about.education.map((item) => `<li>${item}</li>`).join('')}</ul>
          </article>
          <article class="about-card about-card--experience">
            <img class="about-card__icon" src="/assets/icons/experience.svg" alt="${about.experienceIconAlt}" />
            <h3 class="about-card__title">${about.experienceCardTitle}</h3>
            ${Divider('about-card__divider')}
            <dl class="about-card__stats">
              <div><dt>9+</dt><dd>${about.stats[0]}</dd></div>
              <div><dt>5+</dt><dd>${about.stats[1]}</dd></div>
              <div><dt>17+</dt><dd>${about.stats[2]}</dd></div>
            </dl>
          </article>
        </div>
        <div class="about__quote"><span></span><blockquote>${about.quote}</blockquote><span></span></div>
      </div>
    </section>
  `;
}
