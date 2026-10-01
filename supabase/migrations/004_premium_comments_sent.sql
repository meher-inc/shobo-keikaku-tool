-- Actual delivery of review comments, separate from the purchase receipt email.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS premium_comments_sent_at timestamptz;

COMMENT ON COLUMN public.orders.premium_comments_sent_at IS
  'First actual delivery time of premium review comments; null keeps the purchase + 14 day deadline.';

-- Called by the operator CLI after sending comments. Row locking makes retries
-- idempotent and prevents a resend or concurrent command from moving the deadline.
CREATE OR REPLACE FUNCTION public.record_premium_comments_sent(
  p_order_id uuid,
  p_sent_at timestamptz
) RETURNS timestamptz
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  target public.orders%ROWTYPE;
BEGIN
  SELECT * INTO target FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION '注文が見つかりません';
  END IF;
  IF target.status IS DISTINCT FROM 'paid' OR target.plan_id IS DISTINCT FROM 'premium' THEN
    RAISE EXCEPTION '決済済みのプレミアム注文のみ記録できます';
  END IF;
  IF target.paid_at IS NULL THEN
    RAISE EXCEPTION '購入日時が未記録です。決済記録を確認してください';
  END IF;
  IF p_sent_at IS NULL OR NOT isfinite(p_sent_at)
     OR p_sent_at < target.paid_at OR p_sent_at > statement_timestamp() THEN
    RAISE EXCEPTION '送付日時は購入日時以降かつ現在以前を指定してください';
  END IF;
  IF target.premium_comments_sent_at IS NOT NULL THEN
    IF target.premium_comments_sent_at = p_sent_at THEN
      RETURN target.premium_comments_sent_at;
    END IF;
    RAISE EXCEPTION '送付日時は記録済みです。再送による上書きはできません';
  END IF;

  UPDATE public.orders SET premium_comments_sent_at = p_sent_at WHERE id = p_order_id;
  RETURN p_sent_at;
END;
$$;

REVOKE ALL ON FUNCTION public.record_premium_comments_sent(uuid, timestamptz)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_premium_comments_sent(uuid, timestamptz)
  TO service_role;
