import posthog from './posthogClient';
import { AnalyticsEvent, AnalyticsEventProps } from '@/types/analytics';

export const trackEvent = (
  event: AnalyticsEvent,
  properties: AnalyticsEventProps = {},
): void => {
  try {
    if (typeof window !== 'undefined' && posthog?.capture) {
      posthog.capture(event, properties);
    }
  } catch (err) {
    console.error('Failed to track event', err);
  }
};
