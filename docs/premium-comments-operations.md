# 指摘コメント送付日時と無料再作成期限

規約第9条第3項に合わせ、プレミアムは「購入日時から14日後」と「指摘コメントの送付日時から7日後」の遅い方まで再作成できます。期限と同時刻は期間内です。他プランと、送付日時が未記録の既存注文は購入から14日です。

## 送付後の記録

指摘コメントは担当者がメールで送付します。実際に送付した後、送信済みメールの日時を注文に記録してください。購入受付メールの送信では、この記録を行いません。

接続先を確認した担当者用の環境で、リポジトリ直下から実行します。注文IDは `orders.id` のUUIDです。日時には必ずタイムゾーンを付けます。以下の値は例です。

```sh
node --env-file=.env.local --import tsx scripts/record-premium-comments.ts \
  --order-id '00000000-0000-0000-0000-000000000001' \
  --sent-at '2026-09-30T15:00:00+09:00'
```

接続にはサーバー用の `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を使います。秘密値をコマンド引数や記録票に貼り付けないでください。コマンドはメール送信を行わず、送付日時だけをDBに保存します。成功時に注文IDと保存日時を出力します。

- DB項目：`orders.premium_comments_sent_at`。既存の `premium_email_sent_at` は購入受付メール用なので別扱いです。
- 最初の送付日時を保持します。同じ日時での再実行は成功し、異なる日時での上書きは拒否します。再送や反映確認で期限はリセットしません。
- 決済済みプレミアムだけ記録できます。未購入・購入前の日時・未来の日時は拒否します。
- `paid_at` 未記録の旧注文にコメントを送る場合は、決済記録を確認し、購入日時の補完を行ってから記録します。推測で日付を入れません。
- 一般の購入者は記録関数を呼べません。顧客の保存APIも送付日時を更新しません。

誤記を訂正する場合は、送信済みメールを確認した管理者がDB上で個別に対応します。通常のコマンドでの上書きは行いません。

## 本番反映時の順序

1. Stripe確認の完了後、本番DBの `orders` と `paid_at` の型、ロール権限を確認します。
2. `supabase/migrations/004_premium_comments_sent.sql` を適用します。既存日時の推測による埋め戻しは行いません。
3. migration適用後にアプリを公開します。先にアプリだけを公開すると、新しい列の取得が失敗します。
4. 購入、指摘コメントの送付記録、編集フォームの期限表示と保存可否を確認します。

購入日時には `paid_at` を優先し、未記録の旧注文のみ従来のCheckout作成日時へフォールバックします。新規決済はWebhook受信日時でなく決済完了イベント日時を `paid_at` に保存します。既存の購入日時は書き換えません。

## 検証

```sh
npm test -- lib/__tests__/order-edit-window.test.ts lib/__tests__/order-form-route.test.ts lib/__tests__/purchase-completion-time.test.ts
```

DBテストは専用のローカル使い捨てDB `premium_comments_test` だけで実行します。最小の `orders` テーブル（UUIDのid、textのstatusとplan_id、timestamptzのpaid_at）、Supabase相当の `anon`・`authenticated`・`service_role` ロールを用意し、migrationを適用後、`supabase/tests/premium_comments_sent.sql` を実行します。テストデータの変更は最後にROLLBACKします。本番DBでテストを実行しないでください。
