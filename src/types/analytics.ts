export type AnalyticsEvent =
  | 'Visited Landing Page'
  | 'Visited Pricing Page'
  | 'Visited Contact Page'
  | 'Visited Registration Page'
  | 'Created Account'
  | 'Created Patient'
  | 'Created Appointment'
  | 'Clicked Hero Signup'
  | 'Clicked Hero Secondary CTA'
  | 'Payment Success Page Visited'
  | 'Payment Success - Go to Dashboard'
  | 'Payment Failed Page Visited'
  | 'Payment Failed - Retry Payment'
  | 'Payment Failed - Go to Settings'
  | 'Payment Cancelled Page Visited'
  | 'Payment Cancelled - Retry Payment'
  | 'Payment Cancelled - Go to Settings';

export type AnalyticsEventProps = {
  userId?: string;
  tenantId?: string;
  [key: string]: unknown;
};
