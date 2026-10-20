export function normalizeCounterId(value) {
  const text = String(value ?? '').trim();
  const number = Number(text);
  return /^\d+$/.test(text) && Number.isSafeInteger(number) && number > 0 ? number : null;
}

function cleanUrl(value, fallback = '') {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.origin + url.pathname : fallback;
  } catch {
    return fallback;
  }
}

function clearMetrikaStorage(windowRoot, documentRoot) {
  for (const name of ['localStorage', 'sessionStorage']) {
    try {
      const storage = windowRoot[name];
      for (const key of Object.keys(storage)) {
        if (key.startsWith('_ym')) storage.removeItem(key);
      }
    } catch { /* The browser may block storage access. */ }
  }
  try {
    const parts = windowRoot.location.hostname.split('.');
    const domains = ['', windowRoot.location.hostname];
    for (let index = 0; index < parts.length - 1; index++) domains.push('.' + parts.slice(index).join('.'));
    for (const cookie of documentRoot.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!name.startsWith('_ym')) continue;
      for (const domain of domains) {
        documentRoot.cookie = `${name}=; Max-Age=0; Path=/;${domain ? ` Domain=${domain};` : ''}`;
      }
    }
  } catch { /* Third-party cookies cannot be removed by this site. */ }
}

export function createMetrika({ counterId, enabled = false, windowRoot = window, documentRoot = document } = {}) {
  const id = normalizeCounterId(counterId);
  const isEnabled = enabled === true && id !== null;
  let script = null;
  let requested = false;
  let running = false;
  let generation = 0;

  const start = () => {
    if (!isEnabled || requested || running) return;
    requested = true;
    const currentGeneration = ++generation;
    if (typeof windowRoot.ym !== 'function') {
      windowRoot.ym = function (...args) { (windowRoot.ym.a ??= []).push(args); };
      windowRoot.ym.l = Date.now();
    }
    script = documentRoot.createElement('script');
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js';
    script.dataset.metrikaLoader = String(id);
    script.onload = () => {
      if (!requested || currentGeneration !== generation) return;
      windowRoot.ym(id, 'init', {
        defer: true,
        webvisor: false,
        clickmap: false,
        trackLinks: false,
        accurateTrackBounce: false,
      });
      running = true;
      windowRoot.ym(id, 'hit', cleanUrl(windowRoot.location.href), {
        referer: cleanUrl(documentRoot.referrer),
      });
    };
    script.onerror = () => {
      if (currentGeneration !== generation) return;
      requested = false;
      script?.remove();
      script = null;
    };
    documentRoot.head.append(script);
  };

  const stop = () => {
    generation++;
    requested = false;
    if (running && typeof windowRoot.ym === 'function') {
      try { windowRoot.ym(id, 'destruct'); } catch { /* Analytics must not break the site. */ }
    }
    running = false;
    script?.remove();
    script = null;
    clearMetrikaStorage(windowRoot, documentRoot);
  };

  return { counterId: id, enabled: isEnabled, start, stop };
}
