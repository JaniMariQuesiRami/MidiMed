export type AnalyticsEvent =
  | 'Visited Landing Page'
  | 'Visited Pricing Page'
  | 'Visited Contact Page'
  | 'Visited Registration Page'
  | 'Created Account'
  | 'Created Patient'
  | 'Created Appointment';

export type AnalyticsEventProps = {
  userId?: string;
  tenantId?: string;
  [key: string]: unknown;
};
