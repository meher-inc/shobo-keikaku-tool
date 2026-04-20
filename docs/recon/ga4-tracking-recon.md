# GA4 計測基盤 recon 結果(shobo-keikaku-tool / plan.todokede.jp 側)

調査日: 2026-04-20
調査ブランチ: feat/care-bcp-waitlist(recon のみ・書き込み無し)
対象プロンプト: 07_横断_GA4UTM計測基盤_ClaudeCode用統合プロンプト v1.1

## TL;DR — 実装前に SHUN 判断が必要な事項が 4 点あります

1. **GA4 は既に `G-7611WP9PEY` で稼働中**。プロンプト指定の `G-TF01DPKTPQ` と ID が異なる
2. **`GT-WVGRZJBL` はコード内に見当たらない**(プロンプトの前提と食い違い)
3. **サブスク成功ページ(`app/subscribe/success/page.tsx`)は AGENTS.md の触らないファイル**。プロンプトは `app/success/**` を例外としているが、実コード上のサブスク成功は別ディレクトリ
4. **`@next/third-parties` 未導入**。既存実装は `next/script` 直書きなので、方針を揃えるか分離するか判断が必要

---

## 1. 既存タグの実装状況

### 1-1. `app/layout.tsx`(lines 39–52)

```tsx
{/* Google tag (gtag.js) - Google Ads & GA4 共通 */}
<Script
  src="https://www.googletagmanager.com/gtag/js?id=AW-18069681696"
  strategy="afterInteractive"
/>
<Script id="google-tag-init" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'AW-18069681696');
    gtag('config', 'G-7611WP9PEY');
  `}
