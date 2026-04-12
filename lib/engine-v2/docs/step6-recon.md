# Step 6 事前調査レポート: Visual Degradation 解消

調査日: 2026-04-12
対象: `lib/generate_kyoto_full.js` / `lib/generate_tokyo_full.js`

---

## 5項目の v1 実装箇所と v2 移植評価

| # | 項目 | v1 京都 | v1 東京 | 実装難度 | v2 移植スコープ | 備考 |
|---|---|---|---|---|---|---|
| 1 | cover page（表紙） | L222-233: Paragraph×4 + pb() | L257-263: Paragraph×4 + pb() | 低 | TS builder 1本 (shared/cover-page.ts) | 画像/罫線なし、Paragraph のみ。京都は `統括防火管理〔該当/非該当〕` 行あり(条件分岐) |
| 2 | header/footer + ページ番号 | L519-526: Header/Footer 内 Paragraph | L531-535: 同構造 | 低 | adapter の Document 構築時に sections.properties に追加 | `PageNumber.CURRENT` フィールドコード使用。ロゴ画像なし |
| 3 | body paragraph indent | L27,33-34: `txt(text, {indent})` + `subitem(text, indent=420)` | L19,21: `txt(t, {indent})` + `si(t, indent=420)` | 中 | shared/paragraph-helpers.ts に indent 対応追加 + JSON body 側で indent マーカー | v2 で落ちている理由: paragraph-helpers の plainText() が indent 引数を取らない |
| 4 | ch8 tsunami footer italic+gray | L431: `txt("※京都市は...", {italics:true, color:"666666", size:18})` | なし(東京には該当なし) | 低 | kyoto-city.full.json の body テキスト or TS builder | TextRun に italics+color を渡すだけ |
| 5 | ch1 legalBasis/outsource/unified ハードコード | L229,238,248,478: 4箇所 | L274: outsource 1箇所のみ | 中 | adapter の RenderData 注入 + JSON placeholder 化 | 京都が4箇所(legalBasis, 統括label, 委託label, 別表一覧) |

---

## 詳細分析

### 1. cover page（表紙）

**京都** (L222-233):
```
Paragraph: d.company_name || d.building_name (36pt bold 游ゴシック, center, before:4000)
Paragraph: "消防計画" (56pt bold 游ゴシック, center)
Paragraph: "統括防火管理〔${unified ? "該当" : "非該当"}〕" (22pt 游明朝, center)
Paragraph: "${d.creation_date}作成" (22pt 游明朝, center)
PageBreak
```

**東京** (L257-263):
```
Paragraph: d.building_name (36pt bold 游ゴシック, center, before:4000)
Paragraph: "消防計画" (56pt bold 游ゴシック, center)
Paragraph: "【中規模用】" (24pt 游ゴシック, center, color:#C41E3A)
Paragraph: "${d.creation_date}作成" (22pt 游明朝, center)
PageBreak
```

**差分**: 京都3行目は条件分岐テキスト、東京3行目は固定テキスト(カラー付き)。
**構造**: 全て Paragraph。Image/Shape/罫線なし。Center alignment + spacing のみ。
**移植方針**: `shared/cover-page.ts` に `buildCoverPage(data, opts: {dept, ...})` を作り、adapter が呼ぶ。`buildChildrenFromPack` 結果の先頭に挿入。

### 2. header/footer + ページ番号

**京都** (L519-526):
```ts
headers: {
  default: new Header({ children: [
    Paragraph(RIGHT, TextRun(`${building_name}　消防計画`, 16pt 游ゴシック #999999))
  ]})
},
footers: {
  default: new Footer({ children: [
    Paragraph(CENTER, TextRun(PageNumber.CURRENT, 18pt 游ゴシック))
  ]})
}
```

**東京** (L531-535): 同構造、header text が `${building_name}　消防計画（東京消防庁様式）`。

