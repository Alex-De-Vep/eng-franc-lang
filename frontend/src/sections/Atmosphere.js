import { SectionHeading } from '../components/SectionHeading.js';
export function Atmosphere({ t, content }) {
  return `
    <section class="atmosphere" aria-labelledby="atmosphere-title">
      <div class="container atmosphere__inner">
        ${SectionHeading(t('atmosphere.heading'), 'atmosphere__heading')}
        <img class="atmosphere__watermark" src="/assets/icons/atmosphere-watermark.svg" alt="" />
        <div class="atmosphere__grid">
          ${content.atmosphereTiles.map((tile) => tile.qr
            ? `<a class="atmosphere__tile atmosphere__qr-link ${tile.className}" href="${tile.qr.url}" target="_blank" rel="noopener noreferrer" aria-label="${tile.qr.alt}">
                <img class="atmosphere__qr" src="${tile.qr.image}" width="176" height="176" alt="${tile.qr.alt}" loading="lazy" decoding="async" />
              </a>`
            : `<button class="atmosphere__tile atmosphere__photo-button ${tile.className}" type="button" aria-haspopup="dialog" aria-label="${t('atmosphere.openPhoto', { description: tile.alt })}">
                <img
                  class="atmosphere__photo"
                  src="${tile.image.src}"
                  srcset="${tile.image.srcSet}"
                  sizes="(max-width: 767px) 50vw, 320px"
                  data-full-src="${tile.image.fullSrc}"
                  width="${tile.image.width}"
                  height="${tile.image.height}"
                  alt="${tile.alt}"
                  loading="lazy"
                  decoding="async"
                />
              </button>`).join('')}
        </div>
      </div>
    </section>
    <div class="atmosphere-spacer" aria-hidden="true"></div>
    <dialog class="atmosphere-modal" aria-label="${t('atmosphere.dialogLabel')}">
      <div class="atmosphere-modal__shell">
        <button class="atmosphere-modal__close" type="button" aria-label="${t('atmosphere.closePhoto')}">
          <img src="/assets/icons/review-modal-close-line.svg" alt="" />
          <img src="/assets/icons/review-modal-close-line.svg" alt="" />
        </button>
        <img class="atmosphere-modal__image" alt="" decoding="async" />
      </div>
    </dialog>
  `;
}
