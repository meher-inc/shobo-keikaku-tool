# 全国統一様式 Phase 4 + 拡張機能 — 作業ログ 2026-05-27

## サマリ

- ブランチ: `feat/national-phase4-and-extensions`
- 3 タスクを並行実装:
  1. **Task 1 (Phase 4)**: レガシー 11 pack + 12 docx pack の JSON 変数名を docxtemplater 命名に揃える
  2. **Task 2a**: checkbox 変数のレンダラ拡張 (true/false → ☑/□)
  3. **Task 2b**: 統括/保安監督者 複数名対応 (改行区切り入力)
  4. **Task 3**: Long blank (手書き用空白フィラー) 圧縮

## Task 1: JSON 変数名整合

### 12 公式 docx pack: JSON 完全再生成
`templates-official-metadata.ts` を SSOT として、各 pack の `templates/*.json` を機械生成。

- top-level メタ (packName/title/legalRef/summary/preamble/footnotes 等) は維持
- submitterFields / headerFields / sections を metadata 由来で置換
- 結果: JSON の field key が docxtemplater の `{{var}}` と完全一致

実装: `tmp/align-json-to-metadata.mjs` (snapshot を tsx 経由で生成)

### レガシー 11 pack: 命名規約に従う rename
明確に semantic 一致するもののみ rename:

| 旧 | 新 | 影響 pack 数 |
|----|----|----|
| `buildingUse` | `mainUse` | 6 packs |

その他の rename 候補 (`floorArea`/`buildingArea`, `fireDeptName`/`recipientTitle` 等) は意味が完全一致せず未適用。作業ログに記録のうえ別 PR で再評価。

### 検証
- 全 179 既存テスト pass (registry parse、render-docx 等)
- metadata-coverage test (12 pack × 2 = 24) も pass: meta ⇔ docx 完全一致維持

## Task 2a: checkbox レンダラ拡張

### 変更
- `lib/engine-v2/national/render-docxtemplater.ts`:
  - `CHECKED_MARK = "☑"`, `UNCHECKED_MARK = "□"` を export
  - `toBoolean()` helper: `true/false` (boolean), `"true"/"false"`, `"on"/"off"`, `"1"/"0"`, `"yes"/"no"` を許容
  - render 時に metadata から checkbox 型 field を抽出し、該当 key の値を ☑/□ に変換
- `lib/engine-v2/national/templates-official-metadata.ts`:
  - `FieldType` に `"checkbox"` を追加
- `app/national/_components/national-form-official.tsx`:
  - checkbox 型は HTML `<input type="checkbox">` でレンダ
  - 値は `"true"` / `"false"` 文字列で form state 管理 (Zod schema は enum で検証)
  - デフォルト値 `"false"`、必須時は `"true"` 必須

### 既知の限界
- 現状の 12 公式 pack metadata には checkbox 型 field なし
- ユーザの「kindFireMark等」言及はインフラ整備の要求と解釈
- 今後 metadata で `{ key: "...", type: "checkbox", ... }` を追加すれば自動で動く

### テスト
- `render-checkbox-multi.test.ts`: 定数 export 動作確認、既存 12 pack 互換性 (checkbox 無くても動く)

## Task 2b: 複数名対応 (統括管理者・保安監督者)

### 設計判断
- テンプレート docx の構造は単一 row (FDMA 公式仕様)。row を増やすことはできない
- 代替案: **改行区切り文字列で複数値を表現**
  - docxtemplater 設定 `linebreaks: true` (既設定) により改行 `\n` が `<w:br/>` (改行) としてレンダされる
  - 「山田 太郎\n佐藤 次郎」→ docx 内に 2 行表示

### 変更
`templates-official-metadata.ts` で `hazmat-comprehensive-safety-supervisor` / `hazmat-safety-supervisor` の選任・解任 field を `multiline` 型に変更し、helpText で複数行入力方法を案内。

