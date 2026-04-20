# 特商法表記ページ(/legal/tokutei) 実装前 recon

作成日: 2026-04-20
recon 対象: `app/legal/tokutei/page.tsx` 新規作成依頼(月額サブスク対応)
担当: Claude Code(読み取りのみ、実装未着手)

---

## ⚠️ 結論先出し: 実装を開始する前に丸岡さんの判断が必要

依頼は `/legal/tokutei` の新規作成ですが、調査の結果 **既存の `/legal/tokusho` が同じ目的のページとしてすでに月額サブスク対応で完成** しており、そのまま `tokutei` を新規作成すると **「特商法表記が2つ存在する」状態** になります。また AGENTS.md の「触らないファイル例外ルール」に照らしても新規ページ作成は例外条件の範囲外です。以下の確認事項について丸岡さんの意思決定を仰ぎたいです。

---

## 1. ブランチ・git 状態

- 現在ブランチ: `feat/ga4-tracking`(main ではない、origin と同期済み)
- `origin/main..HEAD` 差分: `1fc8d95 feat(analytics): add parallel GA4 stream via NEXT_PUBLIC_GA_ID` 1 commit
- main 直近: `48e776d Merge branch 'feat/W3-tokusho-migration-cleanup'` → `b5de4ac chore(legal): remove ghost campaign 支払時期 entry from tokusho`(tokusho 関連の作業が直近で完了している)
- 未追跡ファイル(作業に無関係なもの多数): `docs/legal-pages-instructions.md`, `docs/privacy.md`, `docs/terms.md`, `docs/tokusho.md`, `docs/recon/*`, `docs/pr-drafts/`, `report.md`

依頼通り `main` から新しくブランチを切る手順は後続で可能ですが、まず下記の URL 問題を解決する必要があります。

---

## 2. 既存の `/legal/tokusho` 実態

| 項目 | 値 |
|---|---|
| パス | `app/legal/tokusho/page.tsx` |
| サイズ | 10,759 bytes |
| 最終更新 | 2026-04-20(直近 commit `b5de4ac` で campaign 不要項目を削除) |
| metadata title | 「特定商取引法に基づく表記 | トドケデ消防計画」 |
| 販売業者 | MeHer株式会社(商号変更予定注記あり) |
| 販売価格 | ミニマム ¥4,980/月・¥49,800/年、スタンダード ¥9,800/月・¥98,000/年(税込) |
| 支払方法 | Stripe(Visa/Mastercard/JCB/Amex/Diners) |
| 支払時期 | 月額・年額それぞれの自動決済仕様を dl で明記 |
| 自動更新 | 「継続課金型のサブスクリプションサービス」と明記 |
| 解約 | `plan@todokede.jp` 宛メール運用 |
| 返金 | 原則不可+例外条件列挙、日割り返金不可 |
| プラン変更 | アップグレード即時日割り/ダウングレード次回更新時 |

**すでにサブスク本番モデルに準拠した構成で完成している**。添付の CSS Module(`tokusho.module.css`, 257 lines)でスタイルも独自に整っている。

---

## 3. `/legal/tokutei` の現状

- `app/legal/tokutei/` ディレクトリは **存在しない**
- `find app/ -name "*tokutei*"` の結果: **ヒット 0 件**
- コードベース全体で `tokutei` の出現: **0 件**(Grep で `tokutei|特定商取引|特商法` をかけた結果、`tokutei` はどこにも現れない)

つまり `/legal/tokutei` は **過去も現在も一度も使われていない新規 URL**。

---

## 4. 他ファイルから参照されている URL

| 参照元 | 参照先 | 文字列 |
|---|---|---|
| `components/Footer.tsx:15` | `/legal/tokusho` | 「特定商取引法に基づく表記」リンク |
| `app/legal/tokusho/page.tsx:249,264` | `/legal/terms`, `/legal/privacy` | 相互リンク |
| `app/legal/terms/page.tsx:103` | 特定商取引法の記述(URL 無し) | — |
| `docs/legal-pages-instructions.md` | `/legal/tokusho` | 旧指示書、`/legal/tokusho` が正本 |
| `docs/pricing/legal-commerce-v1.0.md` | — | URL 指定なし、内容の雛形 |

**Footer・既存規約・旧指示書すべて `/legal/tokusho` を指している**。`/legal/tokutei` を作っても誰もリンクしない。

---

## 5. AGENTS.md「触らないファイル」ルールとの照合

AGENTS.md(2026-04-20 追加ルール)より抜粋:

> 原則として `app/legal/**`、…は触らない。
> 例外が認められる条件:
> - 表示されるテキスト(日本語文言)の修正のみに限定
> - 構造変更・ロジック変更・フィールド追加削除は一切しない
> - 丸岡さんの明示的な合意を事前に得る
> - recon(読取調査 → 報告 → 合意 → 実装)の手順を必ず踏む

