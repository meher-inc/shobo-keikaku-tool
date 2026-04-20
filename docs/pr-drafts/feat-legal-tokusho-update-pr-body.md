# PR タイトル

特商法表記の最終更新日を2026-04-20に更新

# PR 本文(以下をブラウザのPR作成フォームに貼り付けてください)

## 目的

`/legal/tokusho`(特定商取引法に基づく表記)の **最終更新日の表示を 2026 年 4 月 20 日に更新** する chore 的な微修正。

本 PR は元々 recon-01「特商法ページ更新の要否判断」の結果として切り出されたもの。内容検証の結論は **「既存ファイルはサブスクモデル対応で既に完成しており、本文の修正は不要」** だったが、直近 commit `b5de4ac chore(legal): remove ghost campaign 支払時期 entry from tokusho`(2026-04-20)との **日付整合を取るため** 表示上の最終更新日のみ同期する。

## 変更内容

- `app/legal/tokusho/page.tsx` L16 の `最終更新日: 2026年4月18日` → `2026年4月20日`
- 変更は 1 行のみ(1 file changed, 1 insertion(+), 1 deletion(-))

## recon 結論(今回本文修正を行わない理由)

6 観点で既存ファイルを検証した結果:

| # | 観点 | 判定 |
|---|---|---|
| 1 | 運営統括責任者「丸岡 峻」 | ✅ 合致(`page.tsx:30`) |
| 2 | 所在地表記 | ⚠️ 具体開示のまま維持(SHUN 判断:プライバシーより法令堅牢性・顧客信頼を優先) |
| 3 | 電話番号(請求時開示) | ✅ 合致(`page.tsx:42-47`) |
| 4 | 商号変更予告(2026/11 株式会社トドケデ) | ✅ 合致(`page.tsx:22-26`) |
| 5 | 販売価格 3 プラン | ❌ 差分あり(後述・本 PR スコープ外) |
| 6 | 最終更新日 | 🟢 本 PR で 4/20 に同期 |

詳細は `docs/recon/legal-tokusho-diff.md` を参照。

## プロプラン(¥19,800/¥198,000)を本 PR に含めない理由

特商法だけプロプランを追記すると、以下の箇所と整合性が崩れるため **別 PR で一括対応** する方針に決定:

- `lib/plans.ts`(SSOT):`PLAN_IDS = ["minimum", "standard"]` の 2 プラン定義のみ
- `components/pricing-cards.tsx`:`PLANS.map()` で自動生成 → pricing カードは 2 列表示
- `app/legal/terms/page.tsx` L41-43, L51:「ミニマムプラン、スタンダードプラン」と具体名列挙
- Stripe Price ID 環境変数:`STRIPE_PRICE_MINIMUM_*` / `STRIPE_PRICE_STANDARD_*` のみ(プロ用は未発行)

**プロプラン本丸リリースは別 PR `feat/W3-pro-plan-rollout`(W4 以降、5 月中旬目標)** で以下を一括整備する計画:

- `lib/plans.ts` に `pro` プラン追加
- Stripe Dashboard でプロプラン Price ID 発行
- Vercel 環境変数 `STRIPE_PRICE_PRO_MONTHLY` / `STRIPE_PRICE_PRO_YEARLY` 登録
- `app/pricing` カードを 3 列対応
- `app/legal/terms` にプロプラン言及追加
- `app/legal/tokusho` の販売価格テーブルにプロ追加

W3 LP 公開(4/29)は **ミニマム・スタンダードの 2 プラン体制で実施** する。

## 実装前後の動作確認

- [x] `npm run build` 成功(Next.js 16.2.3 Turbopack、全 18 ルート生成)
- [x] `npm run typecheck` エラーなし(tsc --noEmit)
- [x] `npm run lint` — 既存の 53 エラーは触らないファイル(`lib/supabase.ts`, `lib/subscriptions.ts`, `scripts/*.js`)由来の **pre-existing**。本 PR 由来のエラー **0 件**
- [x] 変更箇所は `app/legal/tokusho/page.tsx` L16 の 1 行のみ(git diff で確認済み)

## AGENTS.md 触らないファイル例外ルールとの照合

AGENTS.md「触らないファイル例外ルール(2026-04-20 追加)」より:
- ✅ 表示されるテキスト(日本語文言)の修正のみに限定 → 最終更新日 1 行のみ
- ✅ 構造変更・ロジック変更・フィールド追加削除は一切しない → 該当なし
- ✅ 丸岡さんの明示的な合意を事前に得る → 本セッションで合意取得済み(選択肢 Y 採用)
- ✅ recon(読取調査 → 報告 → 合意 → 実装)の手順を必ず踏む → `docs/recon/legal-tokutei-recon.md` および `docs/recon/legal-tokusho-diff.md` 出力済み

## マージ後の SHUN 確認事項

- [ ] 本番デプロイ後、https://plan.todokede.jp/legal/tokusho にアクセスし、ヘッダー直下の「最終更新日: 2026年4月20日」表示を目視確認
- [ ] 販売価格テーブルがミニマム・スタンダードの 2 プラン表示のまま維持されていること(プロプラン混入がないこと)を確認
- [ ] 所在地が従来通り具体住所で開示されていることを確認(変更していないが念のため)
- [ ] Footer からの `/legal/tokusho` リンクが正常に遷移すること

## 参考

- `docs/recon/legal-tokutei-recon.md` — URL 齟齬(tokutei vs tokusho)の判明経緯
- `docs/recon/legal-tokusho-diff.md` — 6 観点差分レポート(SHUN 判断の根拠)
- `08_横断_特商法ページ実装_ClaudeCodeプロンプト_v1_0.md` — 今回のトリガーとなった依頼文(URL 指定は誤記と判明)

---

# ブラウザ操作手順

1. 以下 URL を開く
   https://github.com/meher-inc/shobo-keikaku-tool/pull/new/feat/legal-tokusho-update

2. **Title** 欄に上記「PR タイトル」をコピペ

3. **Description** 欄に「## 目的」以降の Markdown をコピペ
   (末尾 `## 参考` ブロックまで。「ブラウザ操作手順」は貼らない)

4. Base ブランチが `main`、Compare ブランチが `feat/legal-tokusho-update` になっていることを確認

5. "Create pull request" を押下

---

# 補足: 後続のファイル名リネーム(今回スコープ外)

SHUN との合意済みで、今回は後回し:

- `docs/recon/legal-tokutei-recon.md` → `docs/recon/legal-tokusho-recon.md`(URL 正本が `tokusho` であるため)

上記は別 commit または別 PR で整合性を取る予定。
