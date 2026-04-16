# Stripe改修技術要件：月額サブスクリプション移行

**📌 プロジェクト追加推奨**（開発プロジェクト側にもコピー）
**🔄 更新予定あり**：W2実装中に詳細追加

作成日: 2026-04-13
対象: トドケデ消防計画SaaS
実装期間: Week 2（4/20-26）
ステータス: 実装前の要件定義

---

## 改修の目的

単発¥9,800買い切り → 3プラン月額サブスクへの切替。**既存の単発Checkoutを保守しつつ**、新規顧客には月額サブスクを提示する設計。

---

## プラン構成（Stripe Product & Price 対応表）

| プラン | Stripe Product | 月額Price | 年額Price |
|---|---|---|---|
| ミニマム | `prod_minimum` | `price_minimum_monthly` ¥4,980 | `price_minimum_yearly` ¥49,800 |
| スタンダード | `prod_standard` | `price_standard_monthly` ¥9,800 | `price_standard_yearly` ¥98,000 |
| プロ | `prod_pro` | `price_pro_monthly` ¥19,800 | `price_pro_yearly` ¥198,000 |

すべて税別 or 税込（下記論点参照）で統一。

### 命名規約

- Product ID: `prod_{plan_key}`
- Price ID（月額）: `price_{plan_key}_monthly_v1`
- Price ID（年額）: `price_{plan_key}_yearly_v1`
- `_v1` を付けることで、将来の価格改定で `_v2` を別途作れる

---

## 決定すべき論点（Week 2冒頭）

### 論点1: 消費税の取り扱い

| 選択肢 | メリット | デメリット |
|---|---|---|
| **税込表記**（¥9,800に税込み） | 顧客の心理的抵抗が小さい | 実売上が¥8,909になり、¥9,800より少なく見える |
| **税別表記**（¥9,800+税=¥10,780） | 実売上が大きく見える | 心理的に「結局いくら？」の疑問 |

**推奨：税込表記**。競合（Saas系）の多くが税込表記で、¥9,800が心理的ベンチマーク。

### 論点2: 初月無料トライアルの有無

| 選択肢 | 効果 | リスク |
|---|---|---|
| **あり（7日間）** | 新規CVR向上 | 無料利用後の解約率が読めない |
| **なし** | 収益予測立てやすい | CVR低下リスク |

**推奨：新規はなし、既存移行のみ初月無料**。新規は消防計画SaaSの価値を理解済みで来る想定。既存移行は「¥9,800払ったばかり」の不満解消のため必要。

### 論点3: 年額プランの支払い方法

| 選択肢 | 処理 |
|---|---|
| **年額一括** | `interval: "year"` でStripe Subscription設定、1年ごとに請求 |
| 月額の12回分割 | オペレーション複雑、非推奨 |

**推奨：年額一括**。キャッシュフロー前倒し＋解約率抑制効果。

### 論点4: 請求書払い対応

法人顧客（特に介護施設・管理会社）は請求書払い希望が多い。

**推奨：Week 3公開時は対応見送り、Month 3で対応判断**。Stripe Invoiceで対応可能だが、初期は決済完了率を重視。

---

## 必須実装機能

### 🔴 Priority 1: 月額サブスクリプション（Week 2前半）

#### Stripe Checkout Session 作成

```javascript
// POST /api/checkout/create
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: priceId,  // price_standard_monthly_v1
    quantity: 1,
  }],
  customer_email: email,
  success_url: `${baseUrl}/welcome?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/pricing`,
  metadata: {
    plan_key: 'standard',
    billing_cycle: 'monthly',
    user_id: userId,
  },
  subscription_data: {
    metadata: {
      plan_key: 'standard',
    },
  },
});
```

#### プラン情報のDB保存

既存DBに以下のテーブルを追加 or 既存テーブルに列追加：

