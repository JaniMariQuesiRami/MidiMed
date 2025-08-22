// Tipos completos para la integración con Recurrente API

export type Currency = "GTQ" | "USD";

export type RecurrenteCheckoutStatus =
  | "paid"
  | "pending"
  | "expired"
  | "canceled"
  | "failed";

export type RecurrentePaymentMethod = {
  id: string;
  type: "card" | "bank_transfer" | "other";
  card?: {
    last4: string;
    network: "visa" | "mastercard" | "other";
  };
};

export type RecurrentePayment = {
  id: string;
  paymentable: {
    type: "Subscription" | "OneTime";
    id: string;
    tax_name?: string;
    tax_id?: string;
  };
};

export type RecurrenteCheckout = {
  id: string;
  status: RecurrenteCheckoutStatus;
  payment: RecurrentePayment;
  payment_method: RecurrentePaymentMethod;
  transfer_setups: unknown[];
  metadata: Record<string, string>;
  expires_at: string; // ISO
  success_url: string;
  cancel_url: string;
  created_at: string; // ISO
  total_in_cents: string; // Recurrente devuelve como string
  currency: Currency;
};

// Metadata que enviamos al crear el link (vuelve en el webhook)
export type RecurrenteMetadata = {
  tenantId: string;
  invoiceId: string;
  product: string; // TenantPlanType como string
  periodStart: string; // ISO
  periodEnd: string; // ISO
};

// Tipos para productos y precios de Recurrente
export type RecurrentePrice = {
  id: string;
  amount_in_cents: number;
  currency: string;
  billing_interval_count: number;
  billing_interval: string;
  charge_type: string;
  periods_before_automatic_cancellation?: number | null;
  free_trial_interval_count: number;
  free_trial_interval: string;
};

export type RecurrenteProduct = {
  id: string;
  status: string;
  name: string;
  description: string;
  success_url: string;
  cancel_url: string;
  custom_terms_and_conditions: string;
  phone_requirement: string;
  address_requirement: string;
  billing_info_requirement: string;
  prices: RecurrentePrice[];
  storefront_link: string;
  metadata: Record<string, unknown>;
};

// Tipos para suscripciones de Recurrente
export type SubscriptionStatus =
  | "active"
  | "paused"
  | "canceled"
  | "past_due"
  | "incomplete";

export type RecurrenteSubscription = {
  id: string;
  status: SubscriptionStatus;
  customer_id: string;
  product_id: string;
  price_id: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string | null;
  paused_at?: string | null;
  created_at: string;
  updated_at: string;
};

// Tipos para operaciones de suscripción
export type SubscriptionAction = "get_status" | "cancel" | "pause" | "resume";

export type ManageSubscriptionRequest = {
  tenantId: string;
  action: SubscriptionAction;
  reason?: string; // Para cancelaciones/pausas
};

export type ManageSubscriptionResponse = {
  success: boolean;
  subscription?: RecurrenteSubscription;
  message?: string;
  error?: string;
};
