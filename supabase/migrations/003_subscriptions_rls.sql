-- 003_subscriptions_rls.sql
-- Row Level Security policies for subscriptions table.
--
-- RLS was enabled in 002_subscriptions.sql but no policies were defined,
-- meaning all access except service_role was denied by default.
-- This migration adds a SELECT policy so authenticated users (mypage)
-- can read their own subscriptions. Webhook/API routes use
-- service_role_key which bypasses RLS entirely.

-- Ensure RLS is enabled (idempotent)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view their own subscriptions.
-- Matches by email (magic link auth) or by user_id (future Supabase Auth link).
CREATE POLICY "Users can view own subscriptions via email"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR user_id = auth.uid()
  );
