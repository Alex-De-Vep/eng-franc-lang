import { createMyTracker } from './myTracker.js';
import { getMyTrackerConfig } from './myTrackerConfig.js';

export function createSiteAnalytics(env = {}, context = {}) {
  const providers = [
    createMyTracker({ ...getMyTrackerConfig(env), ...context }),
  ];
  return {
    // Keep the provider signature distinct from the previous two-counter setup
    // so changing the configured collection requests a fresh choice.
    counterId: JSON.stringify(providers.map(({ counterId, enabled }) => ({ counterId, enabled }))),
    enabled: providers.some(provider => provider.enabled),
    start() { providers.forEach(provider => provider.start()); },
    stop() {
      const results = providers.map(provider => provider.stop());
      return results.some(result => result === true);
    },
  };
}
