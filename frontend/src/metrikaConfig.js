// Activation confirmed by the owner. The consent controller must still wait
// for each visitor's separate permission before loading the counter.
export const metrikaConfig = Object.freeze({
  counterId: 113677290,
  enabled: true,
});

export function getMetrikaConfig(env = {}) {
  return {
    counterId: env.VITE_YANDEX_METRIKA_ID ?? metrikaConfig.counterId,
    enabled: env.VITE_YANDEX_METRIKA_ENABLED === undefined
      ? metrikaConfig.enabled
      : env.VITE_YANDEX_METRIKA_ENABLED === 'true',
  };
}
