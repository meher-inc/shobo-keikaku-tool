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
  --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.payment_succeeded,invoice.payment_failed
```

表示される `whsec_...` を `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定し、
dev サーバーを再起動。

## 2. Next.js dev サーバー起動

```bash
npm run dev
```

## 3. curl テストコマンド

### ミニマム月額

```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H 'Content-Type: application/json' \
  -d '{
    "planId": "minimum",
    "billingCycle": "monthly",
    "customerEmail": "test@example.com",
    "formData": {
      "building_name": "テストビル",
      "prefecture": "東京都"
    }
  }'
```

### スタンダード年額

```bash
curl -X POST http://localhost:3000/api/subscribe \
  -H 'Content-Type: application/json' \
  -d '{
    "planId": "standard",
    "billingCycle": "yearly",
    "customerEmail": "test@example.com",
    "formData": {
      "building_name": "テストビル",
      "prefecture": "東京都"
    }
  }'
```

返ってきた JSON の `url` をブラウザで開き、テストカード `4242 4242 4242 4242` で決済。

## 4. テストシナリオ

### シナリオ 1: 新規契約フロー

1. 上記 curl でチェックアウト URL を取得
2. ブラウザで URL にアクセスし、テストカード `4242 4242 4242 4242` で決済
3. 期待される Webhook イベント順序:
   - `checkout.session.completed` → 200（pending 行に stripe_subscription_id, stripe_customer_id を紐付け）
   - `customer.subscription.created` → 200（upsert で status=active に更新）
   - `invoice.payment_succeeded` → 200（subscription を retrieve して upsert）
4. **確認**: Supabase `subscriptions` テーブルに行が存在:
   - `status = 'active'`
   - `plan_id = 'minimum'` or `'standard'`
   - `billing_cycle = 'monthly'` or `'yearly'`
   - `customer_email` が入っている
   - `current_period_start / current_period_end` が入っている
   - `current_period_end` が 1 ヶ月先（月額）or 1 年先（年額）

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

### シナリオ 4: 決済失敗テスト

1. テストカード `4000 0000 0000 9995`（残高不足）で新規契約:
   ```bash
   curl -X POST http://localhost:3000/api/subscribe \
     -H 'Content-Type: application/json' \
     -d '{
       "planId": "minimum",
       "billingCycle": "monthly",
       "customerEmail": "fail-test@example.com",
       "formData": {"building_name": "テスト"}
     }'
   ```
2. ブラウザで返された URL にアクセスし、カード `4000 0000 0000 9995` で試行
3. `invoice.payment_failed` が流れる
4. **確認**: 顧客にカード失敗メール送信、SHUN に管理通知メール送信
5. **確認**: Supabase の `status` が `past_due` になっている

### シナリオ 5: 月額 → 年額アップグレード

1. Customer Portal で「プラン変更」を選択
2. 年額に切り替え
3. `customer.subscription.updated` が流れる
4. **確認**:
   - `billing_cycle = 'yearly'`
   - `stripe_price_id` が年額の price_id に更新
   - `plan_id` は変更なし（同一プランの billing cycle 変更のみ）

### シナリオ 6: LINE事前登録者向けクーポン（初月無料）

1. `/api/subscribe` にクーポン付きで POST（既存エンドポイント）:
   ```bash
   curl -X POST http://localhost:3000/api/subscribe \
     -H 'Content-Type: application/json' \
     -d '{"planId":"minimum","billingCycle":"monthly","customerEmail":"test@example.com","coupon":"LINE_WAITLIST_FIRST_MONTH_FREE"}'
   ```
2. 返された URL で Stripe Checkout を開き、テストカード `4242 4242 4242 4242` で決済
3. **確認**: Checkout 画面で初月が ¥0 と表示される
4. **確認**: `customer.subscription.created` が流れ、Supabase にレコード作成

### シナリオ 7: 冪等性テスト

```bash
# 最近の events 確認
stripe events list --limit 10

# 特定 event の再送
stripe events resend evt_xxxxxxxxxxxx
```

同じイベントを2回送っても、Supabase の行が重複せず upsert されることを確認。

## 5. 本番デプロイ前チェックリスト

- [ ] Vercel に `STRIPE_PRICE_*` 4 環境変数が設定されている
- [ ] Stripe Dashboard の Webhook に 6 イベントが追加されている
- [ ] Customer Portal が有効化されている
- [ ] Supabase `subscriptions` テーブルの RLS ポリシーが正しい
- [ ] テスト環境でシナリオ 1-7 が全て green