対象 field (各 pack):
- appointedName, appointedPosition / appointedLicense
- appointmentDate (multiline 化、日付ピッカー喪失と引き換えに複数日付対応)
- dismissedName, dismissedPosition / dismissedLicense
- dismissalDate

### UI
form-official.tsx は multiline 型を textarea で render (既存)、helpText が field 下に表示される

### 既知の限界 (作業ログ記録のみ)
- 複数名と複数日付の対応関係は「行順」 規約 (氏名 N 行目 = 役職 N 行目 = 日付 N 行目)
- バリデーション: 各 multiline の行数一致は未検証 (UI で警告するか別 PR)
- 日付 field の型を `date` から `multiline` に変更したため、ブラウザの日付ピッカー UI が使用できない (引き換え)

### テスト
- `render-checkbox-multi.test.ts`: 改行区切り入力で 2 つの supervisor pack をレンダリングし、複数名がテキスト内に存在することを確認

## Task 3: Long blank 圧縮

### 実装
`tmp/compress-handwriting-blanks.mjs` で 12 公式 docx を処理:
1. セルに `{{var}}` が含まれる場合のみ処理 (純ラベルセルは skip)
2. (a) `<w:t>` ノード単独で whitespace-only ≥5 文字 → 単一空白に圧縮
3. (b) `<w:t>` ノード内 (label/var 含む) で whitespace 連続 ≥5 → 単一空白に圧縮
4. (c) 連続する whitespace-only `<w:r>` 群 → 最初の 1 つに統合

### 結果
- Long blank: 25 → **8** 削減
- 残 8 は **すべて pure label cell** (decorative spacing 内蔵、変数なし):
  - "選 任" / "解 任" / "※経過欄" / "※備考" / "譲渡又は引渡のあつた理 由" 等
  - これらは FDMA 原本の label レイアウトでの意図的な装飾空白
  - 圧縮すると label の見た目が変わるため、保守的に skip
- 全 12 docx の render は引き続き成功、空欄ゼロも維持

### 検証
- `verify-no-blanks.mjs`: 12 books すべて 0 blank (維持)
- `compare-layout-extended.mjs`: A=0, B=0, D=0, C=8 (残 label decoration)

## 検証結果サマリ

| 項目 | 値 |
|------|------|
| `npm run typecheck` | ✅ clean |
| `npm test` | ✅ 184 passed (179 既存 + 5 new) |
| `npm run build` | ✅ success |
| `verify-no-blanks.mjs` | ✅ 12 books 0 blank |
| `compare-layout-extended.mjs` | A=0 / B=0 / C=8 (label decoration) / D=0 |
| `check-duplicates.mjs` | ✅ 0 重複 |

## ファイル変更一覧

### 新規
- `lib/engine-v2/national/__tests__/render-checkbox-multi.test.ts` — Task 2a/2b 動作確認
- `docs/engineering/national-phase4-extensions-2026-05-27.md` (本ファイル)

### 編集
- `lib/engine-v2/national/render-docxtemplater.ts` — checkbox 変換 + multiline 区切り対応
- `lib/engine-v2/national/templates-official-metadata.ts` — `FieldType` 拡張、supervisor pack の multiline 化
- `app/national/_components/national-form-official.tsx` — checkbox UI 対応
- `lib/engine-v2/national/templates/*.json` (23 files) — JSON 変数名整合
- `lib/engine-v2/national/templates-official/*.docx` (11 files) — Long blank 圧縮

## 不明点 (作業ログ記録のみ、別 PR 対応推奨)

- レガシー 11 pack の追加 rename 候補 (`floorArea`/`buildingArea` 等) は semantic 不一致のため未適用
- supervisor 複数名対応で 改行行数の不一致 (氏名 3 行 vs 日付 2 行 等) は未バリデーション
- supervisor 日付 field の date → multiline 化により date picker UI 喪失 (引き換え)
- checkbox 型 field を要する具体的 pack はまだ未追加 (インフラのみ整備)
- 残 Long blank 8 件は label decoration で意図的に保留
