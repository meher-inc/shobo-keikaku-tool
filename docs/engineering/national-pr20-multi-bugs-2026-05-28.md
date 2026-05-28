# PR #20 マルチバグ修正 — 作業ログ 2026-05-28

## サマリ

- ブランチ: `fix/national-pr20-multi-bugs`
- ユーザ目視確認で検出された 4 カテゴリのバグを修正
  - **Cat C** (最優先): docx ファイル破損 (Word で開けない) 2 件
  - **Cat A**: 住所/氏名がラベルセルに入っており右隣の値セルに入るべき 11 件
  - **Cat B**: 申請者・届出者ブロックの右寄せ未適用 9 件
  - **Cat D**: hazmat-temporary-storage で「{{...}}倍」ラベル重複 1 件
- 加えて compress-handwriting-blanks スクリプトの再発防止バグ修正

## Cat C: 破損ファイル修復

### 症状
- `hazmat-name-quantity-change.docx`: `<w:r>` open=112 / close=113 (1 個余分)
- `hazmat-safety-supervisor.docx`: `<w:r>` open=123 / close=124 (1 個余分)
- Word で開けない (XML 破損)

### 原因
PR #19 の `compress-handwriting-blanks.mjs` の「連続 blank run 群を 1 つに圧縮」ロジックが、
複数 `<w:p>` をまたぐ範囲で `<w:r>...</w:r>` 群を一括削除してしまい、
途中の `</w:p><w:p>` を巻き込むケースで XML 不整合が発生。

### 修復
- ~/Desktop/fdma-docx/ のソース docx は健全であることを確認
- 2 つの破損ファイルをソースからコピー復元
- 復元後 render-all-samples / verify-no-blanks 共に成功

### 再発防止 (scripts/compress-handwriting-blanks.mjs)
1. **`<w:p>` 境界尊重**: run 圧縮処理を `paraRe.replace()` 内で行うよう変更し、paragraph をまたいだ削除を構造的に不可能化
2. **バランス検証 (safety net)**: 修正後 cell の `<w:r>` open/close 数が不一致なら変更を撤回 (`return cellXml`)
3. **whitespace 判定強化**: `/^[\s 　]+$/` (半角含む) で blank 判定

修正後の再実行で **0 corruption** を確認 (3 ファイル diagnose 全 final depth=0)。

## Cat A: 住所/氏名を値セルに移動

### 修正対象 11 セル

| Pack | Row.fromCell → toCell | var |
|------|----------------------|-----|
| hazmat-facility-permit | R2.c2→c3 | ownerAddress |
| hazmat-facility-permit | R3.c2→c3 | ownerName |
| hazmat-facility-change-permit | R5.c2→c3 | ownerAddress |
| hazmat-facility-change-permit | R6.c2→c3 | ownerName |
| hazmat-facility-abolition | R2.c2→c3 | ownerAddress |
| hazmat-prevention-rules-approval | R2.c2→c3 | ownerAddress |
| hazmat-temporary-storage | R3.c2→c3 | ownerAddress |
| hazmat-temporary-storage | R4.c2→c3 | ownerName |
| hazmat-transfer | R2.c2→c3 | ownerAddress |
| hazmat-transfer | R4.c2→c3 | transferorAddress |

注: `hazmat-facility-abolition R3` (氏名) と `hazmat-transfer R3/R5` (氏名) は既に c3 に値があり対応済。
`building-use-start R2` は c1=label(住所), c2=value(wide cell) 構造で既に正しいため Cat A 修正不要 (Cat B のみ適用)。

### 実装
- c1 (rowspan section header) / c2 (label only) / c3 (wide value cell with gridSpan=9) 構造を確認
- 対象 cell の `<w:r>{{var}}</w:r>` を削除し、隣接 c3 の先頭 `<w:p>` に同 run (rPr 維持) を移動
- 既に c3 に他 var がある場合 (例: ownerPhone) は前に挿入

### 追加: separator 挿入 (hazmat-facility-permit)
hazmat-facility-permit のみ c3 が `{{ownerPhone}}` のみで「電話」label が無かった。
移動後 `{{ownerAddress}}{{ownerPhone}}` 直結を回避するため、間に `　電話　` を含む新 `<w:r>` を挿入。

## Cat B: 右寄せ適用 (9 セル)

### 修正対象

| Pack | Row.Cell |
|------|---------|
| hazmat-comprehensive-safety-supervisor | R1.c1 (申請者ブロック全体) |
| building-use-start | R2.c2 (所在地+電話) |
| hazmat-facility-abolition | R1.c1 |
| hazmat-facility-change-permit | R4.c1 |
| hazmat-facility-permit | R1.c1 |
| hazmat-prevention-rules-approval | R1.c1 |
| hazmat-temporary-use | R1.c1 |
| hazmat-transfer | R1.c1 |
| minor-hazmat-notification | R1.c1 |

### 実装
対象 cell 内の各 `<w:p>` について:
- 既存 `<w:pPr>` あり: 内側の `<w:jc .../>` を削除 + `<w:jc w:val="right"/>` を末尾追加
- `<w:pPr>` なし: `<w:p ...>` 直後に `<w:pPr><w:jc w:val="right"/></w:pPr>` 挿入

## Cat D: hazmat-temporary-storage 「倍」重複

### 症状
Row 6.c4 が `{{designatedQuantityMultiple}}倍`。ユーザが「5倍」と入力すると `5倍倍` になる。

### 修正
1. テンプレ docx の cell から 末尾「倍」を削除 → `{{designatedQuantityMultiple}}` のみに
2. UI metadata に placeholder/helpText 追加: 「例: 5倍」「単位「倍」も含めて入力してください」

## 検証結果

| 項目 | 値 |
|------|------|
| `npm run typecheck` | ✅ clean |
| `npm test` | ✅ 184 passed |
| `npm run build` | ✅ success |
| `node tmp/render-all-samples.mjs` | ✅ Pass: 12 / Fail: 0 |
| `node tmp/verify-no-blanks.mjs` | ✅ 12 books 0 blank |
| `node tmp/diagnose-docx-corruption.mjs` | ✅ depth=0 全 docx |
| `node tmp/check-duplicates.mjs` | ✅ 0 重複 |

## ファイル変更

### 新規
- `docs/engineering/national-pr20-multi-bugs-2026-05-28.md` (本ファイル)

### 編集
- `lib/engine-v2/national/templates-official-metadata.ts` — designatedQuantityMultiple に placeholder/helpText
- `lib/engine-v2/national/templates-official/*.docx` — 11 ファイル修正
  - 2 復元 (hazmat-name-quantity-change / hazmat-safety-supervisor)
  - 9 Cat A/B/D 適用

## 不明点 (作業ログ記録、別 PR 対応推奨)

- compress-handwriting-blanks 修正後の再実行で 17 cells 圧縮済 (Cat C ファイルにも安全に適用)
  → 今後の Long blank 再発は同スクリプトを使えば安全 (バランス検証あり)
- 右寄せ Cat B は「申請者ブロック全体」を right-align しているが、もし「住所行のみ右寄せ、電話行は左寄せ」等の細かい意図があれば再調整が必要
- Cat A で hazmat-facility-permit のみ separator (「電話」label) を後追い挿入。他 pack は元々 c3 に label があったため不要