今回の依頼(`tokutei/page.tsx` **新規作成**)は:
- 文言修正ではなく「新規ファイル作成」 → 例外条件の範囲外
- `app/legal/**` 配下のため原則ルール該当
- **丸岡さんの明示的な合意を事前に得る必要がある**

---

## 6. Tailwind typography(`@tailwindcss/typography`) 有無

- `package.json` の関連 dep: `"@tailwindcss/postcss": "^4"` のみ
- **`@tailwindcss/typography` プラグインは未インストール**
- 既存 `privacy/page.tsx` `terms/page.tsx` は **inline style** で `prose` を使わず実装
- 既存 `tokusho/page.tsx` は **CSS Module**(`tokusho.module.css`)
- 新規ページも `prose` 前提の実装はできない(既存と同じ方式を踏襲するのが自然)

---

## 7. 懸念と確認事項(重要)

### 懸念 A: 特商法表記の二重掲載は法的に NG
特商法表記は事業者の法定開示。同一サービスに対して異なる URL で異なる(または同じ)内容のページが 2 つ存在する状態は、表示齟齬リスクと法令違反の懸念があります。`/legal/tokusho` を消さずに `/legal/tokutei` だけを追加するのは避けるべきです。

### 懸念 B: 既存 `/legal/tokusho` を残すなら `tokutei` を作る意義が不明
既存 `tokusho/page.tsx` は既にサブスクモデル対応済み(2026-04-20 最終更新)で、Footer からリンクされ、terms/privacy からも相互参照されています。これを差し置いて `tokutei` を作る理由が依頼文からは読み取れません。

### 懸念 C: AGENTS.md ルールで合意必須
`app/legal/**` 配下の新規作成は例外ルールの範囲外で、丸岡さんの明示的合意が前提です。

---

## 8. 丸岡さんへの確認事項

以下のいずれの方針でしょうか。選んでいただければ実装方針を確定します。

**選択肢 1: 何もしない(推奨)**
既存 `/legal/tokusho` がすでにサブスク対応で完成しているため、追加作業は不要。本 recon と指示の齟齬確認のみで終了。

**選択肢 2: `/legal/tokusho` → `/legal/tokutei` に URL リネーム**
`app/legal/tokusho/` を `app/legal/tokutei/` に mv し、Footer のリンクも `/legal/tokutei` に差し替え、`tokusho` → 301 redirect(next.config.js に追加)で運用。合意後に実施。
- 影響範囲: `app/legal/tokusho/*`, `components/Footer.tsx`, `next.config.js`(redirect 追加)、terms 内の相互リンクは無し
- 触らないファイル制約的に:「文言修正のみ」ではなく「ディレクトリ移動 + redirect 追加」なので **例外条件の明示合意が必要**

**選択肢 3: `/legal/tokutei` を `/legal/tokusho` と別内容で新設**
例:`tokutei` は簡略版表形式、`tokusho` は詳細版、など目的を分ける場合。ただし特商法表記を複数持つのは法的整合性に難があるため非推奨。

**選択肢 4: `/legal/tokutei` に新規作成し、既存 `/legal/tokusho` を削除**
完全リプレイス。選択肢 2 とほぼ同じ結果になるが、rename ではなく re-create のため git 履歴が切れる。Footer 更新 + tokusho ディレクトリ削除が必要。

---

## 9. 参考: 依頼文に含まれる旧指示書との齟齬

依頼文中の「`docs/legal-pages-instructions.md`」(2026-04-18、A-1 ラウンドの旧指示書)は **`/legal/tokusho` を正本として指示**しており、現在の依頼(`/legal/tokutei`)とは URL が異なります。今回の依頼は旧指示書のアップデート版なのか、別路線なのか(例: 税理士面談後 v1.1 の反映で URL を変える等)も併せて確認したいです。

---

## 10. 実装方針案(選択肢 1/2 のどちらかを仮に採る場合)

### 選択肢 1 採用時
実装作業なし。本 recon のみで終了。

### 選択肢 2 採用時(rename + redirect)
1. `main` から `feat/legal-tokutei-rename` ブランチを切る
2. `git mv app/legal/tokusho app/legal/tokutei`
3. CSS module 参照は相対 import なので内容変更不要(ファイル名も `tokusho.module.css` のままか、`tokutei.module.css` に合わせてリネーム)
4. `components/Footer.tsx:15` の `href` を `/legal/tokutei` に更新
5. `next.config.js`(または `next.config.ts`)に `/legal/tokusho` → `/legal/tokutei` の 308 permanent redirect 追加
6. `npm run build` / `npm run lint` 通過確認
7. PR 草稿を `docs/pr-drafts/legal-tokutei.md` に出力(gh CLI 未使用)

---

## 11. 待機事項

丸岡さんの判断が得られるまで実装は行いません。選択肢 1〜4 のどれで進めるか、または別方針をご指示ください。

以上。
