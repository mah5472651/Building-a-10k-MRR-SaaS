export type ClientStatus = "link_sent" | "in_progress" | "completed";
export type ClientStep = "details" | "agreement" | "deposit" | "kickoff";
export type Plan = "starter" | "growth" | "scale";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete";

export type IntakeQuestion = {
  id: string;
  label: string;
  type?: "text" | "textarea" | "select";
  options?: string[];
  conditional_on?: {
    question_id: string;
    equals: string;
  } | null;
};

export type PaymentMilestone = {
  id: string;
  label: string;
  amount: number;
  due: "onboarding" | "midpoint" | "final";
};

export type Agency = {
  id: string;
  name: string;
  email: string;
  logo_url: string | null;
  brand_color: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  outbound_webhook_url: string | null;
  alert_rules: AlertRule[] | null;
  created_at: string;
};

export type AlertRule = {
  id: string;
  name: string;
  stage: "details" | "agreement" | "deposit" | "kickoff";
  threshold_hours: number;
  enabled: boolean;
};

export type OnboardingFlow = {
  id: string;
  agency_id: string;
  title: string;
  questions: IntakeQuestion[];
  contract_text: string;
  deposit_amount: number;
  payment_schedule: PaymentMilestone[];
  reassurance: {
    details?: string;
    agreement?: string;
    deposit?: string;
    kickoff?: string;
  } | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Client = {
  id: string;
  agency_id: string;
  flow_id: string;
  unique_link_token: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  answers: Record<string, string>;
  signed_at: string | null;
  signature_name: string | null;
  signature_ip: string | null;
  signature_user_agent: string | null;
  contract_snapshot: string | null;
  paid_at: string | null;
  stripe_payment_intent_id: string | null;
  amount_paid: number | null;
  scheduled_at: string | null;
  meeting_time: string | null;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
  last_active_at: string | null;
  reminder_24h_sent_at: string | null;
  reminder_3d_sent_at: string | null;
};

export type AvailableSlot = {
  id: string;
  agency_id: string;
  datetime: string;
  is_booked: boolean;
  client_id: string | null;
  created_at: string;
};

export type ClientBundle = {
  agency: Agency;
  flow: OnboardingFlow;
  client: Client;
  slots: AvailableSlot[];
  files: ClientFile[];
  averageCompletionMinutes: number;
  openSlotsThisWeek: number;
};

export type ClientFile = {
  id: string;
  agency_id: string;
  client_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
};

export type NotificationEvent = {
  id: string;
  agency_id: string;
  client_id: string | null;
  event: string;
  sent_at: string | null;
  created_at: string;
  client?: Pick<Client, "name" | "email"> | null;
};

export type PaymentEvent = {
  id: string;
  agency_id: string;
  client_id: string | null;
  kind: "deposit" | "subscription";
  status: "failed" | "declined" | "recovered" | "open";
  amount: number | null;
  provider_event_id: string | null;
  failure_reason: string | null;
  created_at: string;
  client?: Pick<Client, "name" | "email"> | null;
};