**構造**: `Document.sections[0].properties` の `headers`/`footers` プロパティ。`PageNumber.CURRENT` は docx-js の組み込みフィールドコード (`PAGE` 相当)。`NUMPAGES` は未使用。

**移植方針**: adapter の Document 構築時(`new Document({sections: [{properties: {headers, footers}, children}]})`で直接指定。現状 adapter は `new Document({sections: [{children}]})` のみなので、properties 追加が必要。変更量は adapter 内 5-10 行。

**v2 で落ちている理由**: `buildDocument` / adapter が `sections[0].properties` に headers/footers を設定していない。properties 自体を渡す仕組みがない。

### 3. body paragraph indent

**v1 実装**:
- `txt(text, opts)` — L27(京都)/L19(東京): `indent: opts.indent ? {left: opts.indent} : undefined`
- `subitem(text, indent=420)` — L33-34(京都): `txt(\`　${text}\`, {indent})`
- `si(text)` — L21(東京): `txt(\`　${text}\`, {indent: 420})`

420 DXA ≒ 7.4mm 左インデント。全角スペース`　`の先頭追加はテキスト側でも行っている(二重インデント: 視覚 + structural)。

**v2 で落ちている理由**: `shared/paragraph-helpers.ts` の `plainText(text)` が indent 引数を受け取らない。`buildSectionBody` は全行を同一フォーマットの Paragraph で emit — indent 情報がどこにもない。

**移植方針**: 2 つのアプローチが考えられる:
- **(A) paragraph-helpers に indent 対応追加**: `plainText(text, opts?: {indent?: number})` にシグネチャ変更。`buildSectionBody` が行先頭の `　ア` 等のパターンを検出して indent 付き Paragraph を emit。
- **(B) JSON に indent hint**: body node に `{type: "text", value: "...", indent: 420}` のようなオプショナルフィールド追加 → schema 拡張が必要。

**推奨**: **(A)**。schema 拡張なしで対応可。`buildSectionBody` で行先頭が全角スペース `　` で始まる場合に `left: 420` を適用するヒューリスティックが最もシンプル。

### 4. ch8 tsunami footer italic+gray

**v1** (京都 L431):
```ts
txt("※京都市は津波による被害が想定されていないため、南海トラフ地震に関する計画の記載義務はありません。",
    { italics: true, color: "666666", size: 18 })
```

TextRun に `italics: true, color: "666666", size: 18` を渡すだけ。

**v2 現状**: `kyoto-city.full.json` の `ch8-tsunami-note` セクションの body に plain text として格納。`buildSectionBody` は TextRun に固定スタイル(`size: 21, font: 游明朝`)で emit するため、italic/color/size override ができない。

**移植方針**: 選択肢:
- **(A) TS builder override**: ch8-tsunami-note を SectionOverride にして、TS builder 内で直接 italic+gray の TextRun を生成。
- **(B) TextNode schema 拡張**: `{type: "text", value: "...", style: {italics: true, color: "666666"}}` — schema 変更が必要。
- **(C) buildSectionBody にスタイルヒント**: body 内の特定 marker(`※` で始まる行など)を検出してスタイル変更。

**推奨**: **(A)**。影響範囲最小。京都のみの固有表記なので TS builder が適切。

### 5. ch1 legalBasis/outsource/unified ハードコード

**現状の v2 ハードコード箇所**:

京都 `kyoto-city.full.json`:
- ch1-purpose body: `"消防法第８条第１項"` (unified=false 固定) → placeholder `legalBasis` に置換可
- (ch1-outsource: adapter gating 済み — section 自体の出力制御は OK だが、section heading の `〔非該当〕` suffix がない)

京都 `kyoto/appendices.ts`:
- buildKyotoAppendixList: `applicableLabel(outsourced)` で動的 — **済み**

東京 `tokyo-tfd.full.json`:
- ch1-outsource: adapter gating 済み

**残り placeholder 化候補**:

| 箇所 | 現状 | placeholder 化 |
|---|---|---|
| 京都 ch1 目的 `"消防法第８条第１項"` | ハードコード | `{type: "placeholder", key: "legalBasis"}` + adapter が `data.legalBasis = legalBasis(isUnified)` を注入(既に kyoto-full.ts L55 で実装済み!) |
| 京都 ch1 委託 heading suffix `〔非該当〕` | JSON に含まれていない | JSON の ch1 heading を `"３　防火管理業務の一部委託について〔{outsourcedLabel}〕"` 化 — ただし heading は JSON の section.heading であり placeholder 解決されない(buildSectionHeading は plain TextRun emit) |

**heading 内 placeholder の壁**: 現在の `buildSectionHeading` は `section.heading` を plain string として TextRun に渡す — placeholder 解決は body にしか効かない。heading にも placeholder を効かせるには `buildSectionHeading` を拡張して resolve を通す必要がある。

**推奨**: legalBasis は body 内なので placeholder 化は即座に可能(JSON 変更 + adapter は既に注入済み)。heading 内 placeholder(委託 suffix)は buildSectionHeading 拡張が必要で影響範囲が広い → Step 6 では defer。

---

## 推奨スコープ

### Step 6 に含めるべき項目

| # | 項目 | 判定 | 理由 |
|---|---|---|---|
| 1 | cover page | **含める** | Paragraph のみ、低リスク、ユーザー体験への影響大 |
| 2 | header/footer | **含める** | adapter 内 5-10 行追加、低リスク、全ページに効く |
| 4 | ch8 tsunami italic+gray | **含める** | SectionOverride 1 本追加、京都のみ、低リスク |
| 5 | ch1 legalBasis placeholder 化 | **含める**(body 部分のみ) | JSON 1 行変更 + adapter は既に注入済み |
| 3 | body paragraph indent | **defer** | ヒューリスティック判定の設計が必要、全章に影響、regression リスク中。Step 6b として独立 |
| 5' | heading 内 placeholder | **defer** | buildSectionHeading 拡張が全 pack に波及。Step 6b |

### 想定コミット数: **4-5**

1. `feat(engine-v2): add shared cover page builder` — cover page (京都+東京)
2. `feat(engine-v2): add header/footer to kyoto and tokyo adapters` — adapter の Document 構築に properties 追加
3. `feat(engine-v2/kyoto): add ch8 tsunami note as SectionOverride` — italic+gray 対応
4. `feat(engine-v2): placeholder-ize ch1 legalBasis in kyoto full pack` — JSON 変更
5. (optional) smoke test 追加 for cover page / header 検出

### 想定リスク

| リスク | 確率 | 対策 |
|---|---|---|
| header/footer 追加で Document 構造変更 → 全 smoke test fail | 中 | adapter 内の Document 構築のみ変更。buildDocument (sample path) は触らない |
| cover page 追加で docx ZIP 構造変化 → size assertion fail | 低 | size assertion は `> 5000` で余裕あり。cover page 追加は size を増やす方向 |
| kyoto full.json の ch1 body 変更 → 既存 smoke test で "消防法第８条第１項" 消失 | 低 | placeholder 化しても resolve 結果は同じ文字列(adapter が legalBasis を注入済み)。test は resolved 出力を見るので影響なし |
| lint 増加 | 低 | 新規 TS ファイルのみ。kyoto/tokyo の builder 変更なし(cover page は shared/) |

### 停止基準

- cover page の構造が Paragraph 以外(Image, DrawingML 等)を含む → **非該当**(調査済み、Paragraph のみ)
- header/footer の追加が既存 buildDocument API に波及する → **非該当**(adapter 内完結)
- body indent のヒューリスティック判定で false positive が発生 → **非該当**(Step 6 scope-out)
- schema 拡張が不可避 → **非該当**(全項目が既存 schema 内で対応可能)

---

最終更新: 2026-04-12
