# GA4購入ファネル

2026年10月3日、分離したテスト決済のpurchaseをGA4 DebugViewとリアルタイムで1件確認した。元の実装PR #98は同日15:13 JST、伏せ字の送信防止PR #100は17:08 JSTにマージ済み。本番はPR #100のマージコミット`41ab70b`でREADY。以降の本番テスト決済はユーザーの方針変更で行わず、最初の通常の有料購入をログで照合する。以下の構造化ログは追加修正の本番反映後に利用できる。

## 送信先と環境

- GA4: `G-TF01DPKTPQ`（プロパティ `533715167`、ストリーム `14399216063`）。変更時は `NEXT_PUBLIC_FUNNEL_GA_ID` をビルド時と実行時にそろえる。
- `GA4_API_SECRET`: 上記ストリームのサーバー専用シークレット。`NEXT_PUBLIC_` を付けない。VercelのSecretはpull時に実値ではなく`[SENSITIVE]`を返す場合がある。この伏せ字をローカルの認証情報として使用しない。送信処理でも伏せ字を拒否し、送信済みマーカーを付けない。
- 検証時のみ `NEXT_PUBLIC_ANALYTICS_DEBUG=true`（ビルド時）、`ANALYTICS_DEBUG=true`（サーバー実行時）。本番では両方を未設定にする。
- Preview の決済には Stripe テストキー、対応する Webhook 署名シークレット、分離した Supabase、および `ANALYTICS_TEST_DATA_ISOLATED=true` が必要。このフラグだけで DB は分離されない。必ず接続先を確認する。
- 既存 Preview は本番 DB・Stripe キーを共有しているため、上記が未設定なら Checkout は DB 書き込み前に503を返す。

## イベント

|イベント|契機|追加パラメータ|
|---|---|---|
|page_view|LPを含むページ表示|サニタイズしたURL・リファラー|
|form_start|フォーム内の最初の操作|GA session_id を基準に1回。取得不能時は30分無操作で区切る|
|form_step|必須項目を満たして前進|step_number=1〜5、同一セッションの同一段階は1回|
|form_complete|ステップ6に到達|同一セッションで1回|
|begin_checkout|プランを選び、Checkout URLの作成に成功|plan、value、JPY、items|
|purchase|署名検証済みのStripe決済完了Webhook|PaymentIntent ID、実決済額、JPY、items、plan|

`checkout.session.completed` と `checkout.session.async_payment_succeeded` を扱い、`payment_status=paid` の単発決済のみ購入とする。社内無料発行、購入後の編集、未払い、金額0は対象外。サブスクリプションの既存処理は維持する。

共通項目は `fire_department` と `building_use`。フォーム未入力・所轄未判定は `unknown`。消防本部名と用途コードは許可リストで検証し、フォームの住所・氏名・連絡先を GA4 に展開しない。

## 流入と二重送信

初回 UTM と gclid/gbraid/wbraid を localStorage に保存し、決済開始時の GA client_id/session_id と一緒に Stripe Checkout metadata に引き継ぐ。リファラーは origin のみ保存する。キャンペーン名は英数字・`_.~-`、100文字以内を使用する。メール形式・電話番号形式・任意のフォーム文字列を許可しない。

購入はブラウザーから送らない。Webhook はすでに paid の注文でも未送信の分析イベントを再試行する。GA4送信失敗時は500を返し、Stripeの再配信を利用する。送信後のStripe metadataマーカーで通常の再配信をスキップし、同時実行やマーカー保存前の障害には同じ client_id と transaction_id による GA4 の購入重複排除を使う。

GA4 の2xx応答だけではレポート反映を証明できない。APIシークレットの正しさ、DebugView、トランザクション件数の照合を別途確認する。広告ブロック・同意拒否等で client_id を取得できない購入は送信をスキップし、決済は継続する。DB・Stripeの売上を正本として照合する。

## GA4での分析

