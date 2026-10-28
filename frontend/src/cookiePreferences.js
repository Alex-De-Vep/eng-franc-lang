export const COOKIE_PREFERENCES_KEY = 'site_cookie_preferences';
export const COOKIE_PREFERENCES_VERSION = 3;
export const COOKIE_PREFERENCES_MAX_AGE = 180 * 24 * 60 * 60 * 1000;

function readChoice(storage, counterId, analyticsAvailable, now) {
  try {
    const choice = JSON.parse(storage.getItem(COOKIE_PREFERENCES_KEY));
    if (choice?.version !== COOKIE_PREFERENCES_VERSION || choice.counterId !== counterId
      || choice.analyticsAvailable !== analyticsAvailable
      || typeof choice.analytics !== 'boolean' || !Number.isFinite(choice.savedAt)
      || choice.savedAt > now || now - choice.savedAt >= COOKIE_PREFERENCES_MAX_AGE) return null;
    return choice;
  } catch { return null; }
}

export function initCookieNotice({ root = document, windowRoot = window, analytics, now = () => Date.now(), reload = () => windowRoot.location.reload() } = {}) {
  const notice = root.querySelector('[data-cookie-notice]');
  if (!notice || !analytics) return null;
  let storage;
  try { storage = windowRoot.localStorage; } catch { storage = null; }
  let choice = readChoice(storage, analytics.counterId, analytics.enabled, now());
  let opener = null;
  const closeButton = notice.querySelector('[data-cookie-action="close"]');
  const settingsButtons = [...root.querySelectorAll('[data-cookie-settings]')];

  const applyChoice = () => {
    if (choice?.analytics && analytics.enabled) analytics.start();
    else if (analytics.stop() === true) reload();
    notice.hidden = choice !== null;
    closeButton.hidden = choice === null;
  };
  const hide = () => {
    if (notice.contains(root.activeElement)) root.activeElement.blur();
    notice.hidden = true;
    opener?.focus({ preventScroll: true });
    opener = null;
  };
  const open = event => {
    opener = event.currentTarget;
    notice.hidden = false;
    closeButton.hidden = choice === null;
    notice.querySelector('h2').focus({ preventScroll: true });
  };
  const select = event => {
    const button = event.target.closest('[data-cookie-action]');
    if (!button || !notice.contains(button)) return;
    const action = button.dataset.cookieAction;
    if (action === 'close') {
      if (choice) hide();
      return;
    }
    if (!['accept', 'reject', 'acknowledge'].includes(action)) return;
    choice = {
      version: COOKIE_PREFERENCES_VERSION,
      counterId: analytics.counterId,
      analyticsAvailable: analytics.enabled,
      analytics: action === 'accept' && analytics.enabled,
      savedAt: now(),
    };
    try { storage?.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(choice)); } catch { /* Session-only choice. */ }
    applyChoice();
    hide();
  };
  const sync = event => {
    if (event.key !== COOKIE_PREFERENCES_KEY && event.key !== null) return;
    choice = readChoice(storage, analytics.counterId, analytics.enabled, now());
    applyChoice();
  };
  notice.addEventListener('click', select);
  settingsButtons.forEach(button => button.addEventListener('click', open));
  windowRoot.addEventListener('storage', sync);
  applyChoice();

  return {
    destroy() {
      notice.removeEventListener('click', select);
      settingsButtons.forEach(button => button.removeEventListener('click', open));
      windowRoot.removeEventListener('storage', sync);
      analytics.stop();
    },
  };
}
