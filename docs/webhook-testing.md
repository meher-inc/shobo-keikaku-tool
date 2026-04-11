# Stripe Webhook ローカルテスト手順

plan.todokede.jp の Stripe Webhook エンドポイント (`POST /api/webhook/stripe`) を
ローカルで動作確認する手順。

## 前提

- `.env.local` に以下が設定済みであること:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET` (後述の `stripe listen` が出力する値に差し替える)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL` (ローカルでは `http://localhost:3000`)
  - `RESEND_API_KEY` (premium プランの実メール送信をテストする場合のみ)
- [Stripe CLI](https://docs.stripe.com/stripe-cli) がインストール済み
  - macOS: `brew install stripe/stripe-cli/stripe`

## 1. Stripe CLI にログイン

```bash
stripe login
```

ブラウザで Stripe アカウントにログインして CLI にペアリングする。
初回のみでよい。

## 2. Next.js dev サーバーを起動

別ターミナルで:

```bash
npm run dev
```

`http://localhost:3000` で起動することを確認。

## 3. Stripe Webhook を localhost に転送

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

起動時に下記のような行が表示される:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

この `whsec_...` を `.env.local` の `STRIPE_WEBHOOK_SECRET` に設定して
dev サーバーを再起動する。

> 注意: 本番の Webhook シークレット(Stripe Dashboard で発行)とは別物。
> ローカルテスト中のみ上書きし、本番設定は Vercel 側でのみ管理する。

## 4. テストイベントを送る

### パターン A: テストフォームからの実フロー

1. ブラウザで `http://localhost:3000` を開き、フォームを入力
2. Stripe Checkout に進み、テストカード `4242 4242 4242 4242` で決済
3. `stripe listen` のターミナルに `checkout.session.completed` の転送ログが
   流れることを確認
4. dev サーバーのログに `[webhook]` 系のログが出ること、
   Supabase `orders` テーブルの対象レコードが `status='paid'` に
   更新されていることを確認

### パターン B: `stripe trigger` で合成イベント

```bash
stripe trigger checkout.session.completed
```

注意: `stripe trigger` は metadata に `order_id` を含まない合成セッションを
送ってくるので、webhook handler はログに
`checkout.session.completed without order_id metadata` を出して終了する。
署名検証と endpoint 疎通を見たいだけのときはこれで十分。
実フローを通したい場合はパターン A を使う。

## 5. 確認ポイント

| 項目 | 確認方法 |
| --- | --- |
| 署名検証 | dev ログに `[webhook] signature verification failed` が出ていない |
| Supabase 更新 | `orders` の `status`, `paid_at`, `customer_email` が入る |
| 冪等性 | 同じイベントを再送 (`stripe events resend <evt_...>`) しても 200 で no-op |
| Premium メール | `plan_id='premium'` のとき `premium_email_sent_at` が入る、SHUN + 顧客に2通届く |
| 既存 DL 動線 | `/success` 画面から Word DL がこれまで通り動く(破壊していないこと) |

## 6. イベント履歴の確認

```bash
stripe events list --limit 5
stripe events resend evt_xxxxxxxxxxxx
```

`resend` で同じイベントを二度流して、冪等性(status=paid の orders に対して
no-op になること)を検証するのが有効。
