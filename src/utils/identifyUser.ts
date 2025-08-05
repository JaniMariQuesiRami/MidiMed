import posthog from './posthogClient';

export const identifyUser = (userId: string, tenantId: string): void => {
  try {
    if (typeof window !== 'undefined' && posthog?.identify) {
      posthog.identify(userId, {
        tenantId,
      });
    }
  } catch (err) {
    console.error('Failed to identify user', err);
  }
};
