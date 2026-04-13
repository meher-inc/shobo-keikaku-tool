-- 002_subscriptions.sql
-- Subscription records synced from Stripe webhooks.

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  stripe_subscription_id text unique not null,
  stripe_customer_id text not null,
  stripe_price_id text,
  customer_email text not null,
  plan_id text not null,
  billing_cycle text not null,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  canceled_at timestamptz,
  initial_form_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_subscriptions_email on subscriptions(customer_email);
create index if not exists idx_subscriptions_status on subscriptions(status);
create index if not exists idx_subscriptions_stripe_sub_id on subscriptions(stripe_subscription_id);

alter table subscriptions enable row level security;
