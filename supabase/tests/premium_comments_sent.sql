-- Run only in a disposable local database, after applying migration 004.
\set ON_ERROR_STOP on
BEGIN;
DO $$ BEGIN
  IF current_database() <> 'premium_comments_test' THEN
    RAISE EXCEPTION 'Use the disposable premium_comments_test database';
  END IF;
END $$;

INSERT INTO public.orders (id, status, plan_id, paid_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'paid', 'premium', now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000002', 'paid', 'standard', now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000003', 'pending', 'premium', now() - interval '20 days'),
  ('00000000-0000-0000-0000-000000000004', 'paid', 'premium', null),
  ('00000000-0000-0000-0000-000000000005', 'paid', 'premium', now() - interval '20 days');

CREATE FUNCTION pg_temp.expect_failure(order_id uuid, sent_at timestamptz, expected text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  BEGIN
    PERFORM public.record_premium_comments_sent(order_id, sent_at);
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM = expected THEN RETURN; END IF;
    RAISE;
  END;
  RAISE EXCEPTION 'Expected rejection: %', expected;
END $$;

SET LOCAL ROLE service_role;
DO $$
DECLARE
  order_id uuid := '00000000-0000-0000-0000-000000000001';
  sent_at timestamptz := now() - interval '10 days';
  stored timestamptz;
BEGIN
  IF public.record_premium_comments_sent(order_id, sent_at) <> sent_at THEN
    RAISE EXCEPTION 'First delivery was not recorded';
  END IF;
  SELECT premium_comments_sent_at INTO stored FROM public.orders WHERE id = order_id;
  IF stored IS DISTINCT FROM sent_at THEN RAISE EXCEPTION 'Database did not persist the timestamp'; END IF;
  IF public.record_premium_comments_sent(order_id, sent_at) <> sent_at THEN
    RAISE EXCEPTION 'Same-time retry was not idempotent';
  END IF;
END $$;
RESET ROLE;

SELECT pg_temp.expect_failure('00000000-0000-0000-0000-000000000001', now() - interval '9 days', '送付日時は記録済みです。再送による上書きはできません');
SELECT pg_temp.expect_failure('00000000-0000-0000-0000-000000000002', now() - interval '10 days', '決済済みのプレミアム注文のみ記録できます');
SELECT pg_temp.expect_failure('00000000-0000-0000-0000-000000000003', now() - interval '10 days', '決済済みのプレミアム注文のみ記録できます');
SELECT pg_temp.expect_failure('00000000-0000-0000-0000-000000000004', now() - interval '10 days', '購入日時が未記録です。決済記録を確認してください');
SELECT pg_temp.expect_failure('00000000-0000-0000-0000-000000000005', now() + interval '1 day', '送付日時は購入日時以降かつ現在以前を指定してください');
SELECT pg_temp.expect_failure('00000000-0000-0000-0000-000000000005', now() - interval '21 days', '送付日時は購入日時以降かつ現在以前を指定してください');
SELECT pg_temp.expect_failure('00000000-0000-0000-0000-000000000005', null, '送付日時は購入日時以降かつ現在以前を指定してください');
SELECT pg_temp.expect_failure('00000000-0000-0000-0000-000000000005', 'infinity', '送付日時は購入日時以降かつ現在以前を指定してください');
SELECT pg_temp.expect_failure('00000000-0000-0000-0000-000000000006', now() - interval '10 days', '注文が見つかりません');

SET LOCAL ROLE anon;
DO $$ BEGIN
  BEGIN
    PERFORM public.record_premium_comments_sent('00000000-0000-0000-0000-000000000005', now());
  EXCEPTION WHEN insufficient_privilege THEN RETURN;
  END;
  RAISE EXCEPTION 'Anonymous clients must not record delivery';
END $$;
RESET ROLE;
SET LOCAL ROLE authenticated;
DO $$ BEGIN
  BEGIN
    PERFORM public.record_premium_comments_sent('00000000-0000-0000-0000-000000000005', now());
  EXCEPTION WHEN insufficient_privilege THEN RETURN;
  END;
  RAISE EXCEPTION 'Customer accounts must not record delivery';
END $$;
RESET ROLE;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.orders WHERE id = '00000000-0000-0000-0000-000000000005' AND premium_comments_sent_at IS NOT NULL) THEN
    RAISE EXCEPTION 'Rejected calls must not modify the order';
  END IF;
END $$;
ROLLBACK;
