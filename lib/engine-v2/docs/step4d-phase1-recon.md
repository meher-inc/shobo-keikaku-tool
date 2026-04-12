# Step 4d Phase 1 事前調査: 委託関連別表 gating

調査日: 2026-04-12

---

## 1. v2 現状の appendix 処理フロー

### 京都 (adapters/kyoto-full.ts)

```
L112: const appendixListChildren = buildKyotoAppendixList(data);
L113: const appendixChildren = buildKyotoAppendices(data);
L118:   ...appendixListChildren,
L119:   ...appendixChildren,
```

`buildKyotoAppendices` (kyoto/appendices.ts:104-115) は全 9 別表を
**無条件で** spread する。gating 判定は一切ない。

### 東京 (adapters/tokyo-full.ts)

```
L72: const appendixListChildren = buildTokyoAppendixList();
L73: const appendixChildren = buildTokyoAppendices(data);
L78:   ...appendixListChildren,
L79:   ...appendixChildren,
```

`buildTokyoAppendices` (tokyo/appendices.ts:176-193) も全 12 別表を
**無条件で** spread。gating なし。

### appliesWhen フィールドの状態

**存在しない**。JSON 側 `appendices: []` は京都・東京とも空配列
(kyoto L310, tokyo L331)。別表は完全に TS builder で生成されており、
JSON の appendices フィールドは一度も使われていない。

---

## 2. v1 の gating ロジック

### 京都 (generate_kyoto_full.js)

```js
L202: if (d.has_outsourced_management) all.push(...buildAppendix1(d));
```

**別表1 のみ** を gating。別表2-9 は無条件出力。

### 東京 (generate_tokyo_full.js)

```js
L233-236:
if (d.has_outsourced_management) {
    all.push(...tkA1(d));
    all.push(...tkA2(d));
}
```

**別表1 + 別表2** を gating。別表3-11 は無条件出力。

---

## 3. to-render-data の確認

```ts
// to-render-data.ts:46
hasOutsourcedManagement: str(form.has_outsourced_management) ?? str(form.has_outsource),
```

**既に RenderData に流れている**。フォーム → route.ts POST body →
adapter toRenderData → `data.hasOutsourcedManagement` で
`"true"` or `"false"` or `undefined` が入る。追加の配線は不要。

---

## 4. JSON スキーマの状態と設計判断

### 現状

両 JSON ファイルの `appendices: []` は**空配列**。別表定義は JSON に
存在せず、全て TS builder が直接生成する。

### 指示書の JSON gating 設計との乖離

指示書は `"gating": { "whenOutsourced": true }` を JSON appendices
配列内に宣言する方式を提案しているが、**JSON に appendices 定義が
存在しない**ため、この方式をそのまま適用するには「別表定義を JSON に
移動する」という大規模リファクタが先に必要。

### 推奨: TS dispatcher レベルで gating

別表は TS builder 生成であるため、**dispatcher 関数内で条件分岐**
するのが最小影響 かつ Step 4b 以来の adapter-level gating パターン
と整合する。

```ts
// kyoto/appendices.ts buildKyotoAppendices
const outsourced = data.hasOutsourcedManagement === "true";
return [
  ...(outsourced ? buildOutsourceStatus(data, t, {...}) : []),
  // 別表2-9 は無条件
];
```

```ts
// tokyo/appendices.ts buildTokyoAppendices
const outsourced = data.hasOutsourcedManagement === "true";
return [
  ...(outsourced ? buildOutsourceStatus(data, t, {...}) : []),
  ...(outsourced ? buildTokyoApp2() : []),
  // 別表3-11 は無条件
];
```

**変更量: 各ファイル 2-3 行**。新規ファイル・スキーマ変更・型追加は不要。

---

## 5. 影響範囲サマリ

### 修正対象ファイル

| ファイル | 変更内容 |
|---|---|
| `builders/kyoto/appendices.ts` | dispatcher に outsourced 条件分岐(+2行) |
| `builders/tokyo/appendices.ts` | dispatcher に outsourced 条件分岐(+3行) |
| `docs/future-tasks.md` | 過剰出力問題を Closed 更新 |

### 新規ファイル: なし

### テスト追加箇所

`tests/kyoto-full-smoke.test.ts` と `tests/tokyo-full-smoke.test.ts` に
各 2 ケース追加:
- outsourced=true → 別表1(+東京は別表2)が含まれる
- outsourced=false → 別表1(+東京は別表2)が含まれない

### 出力 diff 予測

| ケース | 京都 | 東京 |
|---|---|---|
| outsourced=true | diff ゼロ(現状と同じ) | diff ゼロ |
| outsourced=false | サイズ減(別表1 分 ≈ 500-800 bytes) | サイズ減(別表1+2 分 ≈ 1000-1500 bytes) |

### Task 2-3 統合の提案

指示書の Task 2(スキーマ拡張+型定義) と Task 3(JSON gating 宣言)は、
上記の「TS dispatcher レベル gating」方式では**不要**。
代わりに **Task 2 = dispatcher 修正** + **Task 3 = テスト追加** に
統合を提案:

| 指示書 Task | 推奨 |
|---|---|
| Task 2 (スキーマ+型) | **skip** — スキーマ変更不要 |
| Task 3 (JSON gating) | **skip** — JSON appendices は空配列のまま |
| 代替 Task 2 | dispatcher 条件分岐を kyoto + tokyo に追加(2ファイル, ~5行) |
| Task 4 (テスト) | 代替 Task 3 に繰り上げ |
| Task 5 (疎通) | そのまま |
| Task 6 (future-tasks) | そのまま |

**想定コミット数: 3-4**(dispatcher修正 / テスト追加 / future-tasks更新 / 疎通確認後 push)

---

最終更新: 2026-04-12
