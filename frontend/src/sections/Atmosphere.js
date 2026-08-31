import { SectionHeading } from '../components/SectionHeading.js';
export function Atmosphere({ t, content }) {
  return `
    <section class="atmosphere" aria-labelledby="atmosphere-title">
      <div class="container atmosphere__inner">
        ${SectionHeading(t('atmosphere.heading'), 'atmosphere__heading')}
        <img class="atmosphere__watermark" src="/assets/icons/atmosphere-watermark.svg" alt="" />
        <div class="atmosphere__grid">
          ${content.atmosphereTiles.map((tile) => `
            <div class="atmosphere__tile ${tile.className}">
              ${tile.qr
                ? `<img class="atmosphere__qr" src="/assets/images/qr-placeholder.png" alt="${t('atmosphere.qrAlt')}" />`
                : `<img class="atmosphere__photo" src="${tile.image}" alt="${tile.alt}" loading="lazy" decoding="async" />`}
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    <div class="atmosphere-spacer" aria-hidden="true"></div>
  `;
}
