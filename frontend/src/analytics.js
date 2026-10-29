export function normalizeCounterId(value) {
  const text = String(value ?? '').trim();
  const number = Number(text);
  return /^\d+$/.test(text) && Number.isSafeInteger(number) && number > 0 ? number : null;
}

export function cleanUrl(value, fallback = '') {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.origin + url.pathname : fallback;
  } catch {
    return fallback;
  }
}

export function clearAnalyticsStorage(windowRoot, documentRoot, matches) {
  for (const name of ['localStorage', 'sessionStorage']) {
    try {
      const storage = windowRoot[name];
      for (const key of Object.keys(storage)) {
        if (matches(key)) storage.removeItem(key);
      }
    } catch { /* The browser may block storage access. */ }
  }
  try {
    const parts = windowRoot.location.hostname.split('.');
    const domains = ['', windowRoot.location.hostname];
    for (let index = 0; index < parts.length - 1; index++) domains.push('.' + parts.slice(index).join('.'));
    // Expire both root cookies and cookies scoped to the current locale/page.
    const paths = new Set(['/']);
    let currentPath = '';
    for (const segment of (windowRoot.location.pathname ?? '').split('/').filter(Boolean)) {
      currentPath += '/' + segment;
      paths.add(currentPath);
      paths.add(currentPath + '/');
    }
    for (const cookie of documentRoot.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!matches(name)) continue;
      for (const domain of domains) {
        for (const path of paths) {
          documentRoot.cookie = `${name}=; Max-Age=0; Path=${path};${domain ? ` Domain=${domain};` : ''}`;
        }
      }
    }
  } catch { /* Third-party cookies cannot be removed by this site. */ }
}
