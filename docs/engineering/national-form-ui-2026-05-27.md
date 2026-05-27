# 全国統一様式 フォーム UI 実装 + value-before-label 修正 — 作業ログ 2026-05-27

## サマリ

- ブランチ: `feat/national-form-ui-and-layout-fix`
- 2 つのタスクを並行実装:
  1. **Task 1**: PR #17 で残った value-before-label 18 件を修正 (`{{ownerAddress}}住所` → `住所　{{ownerAddress}}`)
  2. **Task 2**: 12 公式テンプレ書類に対する動的フォーム UI を実装 (RHF + Zod、モバイル対応)

## Task 1: Value-before-label 修正

### Cat A: シンプル 2-run セル swap (13 件)
`<w:r>{{var}}</w:r><w:r>label</w:r>` パターンを単純に逆順 swap:

| Pack | 修正セル |
|------|----------|
| hazmat-temporary-storage | Row 3.c2, 4.c2, 10.c2, 11.c2 |
| hazmat-facility-permit | Row 2.c2, 3.c2 |
| hazmat-facility-change-permit | Row 5.c2, 6.c2 |
| hazmat-transfer | Row 2.c2, 4.c2 |
| hazmat-name-quantity-change | Row 2.c2 |
| hazmat-facility-abolition | Row 2.c2 |
| hazmat-prevention-rules-approval | Row 2.c2 |

### Cat B: 多段ノード 申請者ブロック (5 件)
multi-node patcher で各書類の Row 01 (または 02/04) に `submitterAddress` / `submitterPhone` / `submitterName` を正しい位置に挿入:

| Pack | Row | 修正内容 |
|------|-----|----------|
| minor-hazmat-notification | Row 1.c1 | submitterAddress を 住所 と 電話 の間に挿入 |
| hazmat-temporary-storage | Row 2.c1 | (電話) parens 復元 + submitterAddress + submitterName |
| hazmat-facility-change-permit | Row 4.c1 | submitterPhone を (電話 ) で囲む |
| hazmat-comprehensive-safety-supervisor | Row 1.c1 | submitterAddress 追加 |
| hazmat-transfer | Row 4.c3 | transferorPhone を 電話 label の後ろに swap |

### 追加: 5 書類に submitterAddress 挿入 (フォーム UX のため)
- hazmat-temporary-use, hazmat-transfer, hazmat-name-quantity-change, hazmat-safety-supervisor, hazmat-prevention-rules-approval

### 検証結果

| 項目 | 修正前 (PR #17) | 修正後 |
|------|-----------------|--------|
| A. JC alignment mismatch | 0 | **0** |
| A. IND indent mismatch | 0 | **0** |
| B. Value-before-label (厳密) | 18 → 5 (false positive) | **0** |
| C. Long blank (≥8 chars) | 26 | 24 (微減、本 PR スコープ外) |
| D. rPr loss | 0 | **0** |

※ B の 5 false positive は detector regex の "0 char between var and label" 化により正常判定。実体は `{{var}}　LABEL` (separator あり) で正しい layout。

## Task 2: フォーム UI 実装

### アーキテクチャ
- **メタデータ層**: `lib/engine-v2/national/templates-official-metadata.ts`
  - 12 公式 pack 各々の section/field 定義 (label, type, required, placeholder, helpText)
  - 共通 field を再利用可能な定数として宣言
- **動的フォーム**: `app/national/_components/national-form-official.tsx`
  - `OfficialPackMeta` を受け取り Zod schema を動的生成
  - React Hook Form + zodResolver でバリデーション
  - field type: `text` / `multiline` / `date` / `phone` / `number`
  - phone は `/^[\d\-+\s()]*$/`, number は `/^[\d,.]*$/` で形式検証
  - 任意項目は ラベルに「（任意）」 表示
  - エラー時: 最初のエラー field に focus + scroll
- **page.tsx 更新**: `getOfficialPackMeta(packName)` で公式テンプレ pack を判定し、
  該当時は `NationalFormOfficial` を、それ以外は既存 `NationalForm` を使用 (並行運用)

### モバイル対応 (375px)
- `font-size: 16px` で iOS auto-zoom 防止
- `min-height: 44px` でタッチターゲット確保
- mobile-first CSS: 単列レイアウト → `@media (min-width: 640px)` で 2 列
- submit ボタンは mobile では full-width、desktop では右寄せ auto

### 動作確認
- `npm run typecheck` ✅ clean
- `npm test` ✅ 179 passed (24 new metadata-coverage tests)
- `npm run build` ✅ success
- dev server 起動 → `/national/hazmat-facility-permit` → 307 redirect to login (access guard 正常動作)

### 新規テスト: metadata-coverage.test.ts
12 pack × 2 = 24 テストで以下を保証:
1. metadata の field key ⊆ docx の `{{var}}` (定義済みだが docx に無い key を検出)
2. docx の `{{var}}` ⊆ metadata の field key (docx にあるが UI で入力できない key を検出)

`{{var}}` 検出は `<w:t>` ノード分割を考慮して全テキスト連結後に regex 適用 (docxtemplater の挙動準拠)。

## ファイル変更一覧

### 新規
- `lib/engine-v2/national/templates-official-metadata.ts` — 12 pack のフォームメタデータ
- `app/national/_components/national-form-official.tsx` — 動的フォームコンポーネント
- `lib/engine-v2/national/__tests__/metadata-coverage.test.ts` — meta/docx 整合性テスト
- `docs/engineering/national-form-ui-2026-05-27.md` (本ファイル)

### 編集
- `app/national/[docType]/page.tsx` — 公式テンプレ pack で新フォーム使用 (フォールバック付き)
- `lib/engine-v2/national/templates-official/*.docx` (12 ファイル) — Task 1 修正 + submitterAddress 追加

### 依存追加
- `react-hook-form ^7.76.1`
- `@hookform/resolvers ^5.4.0`

## 既知の未解消 (次 PR スコープ外)
- **C. Long blank (24 件)**: 公式テンプレ由来の手書き用空白フィラー (PR #17 で記録済)
- **Phase 4**: レガシー pack (11 件) の JSON field key と template var の整合化 (PR #17 で記録済)
- **チェックボックス系** (免状の有無等) の変数化方針確定
- **統括管理者/保安監督者** の複数名対応
