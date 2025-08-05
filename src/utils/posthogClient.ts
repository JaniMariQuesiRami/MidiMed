import posthog from 'posthog-js';

export const initPosthog = (): void => {
  try {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: 'https://app.posthog.com',
        autocapture: true,
        loaded: () => {
          console.log('✅ PostHog loaded');
        },
      });
    }
  } catch (err) {
    console.error('Failed to initialize PostHog', err);
  }
};

export default posthog;
