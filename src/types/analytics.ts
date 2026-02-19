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
  | 'Payment Cancelled - Go to Settings'
  | 'scribe_recording_started'
  | 'scribe_recording_stopped'
  | 'scribe_processing_completed'
  | 'scribe_processing_failed'
  | 'scribe_transcript_viewed'
  | 'scribe_field_edited'
  | 'scribe_fields_cleared'
  | 'scribe_record_saved';

export type AnalyticsEventProps = {
  userId?: string;
  tenantId?: string;
  [key: string]: unknown;
};
