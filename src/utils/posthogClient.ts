import posthog from 'posthog-js';

export const initPosthog = (): void => {
  try {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      // Check if we're on localhost/development
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('.local');
      
      if (isLocalhost) {
        console.log('🚫 PostHog disabled on localhost');
        return; // Don't initialize PostHog on localhost
      }
      
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