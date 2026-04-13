# Step 6b 事前調査レポート: body indent + ch1 heading placeholder

調査日: 2026-04-13

---

## A. Body paragraph indent

### A1. v1 の実装

v1 は **2 レベルの indent** のみ:

| レベル | 関数 | indent 値 | 用途 |
|---|---|---|---|
| 0 (normal) | `txt()`, `item()` | なし (0 DXA) | 本文段落、⑴⑵⑶ 番号付き項目 |
| 1 (subitem) | `subitem()` (kyoto L33), `si()` (tokyo L21) | `{left: 420}` (≈7.4mm) | ア/イ/ウ、①/②、(ア)/(イ)、マーカーなし説明文 |

420 DXA は京都・東京で**統一**。章による不統一なし。

### A2. v2 の現状

- `shared/paragraph-helpers.ts` の `plainText()`: indent パラメータなし
- `builders/paragraph.ts` の `buildSectionBody()`: 全行同一フォーマットの Paragraph
- JSON スキーマ (`template-pack.ts`): indent 関連フィールドなし
- JSON body: 全行 `\n` で連結された text ノード。subitem 行は先頭に `　` + マーカー文字を含むが、これは text content の一部であり indent metadata ではない

### A3. JSON 内の subitem 行の分類

| パターン | 京都 | 東京 | 合計 | ヒューリスティック検出可? |
|---|---|---|---|---|
| `　ア　`, `　イ　` 等 (カタカナマーカー) | 43 | 6 | 49 | ✅ 検出可 |
| `　(ア)`, `　(イ)` 等 (括弧カタカナ) | 4 | 0 | 4 | ✅ 検出可 |
| `　①　`, `　②　` 等 (丸数字) | 0 | 11 | 11 | ✅ 検出可 |
| マーカーなし説明文 (例: `　防火管理者は...`) | 2 | 10 | **12** | ❌ 検出不可 |
| **合計** | **49** | **27** | **76** | 64/76 = **84%** |

### A4. false positive (indent すべきでないが `　` 始まりの行)

| 行 | ファイル | v1 での扱い | 原因 |
|---|---|---|---|
| `　休日、夜間において無人となる場合は、` | kyoto ch7-security | `txt()` (indent=0) | 段落先頭の字下げ(日本語慣例) |
| `　消防計画概要版を作成し...` | tokyo ch11-misc | `txt()` (indent=0) | 同上 |

2 行のみ。ヒューリスティック「`　` 始まり → indent」を使うと false positive。

### A5. 設計方針の比較

| 方針 | JSON 改変量 | render 改変量 | 正解率 | 誤判定リスク | 拡張性 |
|---|---|---|---|---|---|
| **(α) スキーマに `indent` フィールド追加** | 全 subitem 行に annotation (76 行 × 2 pack) | buildSectionBody に indent 参照追加 | **100%** | ゼロ | 高(任意値対応) |
| **(β) マーカー検出ヒューリスティック** | ゼロ | buildSectionBody に regex 判定追加 | **84%** (64/76) | FP ゼロ、FN 12 行 | 低(マーカーなし対応不可) |
| **(γ) `　` 始まり全行 indent** | ゼロ | 1 行 if 文 | 97% (74/76) | FP 2 行 | 中 |

### A6. 推奨: **(β) マーカー検出ヒューリスティック**

理由:
- **JSON 変更ゼロ** — 76 行 × 2 pack の annotation は工数大・typo リスク
- 84% カバレッジ(64/76 行)で、見た目上の最大改善
- 残り 12 行は先頭 `　` による視覚インデント(~3mm)が既にあり、構造 indent なしでも読める
- FP ゼロ — ア/イ/ウ/①/② マーカーは常に subitem
- FN 12 行は Step 6c として(α)方式で後追い可能

regex: `/^[　]*([ア-ン]　|\([ア-ン]\)|[①-⑳])/`

---

## B. Ch1 heading placeholder 置換

### B1. ハードコード箇所の特定

**京都 kyoto-city.full.json ch1:**

| セクション | JSON 内の状態 | v1 のコード | 問題 |
|---|---|---|---|
| ch1-purpose (目的) | **legalBasis placeholder 済** (Step 6a Task 4) | L238-239 | ✅ 解消済み |
| (適用範囲) | **JSON に存在しない** | L241-246 (⑴⑵ + outsourced 時 ⑶) | ❌ section 自体が欠落 |
| (委託) | **JSON に存在しない** | L248-253 (heading に `〔該当/非該当〕` + gated body) | ❌ section 自体が欠落 + heading conditional |

**東京 tokyo-tfd.full.json ch1:**

| セクション | JSON 内の状態 | v1 のコード | 問題 |
|---|---|---|---|
| ch1-purpose | body は静的(法令条文なし) | L268-269 | ✅ 問題なし |
| ch1-scope | managementScope placeholder | L270-272 | ✅ 解消済み |
| ch1-outsource | adapter gated、heading に suffix なし | L274-281 | ✅ 解消済み |