- purchaseをキーイベントにする。
- plan/fire_department/building_useをイベントスコープのカスタムディメンションとして登録する。
- 5段階の閉じたファネル: LPのpage_view → form_start → form_complete → begin_checkout → purchase。途中の別イベントは許可する。
- このプロパティは他サービスと共用のため、ホスト名 `plan.todokede.jp` で必ず絞る。プレビューのホストは本番分析から外す。
- プランは決済開始時に確定する。プラン別の離脱率は begin_checkout → purchase を基準とし、未選択の早期離脱に購入プランを推定しない。
- CPAは対象流入元の広告費÷購入件数。広告費の連携・インポートが別途必要であり、イベント追加だけでは広告費は取得できない。

Measurement Protocol のセッション帰属には同じ client_id/session_id と送信時期の制約がある。初回流入はStripe metadataにも残し、後日のセッション流入と区別して扱う。

## リリース前チェック

1. 分離したテスト環境で実フォーム→StripeテストCheckoutを操作。
2. DebugViewで各イベント・step_number・共通項目・プラン・金額を確認。
3. テスト決済を完了し、成功画面の送信に依存せずWebhookからpurchaseが届くことを確認。
4. 同じ署名済み決済イベントを再送して、送信マーカーとGA4の購入1件を照合。
5. 本番用シークレットとデバッグ無効を設定してから、本番反映について承認を得る。

プライバシーポリシーには既にGA4・Google広告の利用・送信情報等の記載があるため、この変更では本文を編集していない。

