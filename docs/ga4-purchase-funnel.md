# GA4購入ファネル

2026年10月3日、分離したテスト決済のpurchaseをGA4 DebugViewとリアルタイムで1件確認した。GitHub上では元の実装PR #98が同日15:13 JSTにマージ済みで、本番は16:19 JSTにそのマージコミット`25732b2`へ更新されていた。この検証作業では本番を変更していない。伏せ字の送信防止は別の追加修正として扱う。

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
