export function Hero({ content }) {
    const { hero } = content;

    return `
    <section class="hero" id="home" aria-labelledby="hero-title">
      <div class="container hero__inner">
        <div class="hero__content">
          <img class="hero__monogram" src="/assets/images/logo-transparent.png" alt="" aria-hidden="true" />
          <h1 class="hero__title" id="hero-title">${hero.titleStart} <span>&amp;</span> ${hero.titleEnd}</h1>
          <p class="hero__subtitle">${hero.subtitle}</p>
          <ol class="hero__benefits">
            ${hero.benefits.map((benefit) => `<li class="hero__benefit">${benefit}</li>`).join('')}
          </ol>
        </div>
      </div>
    </section>
  `;
}