</Script>
```

- **方式**: Next.js `<Script strategy="afterInteractive">` で直接埋め込み(recon 報告フォーマット上の「ケースC: 独自コンポーネント」には該当しないが、`@next/third-parties` を使わない素朴実装)
- **Google Ads タグ**: `AW-18069681696` が `config` されている ✅(プロンプト記載の ID と一致)
- **GA4 タグ**: `G-7611WP9PEY` が既に `config` されている ⚠️(プロンプト指定の `G-TF01DPKTPQ` と **ID が異なる**)
- **`GT-WVGRZJBL`**: コードベース全体で grep しても検出されず ⚠️(プロンプトに「既存タグID」として記載があるが、実コードには無い)

### 1-2. `app/subscribe/success/page.tsx`(サブスク成功ページ)

既に以下のイベント発火ロジックが実装済み(lines 44–79):

- `gtag('event', 'conversion', { send_to: 'AW-18069681696/QAlqCP2rjZ4cEKDspahD', ... })` — Google Ads コンバージョン
- `gtag('event', 'purchase', { transaction_id, value, currency, items })` — GA4 購入イベント(eコマース)

conversion label `QAlqCP2rjZ4cEKDspahD` は Google Ads 管理画面で発行済みのもの。重複発火防止ロジック(`convFired` state)もあり。

**このファイルは AGENTS.md の「触らないファイル」(`app/subscribe/success/**`)に該当** → 原則として改変禁止。

### 1-3. `app/success/page.tsx`(Word ダウンロード用の単発購入成功ページ)

プロンプトでは「`app/success/**` は計測用 useEffect 追加を例外的に許可」とあるが、**このページは Stripe サブスクの成功ページではなく、Word 生成ダウンロード画面**(ライト/スタンダード/プレミアム プラン向け)。gtag 関連のコードは一切無い。

プロンプトが指している「`subscribe_success` イベントを追加する `/success` ページ」は、**実際には `app/subscribe/success/page.tsx` の方を想定しているように読める** → プロンプトの参照先と実コードの構成にズレがある。

---

## 2. 環境変数の現状

- `.env.local` を grep(`GA_ID|ANALYTICS|gtag|AW-|GT-` / 大文字小文字区別なし): **該当無し**
- `NEXT_PUBLIC_GA_ID` を参照するコードも存在しない(現行は ID ハードコード)
- プロンプトでは「Vercel 環境変数登録は完了済み(SHUN 側で実施済)」とあるが、ローカル `.env.local` には未反映

---

## 3. パッケージ状況

- `@next/third-parties`: **未インストール**(`package.json` 未記載)
- Next.js: 16.2.3 / React: 19.2.4

---

## 4. カスタムイベント実装状況

プロンプトが要求する 5 種のうち、plan.todokede.jp 側で実装が必要なのは `subscribe_success` のみ(他 4 種は todokede-marketing 側)。

| イベント名 | 実装場所(想定) | 現状 |
|---|---|---|
| `subscribe_success` | `app/subscribe/success/page.tsx` | 既に `purchase`(GA4 eコマース) として発火済み。`subscribe_success` 名での専用イベントは未発火 |

---

## 5. 実装計画の提案(SHUN 合意待ち)

### 選択肢 A: GA4 ID は現状維持(`G-7611WP9PEY`)

- layout.tsx を一切触らない(既存タグ群の安定稼働を優先)
- プロンプト指定の `G-TF01DPKTPQ` は使わない
- `subscribe_success` イベント追加は、触らないファイル `app/subscribe/success/**` への例外申請が別途必要

### 選択肢 B: GA4 ID を `G-TF01DPKTPQ` に差し替え(プロンプト順守)

- `app/layout.tsx` の `gtag('config', 'G-7611WP9PEY')` を `process.env.NEXT_PUBLIC_GA_ID` 参照に変更
- 既存の Google Ads タグ(`AW-18069681696`)には一切触れない
- **リスク**: `G-7611WP9PEY` で既に収集中のデータが切断される(GA4 プロパティ側のデータ連続性に影響しないか要確認)

### 選択肢 C: 両 GA4 ID を並列 config(段階移行)

- `gtag('config', 'G-7611WP9PEY')` を残したまま `gtag('config', 'G-TF01DPKTPQ')` を追加
- 一定期間データ突合後、片方に寄せる
- 最もリスクが低いが、二重計測になる

### `subscribe_success` イベントの扱い

- **案 α**: AGENTS.md 例外申請のうえ `app/subscribe/success/page.tsx` に追加(既存ロジック非破壊の useEffect 追記のみ)
- **案 β**: プロンプト指定の `app/success/**` に追加(ただし実体は Word DL ページなので、サブスク成功イベントとしては意味が通らない)
- **案 γ**: 既存の `purchase` イベントで代替(GA4 管理画面側で「purchase を subscribe_success とみなす」設定にする)

個人的な推奨は **選択肢 C + 案 α**(データ連続性を壊さず、かつプロンプトの要求も満たす)ですが、SHUN さんの判断を仰ぎます。

---

## 6. SHUN 確認依頼事項

1. **GA4 測定 ID の扱い**: `G-7611WP9PEY`(既存)と `G-TF01DPKTPQ`(プロンプト指定)の関係は? 選択肢 A/B/C のどれで進めるか。
2. **`GT-WVGRZJBL` の実在**: プロンプトに「既存タグID」として記載があるが、コードに無い。タグマネージャー経由(GTM)で別途仕込まれている想定だったのか、誤記か、追加実装が必要か。
3. **`subscribe_success` イベントの追加場所**: 案 α(`app/subscribe/success/**` への例外改修)/案 β/案 γ のどれで進めるか。案 α の場合、AGENTS.md 例外ルール手続き(明示合意・recon→報告→合意→実装)を踏むが、今回の recon 報告がその第 1 段階を兼ねる認識でよいか。
4. **実装方式**: 既存は `next/script` 直書き、プロンプトは `@next/third-parties` 推奨。既存を維持して `G-TF01DPKTPQ` を追加するだけにするか、`@next/third-parties` 導入に置き換えるか。
5. **ブランチ運用**: 現在 `feat/care-bcp-waitlist` 作業中。GA4 作業は `feat/ga4-tracking` を別途切って進める想定でよいか(推奨: main から切る)。

---

## 7. 参考情報

- 現在のブランチ: `feat/care-bcp-waitlist`(recon 作業自体は read-only 完了、ファイル変更は本 recon.md のみ)
- 既存 recon 実績: `care-bcp-waitlist-recon.md` / `email-brand-sweep-recon.md` / `ts-nocheck-recon.md`(すべて untracked)
