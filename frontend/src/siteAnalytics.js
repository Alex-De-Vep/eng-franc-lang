import { createMetrika } from './analytics.js';
import { getMetrikaConfig } from './metrikaConfig.js';
import { createMyTracker } from './myTracker.js';
import { getMyTrackerConfig } from './myTrackerConfig.js';

export function createSiteAnalytics(env = {}, context = {}) {
  const providers = [
    createMetrika({ ...getMetrikaConfig(env), ...context }),
    createMyTracker({ ...getMyTrackerConfig(env), ...context }),
  ];
  return {
    // The saved choice is bound to BOTH providers, including their enable flags.
    // Adding/replacing/enabling one must not reuse consent for the other.
    counterId: JSON.stringify(providers.map(({ counterId, enabled }) => ({ counterId, enabled }))),
    enabled: providers.some(provider => provider.enabled),
    start() { providers.forEach(provider => provider.start()); },
    stop() {
      const results = providers.map(provider => provider.stop());
      return results.some(result => result === true);
    },
  };
}