```sql
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50); 
  -- active, past_due, canceled, etc.
ALTER TABLE users ADD COLUMN current_plan VARCHAR(50);
  -- minimum, standard, pro
ALTER TABLE users ADD COLUMN billing_cycle VARCHAR(10);
  -- monthly, yearly
ALTER TABLE users ADD COLUMN current_period_end TIMESTAMP;

CREATE TABLE subscription_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50),  -- created, updated, canceled
  from_plan VARCHAR(50),
  to_plan VARCHAR(50),
  event_at TIMESTAMP,
  stripe_event_id VARCHAR(255) UNIQUE
);
```

### 🔴 Priority 1: Webhook実装（Week 2前半）

Stripe からのイベント受信エンドポイント。

```javascript
// POST /api/webhooks/stripe
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // 初回決済完了時：ユーザーをアクティブ化
      await handleCheckoutComplete(event.data.object);
      break;
    
    case 'invoice.payment_succeeded':
      // 月次・年次の更新決済成功：期間を延長
      await handlePaymentSucceeded(event.data.object);
      break;
    
    case 'invoice.payment_failed':
      // 決済失敗：リマインドメール送信、3日後に再試行
      await handlePaymentFailed(event.data.object);
      break;
    
    case 'customer.subscription.deleted':
      // 解約：機能制限、データ保持は3ヶ月
      await handleSubscriptionDeleted(event.data.object);
      break;
    
    case 'customer.subscription.updated':
      // プラン変更：新しいプラン情報で更新
      await handleSubscriptionUpdated(event.data.object);
      break;
  }

  res.json({received: true});
});
```

#### 冪等性の確保

同じWebhookイベントが複数回来ても、同じ結果になるように実装：

```javascript
async function handleCheckoutComplete(session) {
  const existingEvent = await db.query(
    'SELECT * FROM subscription_history WHERE stripe_event_id = $1',
    [session.id]
  );
  if (existingEvent.rows.length > 0) return;  // 既に処理済み
  
  // 処理本体
  await db.query('BEGIN');
  await updateUser(session.customer_email, {...});
  await insertHistory(session.id, 'created');
  await db.query('COMMIT');
}
```

### 🔴 Priority 1: マイページ最小版（Week 2後半）

以下の情報を表示するだけのシンプルな画面：

- 現在のプラン名・月額/年額
- 次回請求日
- 支払い方法（Stripe Customer Portalへの導線）
- 過去3ヶ月の決済履歴
- プラン変更導線
- 解約導線

Stripe Customer Portal を使えば実装負荷を大幅削減：

```javascript
// POST /api/billing-portal
const session = await stripe.billingPortal.sessions.create({
  customer: user.stripe_customer_id,
  return_url: `${baseUrl}/mypage`,
});
res.redirect(session.url);
```

### 🟡 Priority 2: 既存単発購入者の移行導線（Week 3）

単発で¥9,800を既に支払った顧客向けの「初月無料で月額へ」導線。

```javascript
// POST /api/upgrade-from-legacy
// 既存顧客専用エンドポイント、トークン認証
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{ price: standardMonthlyPriceId, quantity: 1 }],
  customer_email: legacyCustomerEmail,
  discounts: [{
    coupon: 'LEGACY_FIRST_MONTH_FREE',  // 事前にStripeで作成
  }],
  metadata: {
    upgrade_from: 'legacy_single',
    original_purchase_id: legacyTransactionId,
  },
});
```

Stripe側で以下のクーポンを事前作成：

- ID: `LEGACY_FIRST_MONTH_FREE`
- 割引：初回100%OFF（1回のみ適用）
- 対象：全プラン

---

## 移行期間の運用設計

### 単発購入Checkoutの扱い

**Week 3 Day 19公開時点で、新規の単発Checkoutは廃止**。LPから「¥9,800買い切り」の導線を削除。

ただしAPIエンドポイント自体は90日間残す（既存顧客の再購入リンクが動作するよう）。

### データ移行