一次資料: [Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events)、[セッション帰属](https://developers.google.com/analytics/devguides/collection/protocol/ga4/use-cases)、[購入の重複排除](https://support.google.com/analytics/answer/12313109)、[検証エンドポイント](https://developers.google.com/analytics/devguides/collection/protocol/ga4/validating-events)。

## 実受信の検証記録（2026年10月3日）

- Stripeテストモードでstandard・9,800円を1件決済。分離したローカルDBの支払済みも1件。成功画面は検証用プロキシで停止した。
- Vercel Secretをローカルへ読み戻せないため、Previewの一時検証環境に本PRの送信モジュールをそのまま配置。署名検証・テストイベントID固定・Stripeテストキーで保護し、DBアクセスを行わず同じ決済イベントを処理した。
- Previewの実行環境でAPIシークレットが22文字であることを確認。実値は出力していない。
- 16:29 JSTの送信後、DebugViewでpurchase 1件、リアルタイムのイベント数・キーイベント数ともpurchase 1件を確認。通常レポートの日次確定値は別途処理される。
- transaction_idは`pi_3UMMabLw9VCVXHlZ1DqpyXNz`、value=9800、currency=JPY、plan=standard、itemsはstandard×1、fire_department=京都市消防局、building_use=3-ロ、元のsession_idと初回流入も確認。
- 同じ署名済みイベントを初回3回、伏せ字防止修正後3回の計6回再送し、すべて`duplicate`。GA4は1件のまま。
- 初回のローカル検証ではpull結果の`[SENSITIVE]`を実値と誤認した。11文字という観測は伏せ字の長さであり、Vercelの設定ミスを示すものではなかった。検証手順を修正し、伏せ字の送信防止を追加した。

本番のGA4_API_SECRETはSecret設定で保存されているため、pull結果から実値の文字数は確認できない。Previewの22文字確認をProductionの文字数確認と読み替えない。

## 本番の無課金確認と初回購入の照合

2026年10月3日17:09 JSTに、Productionデプロイ`dpl_3d1RycBFUuVKWx9K4Yt1trxM82D2`が`plan.todokede.jp`を指すこと、注入される環境変数のキー一覧に`GA4_API_SECRET`が含まれること、Secretの更新がデプロイより前であることを確認した。デバッグ環境変数は未設定。秘密値は読み出していない。これは設定・注入対象の確認であり、実行時の値の妥当性やGA4での本番purchase受信を証明するものではない。

Checkout作成時に`allow_promotion_codes`を指定していない。本番の既存Checkoutセッション2件でも同項目は`null`。100%割引の入力欄を使うにはコード変更が必要なため、割引コードの作成・0円注文・実購入・返金は行わない。Stripeでは0円注文でも`checkout.session.completed`を扱えるがPaymentIntentが付かない。本実装の購入条件（金額0円超、paid、PaymentIntentあり）を満たさず、purchaseは送られない。

### 送信ログ

追加修正後は、署名検証済みWebhookからの`sendPurchase`呼び出しごとに、`[ga4.purchase]`で始まるJSONを1件記録する。記録項目は結果、処理段階、HTTPステータス、測定ID、環境、Checkout ID、決済ID、許可されたプランID、`secret_configured`のみ。シークレット値・長さ・MPのURL・生のエラー・client_id・氏名・住所・メール・電話・フォーム・任意のmetadataは出力しない。

|outcome|意味|確認・対応|
|---|---|---|
|acknowledged|Googleの2xx応答後、Stripeに送信済みマーカーを保存した|送信処理の成功。GA4での1件計上は別途照合する|
|duplicate|送信済みマーカーがあり再送を省略した|同じ決済IDの既存送信記録を確認する|
|skipped|購入条件またはGAクライアント情報の条件を満たさない|未払い・0円・サブスク・広告ブロック等でclient_idがない場合を確認する|
|failed|処理に失敗した|stageとhttp_statusで切り分け。既存Webhookは500を返しStripe再配信を待つ|

`secret_configured=true`は、その呼び出しの実行環境で空でも伏せ字でもない値を読めたことを示す。正しいGA4シークレットであることまでは保証しない。`stage`は`payload`、`environment`、`configuration`、`duplicate_check`、`transport`、`delivery_marker`のいずれか。たとえば`failed / configuration / secret_configured=false`は設定不足、`failed / transport / http_status=503`はGoogleのHTTPエラー、`failed / delivery_marker / http_status=204`は送信後のマーカー保存失敗を示す。

### 最初の通常購入時の手順

1. Stripeの通常の有料購入から対象の`pi_…`と`cs_…`を取得する。再送による新しい決済やテスト注文は作らない。
2. VercelのProductionログで`[ga4.purchase]`と対象決済IDを検索する。CLIで調べる場合はPreviewブランチの暗黙フィルターを避ける。

   ```sh
   vercel logs --project shobo-keikaku-tool --environment production --no-branch --since 24h --query 'ga4_purchase_delivery' --json
   ```

3. `secret_configured=true`、`outcome=acknowledged`、HTTP 2xx、およびStripe Checkout metadataの`ga4_sent_G_TF01DPKTPQ`を確認する。`failed`なら段階ごとに調査し、Stripeの再配信後に再確認する。ログの保持期間を過ぎた場合、マーカーは送信処理の過去の成功を補助的に示すが、GA4計上の証明には使わない。
4. GA4で同じ`transaction_id`、実決済額、プランを照合する。リアルタイムに加え、処理後の探索で取引IDを完全一致指定し、`purchase`のイベント数が1件か確認する。本番のdebug_modeは有効化しない。HTTP 2xxだけで計上確認済みとはしない。
5. 確認時刻・決済ID・送信結果・GA4件数を報告書に記録する。自然発生した実購入なのでテスト除外・返金は不要。検知した送信エラーは下記のメール通知で知らせる。GA4レポートの計上件数を自動監視する機能は含まない。

一次資料: [Stripeの割引コード](https://docs.stripe.com/payments/checkout/discounts?payment-ui=stripe-hosted)、[0円注文とPaymentIntent](https://docs.stripe.com/payments/checkout/no-cost-orders?payment-ui=stripe-hosted)、[Measurement Protocolの応答](https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference#transport)。

## purchase送信エラーのメール通知

この追加修正の本番反映後、ProductionかつStripe本番モードの`sendPurchase`が例外終了する場合に、`info@meher-inc.co.jp`へResendで通知する。送信元は既存の`トドケデ <noreply@todokede.jp>`、認証は既存の`RESEND_API_KEY`を使用する。新しい環境変数は不要。

- メールにはサイト名、障害概要、ログ検索手順、Checkout IDから計算した照合用参照IDだけを含める。決済ID、Checkout ID、購入金額・プラン、フォーム内容、氏名・住所・メール・電話、GA client_id、秘密値、生の例外、MPのURLは含めない。
- 参照IDは`[ga4.purchase]`と`[ga4.alert]`の`alert_reference`に記録する。実際の失敗段階・HTTPステータスはVercelのProductionログで確認する。
- 通知成功後はCheckout metadataの`ga4_alert_G_TF01DPKTPQ=sent`を記録し、以後の再配信は通知を省略する。Resendには固定のidempotency keyと同一本文を渡し、同時処理・タイムアウト・マーカー保存前の障害に備える。
- Resendの重複防止キーの保持は24時間。Stripeのマーカーを保存できない障害が24時間以上続く場合は、重複通知の可能性が残る。通知の本文に現在時刻や変動するエラー内容を入れず、再試行で同一キーと異なる本文が衝突しないようにする。
- 通知処理はStripe読み取り・書き込み各2秒（自動リトライなし）、Resend送信5秒を上限とする。通知処理の失敗も固定項目だけでログに残し、元のGA4エラーを維持する。既存Webhookは500を返してStripeの再配信を待つ。
- メール送信が失敗した場合は、次のGA4送信失敗時に再試行する。GA4が次回に回復した場合の通知の後追い送信や、通知専用キューは設けていない。
- Preview・ローカル・Stripeテストモードでは自動通知しない。`skipped`・`duplicate`・正常送信も通知対象外。HTTP 2xxでもGA4レポートで未計上となるケースはこの処理では検知できないため、初回購入のGA4照合は必要。

動作確認ではGA4・Stripeを模擬したローカルの検証環境から、宛先を上記アドレスに固定して「通知テスト」と明記したメールを1通送信し、Resendで`delivered`を確認した。GA4・Stripeへの通信と本番DBへの書き込みは行っていない。同じ模擬エラーの2回目はマーカーにより通知をスキップし、Resendへ同一リクエストを再送しても同じメールIDが返ることを確認した。

一次資料: [Resendの重複防止](https://resend.com/docs/dashboard/emails/idempotency-keys)、[Resendメール送信API](https://resend.com/docs/api-reference/emails/send-email)。

## form_start / form_complete のキーイベント設定可否

2026年10月3日、GA4プロパティ`533715167`の管理→イベント→最近のイベントで、`form_start`と`form_complete`の両方を確認した。ストリーム表示は`plan.todokede.jp (app)`。両方ともキーイベントのスターは未選択で、切り替え操作は有効。今回は設定可否の確認依頼のため、設定は変更していない。

- `form_start`: 通常フォームの最初の操作。1セッション1回。
- `form_complete`: 通常フォームのステップ6（生成）到達。コード上は0始まりの`step === 5`。同一セッションの重複を抑止する。
- 購入後の編集・社内無料発行等は計測対象外。イベント名と発火条件を変更する必要はない。

Google広告とのリンク後は、対象イベントをキーイベントに設定し、Google広告へ取り込んだコンバージョンのアクション最適化を「副次」にする。副次は通常の入札最適化には使わず「すべてのコンバージョン」で確認するが、カスタム目標に含めた場合は入札に使われ得るため、補助指標として扱うならカスタム目標にも含めない。

このGA4プロパティは他サービスと共用しているため、広告へ取り込む前に同名イベントの対象ホストを確認する。混在する場合は`event_name`と`page_location`のホスト条件から`plan_form_start` / `plan_form_complete`などの専用イベントを作成し、そのイベントをキーイベントとして取り込む。管理画面のストリーム名だけで対象ドメインが限定されるとは判断しない。今回、Google広告リンク・インポート・キーイベント変更は実施していない。

一次資料: [キーイベントとしてマーク](https://support.google.com/analytics/answer/13128484)、[Google広告への取り込み](https://support.google.com/google-ads/answer/2375435)、[メインとサブのコンバージョン](https://support.google.com/google-ads/answer/11461796)。
