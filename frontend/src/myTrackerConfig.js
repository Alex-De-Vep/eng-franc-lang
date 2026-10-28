// RU and COM snippets use the same counter. COM is an alternative CDN,
// not a restriction on the website's domain. Never install both snippets.
export const myTrackerConfig = Object.freeze({ counterId: 3808064, enabled: true });

export function getMyTrackerConfig(env = {}) {
  return {
    counterId: env.VITE_MYTRACKER_ID ?? myTrackerConfig.counterId,
    enabled: env.VITE_MYTRACKER_ENABLED === undefined
      ? myTrackerConfig.enabled
      : env.VITE_MYTRACKER_ENABLED === 'true',
  };
}
