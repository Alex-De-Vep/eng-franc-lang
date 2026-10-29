import { canonicalUrl, defaultSeoLocale, seoLocales } from '../src/siteUrls.js';

export function seoLinks(locale, options = {}) {
  return `<link rel="canonical" href="${canonicalUrl(locale, options)}" />
    ${seoLocales.map(code => `<link rel="alternate" hreflang="${code}" href="${canonicalUrl(code, options)}" />`).join('\n    ')}
    <link rel="alternate" hreflang="x-default" href="${canonicalUrl(defaultSeoLocale, options)}" />`;
}

// Only the Russian landing changes its search positioning. Keep the visible
// components and the other locales unchanged, and describe existing services.
export function landingStructuredData(locale, meta, options = {}) {
  if (locale !== 'ru') return '';
  const url = canonicalUrl(locale, options);
  const teacher = { '@id': `${url}#teacher` };
  const english = { '@id': `${url}#english-service` };
  const french = { '@id': `${url}#french-service` };
  const website = { '@id': `${url}#website` };
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person', ...teacher, name: 'Ирина Пуртова',
        jobTitle: 'Преподаватель английского и французского языков',
        url: `${url}#about`,
      },
      {
        '@type': 'WebSite', ...website, url,
        name: 'Ирина Пуртова — английский и французский', inLanguage: 'ru',
        publisher: teacher,
      },
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url,
        name: meta.title, description: meta.description, inLanguage: 'ru',
        isPartOf: website, about: teacher, mainEntity: english, mentions: french,
      },
      {
        '@type': 'Service', ...english, url,
        name: 'Индивидуальные занятия английским онлайн',
        serviceType: 'Обучение английскому языку онлайн', provider: teacher,
      },
      {
        '@type': 'Service', ...french, url: `${url}#french-lessons`,
        name: 'Индивидуальные занятия французским онлайн',
        serviceType: 'Обучение французскому языку онлайн', provider: teacher,
      },
    ],
  };
  const json = JSON.stringify(graph).replaceAll('<', '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}