### B2. 京都 ch1 の残作業(scope 判断が必要)

京都の ch1 は v1 で 3 subsection あるが、v2 JSON には **section 1(目的)しかない**。Step 4a で「既存 sample のコピー」として ch1 は目的だけにした名残。

**完全化に必要な作業:**

1. `kyoto-city.full.json` ch1 に 2 つの section を追加:
   - `ch1-scope` (適用範囲): ⑴⑵ items + outsourced 時 ⑶(adapter gating)
   - `ch1-outsource` (委託): heading に `〔${outsourcedLabel}〕` suffix + gated body 3 items

2. heading conditional suffix の実装:
   - 現 `buildSectionHeading` は plain string → placeholder 解決なし
   - 選択肢:
     - **(i)** `buildSectionHeading` を拡張して heading 内 placeholder 解決
     - **(ii)** SectionOverride で heading ごと TS builder で生成
     - **(iii)** heading を BodyNode[] 型に変更(大規模 schema 変更)
   - **推奨: (ii)** SectionOverride — kyoto ch1-outsource だけの narrow scope

3. adapter gating:
   - `ch1-scope` の item ⑶(outsourced 時のみ): 新規 section `ch1-scope-outsource-item` を adapter filter
   - `ch1-outsource` body: adapter filter で outsourced=false 時スキップ(東京と同パターン)

### B3. v1 全分岐の列挙(京都 ch1)

| 条件 | v1 行 | 影響 | v2 での対応方針 |
|---|---|---|---|
| `unified` → legalBasis | L238 | body word swap | ✅ Step 6a で placeholder 済 |
| `outsourced` → 適用範囲 ⑶ | L244-246 | item 追加 | adapter section gating |
| `outsourced` → 委託 heading suffix | L248 | heading word swap | SectionOverride |
| `outsourced` → 委託 body | L249-253 | 3 items 追加 | adapter section gating |

### B4. 東京 ch1 の状態

東京は既に**完全**:
- ch1-purpose: 静的(条件分岐なし)
- ch1-scope: placeholder 済(managementScope)
- ch1-outsource: adapter gating 済(heading に suffix なし)

**東京は Step 6b scope 外**。

---

## C. スコープ整合性

### 既存テストへの影響

- `kyoto-full-smoke.test.ts` は `expect(xml).toContain("第１　目的及びその適用範囲等")` のみ ch1 に言及。section 追加は chapter heading に影響しないため **テスト破壊なし**。
- section 追加により出力サイズが微増するが、既存 size assertion は `> 5000` で余裕あり。

### 東京 pack への波及

**なし**。B の作業は京都 ch1 のみ。

---

## 推奨実装方針

### Step 6b scope

| # | 項目 | scope | 理由 |
|---|---|---|---|
| A | body indent (マーカー検出) | **含める** | JSON 変更ゼロ、render 変更 ~10 行、84% カバレッジ |
| B1 | 京都 ch1 section 2/3 追加 | **含める** | v1 忠実再現の一環、scope は kyoto JSON + adapter のみ |
| B2 | heading conditional suffix | **含める** | SectionOverride で narrow scope 対応 |
| (B3) | マーカーなし subitem の indent 完全対応 | **defer → 6c** | schema 変更 or context-aware heuristic が必要 |

### Task 分割案

| Task | 内容 | コミット数 |
|---|---|---|
| Task 1 | `buildSectionBody` にマーカー検出 indent ヒューリスティック追加 | 1 |
| Task 2 | kyoto ch1 section 2/3 を JSON に追加 + adapter gating | 1 |
| Task 3 | kyoto ch1-outsource の heading suffix を SectionOverride で実装 | 1 |
| Task 4 | smoke test 追加(indent 存在確認 + ch1 outsource on/off) | 1 |
| Task 5 | 本番疎通 + クローズ | 1 |
| **合計** | | **5** |

### 想定リスク

| リスク | 確率 | 対策 |
|---|---|---|
| indent ヒューリスティックで既存 smoke test の XML 構造変化 | 低 | 文字列 toContain assertion は Paragraph 属性変更に影響されない |
| kyoto ch1 section 追加で kyoto smoke 出力サイズ変化 | 低 | size assertion は `> 5000` で余裕 |
| SectionOverride body-only semantics の例外(heading ごと override) | 中 | ch1-outsource 専用の narrow override — heading + body を両方返す |

### 停止基準の判定

| 基準 | 結果 |
|---|---|
| JSON スキーマの大幅改変(5 フィールド以上) | **非該当**(0 フィールド追加) |
| ヒューリスティック誤判定が JSON に存在 | **FP ゼロ、FN 12 行(許容範囲)** |
| ch1 以外の章に波及するハードコード | **非該当**(京都 ch1 のみ) |
| v1 indent 値が章ごとに不統一 | **非該当**(全章 420 DXA 統一) |
| Task 総数 > 10 | **非該当**(5 Tasks) |

---

最終更新: 2026-04-13