既存の単発購入者データは触らない。`users` テーブルの新規追加カラムは、単発購入者は NULL のまま。マイページアクセス時に以下の判定：

```javascript
if (user.stripe_customer_id === null) {
  // 単発購入者
  showLegacyView(user);
} else {
  // 月額サブスク契約者
  showSubscriptionView(user);
}
```

---

## 環境変数（.env追加分）

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx  # 本番キー
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Price IDs (事前にStripe Dashboard で作成後、IDをコピー)
STRIPE_PRICE_MINIMUM_MONTHLY=price_xxx
STRIPE_PRICE_MINIMUM_YEARLY=price_xxx
STRIPE_PRICE_STANDARD_MONTHLY=price_xxx
STRIPE_PRICE_STANDARD_YEARLY=price_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_YEARLY=price_xxx

# クーポン
STRIPE_COUPON_LEGACY_FIRST_MONTH=LEGACY_FIRST_MONTH_FREE
```

---

## テスト項目

### 正常系

- [ ] 新規ユーザーがミニマム月額で決済できる
- [ ] 新規ユーザーがスタンダード月額で決済できる
- [ ] 新規ユーザーがプロ月額で決済できる
- [ ] 新規ユーザーが年額プランで決済できる
- [ ] 月次更新が自動実行される
- [ ] マイページで契約状況が正しく表示される
- [ ] プラン変更（ミニマム→スタンダード）が動作する
- [ ] 解約が正しく処理される
- [ ] 既存単発購入者が「初月無料で月額へ」の導線で移行できる

### 異常系

- [ ] 決済失敗時にリマインドメールが送信される
- [ ] 決済失敗後3日経過で再試行される
- [ ] Webhookの二重実行が冪等に処理される
- [ ] サブスクリプション自動解約後、機能制限が適用される

### ブラウザ・決済手段

- [ ] Chrome / Safari / Edge で動作確認
- [ ] モバイル（iOS Safari / Android Chrome）で動作確認
- [ ] クレカ決済（Visa/Master/JCB/Amex）
- [ ] Apple Pay / Google Pay（Stripe Checkoutは自動対応）

---

## Week 2の実装スケジュール

| 日 | タスク |
|---|---|
| Day 8（月） | 税理士面談（税務論点確認）、Stripe Dashboard でProduct/Price作成 |
| Day 9（火） | 共済申込書投函、Stripe設計の技術要件最終確認 |
| Day 10（水） | Stripe Checkout Session 実装 |
| Day 11（木） | Webhook実装、DBマイグレーション |
| Day 12（金） | マイページ実装、テスト |
| Day 13（土） | LP・FAQ更新、利用規約追記 |
| Day 14（日） | 最終テスト、Week 3公開準備 |

---

## 開発プロジェクトへの橋渡し

このファイルを消防計画SaaSの開発プロジェクトにコピーすること。開発プロジェクト側でClaude Codeに最初に投げるメッセージ：

```
Stripe改修技術要件.md を参照して、Week 2の実装を進めてください。
まずDay 10のStripe Checkout Session 実装から着手します。
以下を実装してください：

1. Stripe SDKの導入（既存の単発Checkoutコードと共存）
2. POST /api/checkout/create エンドポイント
3. フロントエンドのプラン選択→Checkout遷移フロー
4. price_id のマッピング設定（.env から読み込み）

既存の単発Checkoutは削除せず、別エンドポイントとして
共存させる方針でお願いします。
```

---

## 参考：Stripe公式ドキュメント

- Subscriptions: https://docs.stripe.com/billing/subscriptions/overview
- Checkout with Subscriptions: https://docs.stripe.com/billing/quickstart
- Webhooks: https://docs.stripe.com/webhooks
- Customer Portal: https://docs.stripe.com/customer-management
- Invoices and Billing: https://docs.stripe.com/billing/invoices/overview

Week 2着手前にDocsの Subscriptions セクションを一読することを推奨。
