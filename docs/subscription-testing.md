# サブスクリプション ローカルテスト手順

plan.todokede.jp のサブスクリプション機能（Stripe Subscription + Supabase）を
ローカルで動作確認する手順。

## 前提

- `.env.local` に以下が設定済みであること:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`（後述の `stripe listen` 出力値に差し替える）
  - `STRIPE_PRICE_MINIMUM_MONTHLY`, `STRIPE_PRICE_MINIMUM_YEARLY`
  - `STRIPE_PRICE_STANDARD_MONTHLY`, `STRIPE_PRICE_STANDARD_YEARLY`
  - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_APP_URL` (ローカルでは `http://localhost:3000`)
- [Stripe CLI](https://docs.stripe.com/stripe-cli) インストール済み
- Supabase に `subscriptions` テーブル作成済み

## 1. Stripe CLI セットアップ

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhook/stripe \
  --events customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed,checkout.session.completed
```

表示される `whsec_...` を `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定し、
dev サーバーを再起動。

## 2. Next.js dev サーバー起動

```bash
npm run dev
```

## 3. テストシナリオ

### シナリオ 1: スタンダード月額で新規契約

1. `/pricing` にアクセス、スタンダード月額を選択
2. フォーム入力 → `/api/subscribe` を叩いて Stripe Checkout へ
3. テストカード `4242 4242 4242 4242` で決済
4. `stripe listen` のターミナルに `customer.subscription.created` が流れる
5. **確認**: Supabase `subscriptions` テーブルに新規行:
   - `status = 'active'`
   - `plan_id = 'standard'`
   - `billing_cycle = 'monthly'`
   - `customer_email` が入っている
   - `current_period_start / current_period_end` が入っている

### シナリオ 2: Customer Portal で解約予約

1. `/account` からメールアドレスを入力 → portal リンク取得
2. Customer Portal で「解約」を選択
3. `customer.subscription.updated` が流れる
4. **確認**: `cancel_at_period_end = true`

### シナリオ 3: テスト時計で 1 ヶ月進める

```bash
stripe test-clocks create --name "subscription-test"
# test clock ID を使ってサブスク作成後:
stripe test-clocks advance <test_clock_id> --frozen-time <1ヶ月後のUnixタイムスタンプ>
```

5. `invoice.payment_succeeded` が流れる
6. **確認**: `current_period_end` が更新される

### シナリオ 4: カード失敗テスト

1. テストカード `4000 0000 0000 0341` で新規契約
2. 初回決済は成功するが、更新時に失敗する
3. `invoice.payment_failed` が流れる
4. **確認**: 顧客にカード失敗メール送信、SHUN に管理通知メール送信

### シナリオ 5: 月額 → 年額アップグレード

1. Customer Portal で「プラン変更」を選択
2. 年額に切り替え
3. `customer.subscription.updated` が流れる
4. **確認**:
   - `billing_cycle = 'yearly'`
   - `stripe_price_id` が年額の price_id に更新
   - `plan_id` は変更なし（同一プランの billing cycle 変更のみ）

## 4. 確認コマンド

```bash
# 最近の events 確認
stripe events list --limit 10

# 特定 event の再送（冪等性テスト）
stripe events resend evt_xxxxxxxxxxxx

# Supabase の行確認
npx supabase db diff  # ローカル DB の場合
```

## 5. 本番デプロイ前チェックリスト

- [ ] Vercel に `STRIPE_PRICE_*` 4 環境変数が設定されている
- [ ] Stripe Dashboard の Webhook に 5 イベントが追加されている
- [ ] Customer Portal が有効化されている
- [ ] Supabase `subscriptions` テーブルの RLS ポリシーが正しい
- [ ] テスト環境でシナリオ 1-5 が全て green
