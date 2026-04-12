# Step 5 事前調査レポート: 東京消防庁パック v2 移植

調査日: 2026-04-12
対象: `lib/generate_tokyo_full.js` (564 行)
比較対象: `lib/generate_kyoto_full.js` (557 行)

---

## 1. 東京 v1 ソース構造マップ

### 章構成 (11章 + 帰宅困難者対策 + 附則)

| 章 | タイトル | v1 行範囲 | 段落数(概算) | テーブル | 京都対応章 |
|---|---|---|---|---|---|
| 第1 | 目的及び適用範囲等 | L266-281 | ~8 | なし | 第1 (類似) |
| 第2 | 管理権原者の責任及び防火管理者の業務 | L283-306 | ~12 | **1** (業務一覧2×5) | 第2 (類似) |
| 第3 | 火災予防のための点検・検査 | L308-322 | ~8 | なし | 第4 (類似) |
| 第4 | 守らなければならないこと | L324-361 | ~25 | なし | 第5 (類似) |
| 第5 | 防火・防災教育 | L363-373 | ~5 | **1** (教育4×3) | 第9 (類似) |
| 第6 | 消防機関との連絡等 | L375-386 | ~5 | **1** (届出3×4) | 第3 (類似) |
| 第7 | 自衛消防隊等 | L388-413 | ~16 | **1** (緊急連絡2×2) | 第6+第7 (統合) |
| 第8 | 訓練 | L415-428 | ~8 | **1** (訓練3×2) | 第10 (類似) |
| 第9 | 震災対策 ★東京独自充実★ | L430-449 | ~12 | なし | 第8 (大幅拡充) |
| 第10 | その他の災害対策 ★東京独自★ | L451-466 | ~11 | なし | なし |
| 第11 | その他 | L468-470 | ~2 | なし | なし |
| (追加) | 帰宅困難者対策 ★東京独自★ | L472-482 | ~8 | なし | なし |
| - | 附則 | L484-486 | ~1 | なし | 附則 (同等) |
| - | 別表等一覧 | L488-506 | - | **1** (一覧3×14) | 別表一覧 (9→14行) |

**本文テーブル計: 6 箇所** (京都は 5 箇所)

### 別表構成 (11 builders: tkA1-tkA11)

| 別表 | タイトル | 構造 | データ依存 | 京都対応 | 東京独自? |
|---|---|---|---|---|---|
| 別表1 | 防火・防災管理業務の一部委託状況表 | 3×2 | outsource_company | 京都app1 | 名称差あり |
| 別表2 | 委託契約書等の内容チェック表 | 2×5 | 静的 | なし | ★独自 |
| 別表3 | 日常の火災予防の担当者と注意事項 | 3×5 | 静的 | 京都app2 | 同一 |
| 別表4-1 | 自主検査チェック表（火気関係）| 3×5 | daily_checker | 京都app3 | 実施時期微差 |
| 別表4-2 | 自主検査チェック表（閉鎖障害等）| 3×5 | daily_checker | 京都app4 | 同一 |
| 別表5 | 自主検査チェック表（定期）| 3×5 | periodic_check_months | 京都app5 | 同一 |
| 別表6 | 自主点検チェック表（消防用設備等）| 3×N | fire_equipment[] | 京都app6 | 同一 |
| 別表7 | 自衛消防隊の編成と任務 | 3×7 | manager_name | 京都app8 | 副隊長行追加 |
| 別表8 | 転倒・落下・移動防止対策チェック | 3×6 | 静的 | なし | ★独自 |
| 別表9 | 帰宅困難者対策の備蓄一覧 | 3×6 | 静的 | なし | ★独自 |
| 別表10 | 時差退社計画 | 3×5 | 静的 | なし | ★独自 |
| 別表11 | 施設安全点検チェックリスト | 3×10 | 静的 | なし | ★独自 |

**注**: 別表一覧テーブルには「別図 避難経路図」と「別添え 消防計画概要」も記載されるが、v1 に builder は存在しない（行項目のみ）。

---

## 2. 東京独自 6 要素のソース内位置

### テロ対策
- **位置**: 第10章 §1 (L452-457)
- **種類**: 章内 subsection (3 items)
- **実装手段**: JSON テキスト（静的、変数なし）

### 帰宅困難者対策
- **位置**: (追加) セクション (L472-482) + 別表9 (L178-192) + 別表10 (L195-207)
- **種類**: 独立セクション（第11章の後に追加、「第N」番号なし）+ 別表2種
- **実装手段**: JSON テキスト + TS table builder 2本

### 復旧計画
- **位置**: 第9章 §3 (L446-449)
- **種類**: 章内 subsection (3 items)
- **実装手段**: JSON テキスト（静的、変数なし）

### 防災センター要件
- **位置**: v1 に **実装なし**。template_db.json には言及があるが、generate_tokyo_full.js 内には防災センター関連コードが存在しない。
- **判定**: Step 5 スコープ外。v1 に無いものは移植できない。

### 自衛消防隊 A/B 区分
- **位置**: 第7章 (L390) に `"Ａ　事業所自衛消防隊を編成する場合"` とあるが、B 区分のコードは **存在しない**。
- **種類**: A 区分のみハードコード。分岐ロジックなし。
- **判定**: Step 5 では A 区分のみ移植（v1 と同等）。B 区分は別途要件が入った時点で対応。

### 委託チェック表
- **位置**: 別表2 (L56-68) — 委託あり時のみ出力（L234-235 で gating）
- **種類**: 2×5 の静的テーブル
- **実装手段**: TS table builder（新規）。gating は adapter-level。

---

## 3. 新規 computed fn 一覧

### 結論: **ゼロ**

v1 東京ソース内の全 `d.*` 参照と全インラインロジックを走査した結果、Step 4b で実装済みの computed fn + dept logic で **全ケースをカバーできる**。

| 検討した候補 | v1 での実態 | 判定 |
|---|---|---|
| 自衛消防隊員数の自動算出 | v1 に存在しない（手入力の空欄テーブル）| 不要 |
| 防災センター要員のシフト計算 | v1 に存在しない | 不要 |
| 帰宅困難者数の床面積推定 | v1 に存在しない（"1人1日3L × 3日" の固定文言）| 不要 |
| reportFrequency / drillRequirement | Step 4b kyoto/logic.ts に実装済み | **流用可** |
| joinArray (fire_equipment) | Step 4b computed/index.ts に実装済み | **流用可** |
| eraDate | Step 4b computed/index.ts に実装済み | **流用可** |

---

## 4. 分岐パターン全列挙

v1 東京の条件分岐は **4 箇所のみ**（京都の 16 箇所と比較して大幅に少ない）。

| 位置 | 条件式 | 影響範囲 | adapter 対応可? |
|---|---|---|---|
| L233 | `if (d.has_outsourced_management)` | 別表1+2 の include/exclude | **対応可**: adapter filter。Note: Step 4b 方針「常に全別表出力」を踏襲し、Step 5 でも gating は実装しない |
| L274 | `if (outsourced)` | ch1 §3 (5 items) の追加 | **対応可**: adapter が section を include/exclude |
| L290 | `if (unified)` | ch2 item ⑸ の追加 | **対応可**: adapter が section を include/exclude、または RenderData flag で body variant 選択 |
| L508 | `if (d.include_appendix)` | 全別表の出力 | **対応可**: adapter 判断（Step 5 では常に出力） |

### 段落内 word swap

| 位置 | パターン | 処理 |
|---|---|---|
| L251 | `isSpecific ? "1年" : "3年"` | kyoto/logic.ts の reportFrequency() で解決済 |
| L252 | `isSpecific ? "年2回以上" : "消防計画に定めた回数"` | kyoto/logic.ts の drillRequirement() で解決済 |
| L271 | `d.management_scope \|\| d.building_name + "の全体"` | toRenderData の fallback で処理 |
| L383 | `${reportFreq}に1回` | table builder 内で解決 |

### 案Y で対応不能な箇所: **なし**

京都 ch8 のような cross-paragraph dependency は **東京には存在しない**。全分岐が adapter-level gating または TS builder 内の word swap で処理可能。JSON の 2 バリアント分割も **不要**。

---

## 5. Table builder 再利用マトリクス

### 本文テーブル (6 箇所)

| 東京 | 京都 builder | 再利用方針 | 備考 |
|---|---|---|---|
| ch2 業務一覧 (2×5) | なし | **新規** | 東京独自の管理者業務テーブル |
| ch5 教育 (4×3) | ch9-education.ts | **そのまま流用** | 同一構造・同一 fallback |
| ch6 消防機関 (3×4) | ch3-reports.ts | **パラメータ化** | 4 rows vs 5、periodicInspection 行なし |
| ch7 緊急連絡 (2×2) | ch7-emergency.ts | **そのまま流用** | 完全同一 |
| ch8 訓練 (3×2) | ch10-drills.ts | **そのまま流用** | 完全同一 |
| 別表一覧 (3×14) | appendices.ts 内 | **パラメータ化** | 14 rows vs 9、column3 header 差、法的根拠列 |

### 別表テーブル (11 builders)

| 東京別表 | 京都 builder | 再利用方針 |
|---|---|---|
| 別表1 | kyoto app1 | **パラメータ化** (title: "防火・防災管理業務" vs "防火管理業務") |
| 別表2 | なし | **新規** |
| 別表3 | kyoto app2 | **そのまま流用** |
| 別表4-1 | kyoto app3 | **微調整** (実施時期 "毎日" vs "毎日終業時") |
| 別表4-2 | kyoto app4 | **そのまま流用** |
| 別表5 | kyoto app5 | **そのまま流用** |
| 別表6 | kyoto app6 | **そのまま流用** |
| 別表7 | kyoto app8 | **パラメータ化** (7 rows vs 6、副隊長行追加) |
| 別表8 | なし | **新規** |
| 別表9 | なし | **新規** |
| 別表10 | なし | **新規** |
| 別表11 | なし | **新規** |

### 集計

| 方針 | 本文 | 別表 | 計 |
|---|---|---|---|
| そのまま流用 | 3 | 4 | **7** |
| パラメータ化 | 2 | 3 | **5** |
| 新規 | 1 | 5 | **6** |
| **合計** | 6 | 12 | **18** |

---

## 6. JSON テンプレート構成案

### ファイル

`lib/engine-v2/templates/tokyo-tfd.full.json`

### 2 バリアント分割の要否

**不要**。東京には kyoto ch8 のような cross-paragraph dependency が存在しない。全条件分岐は adapter-level gating で解決する。

### 章構成

```json
{
  "version": "2.0.0-tokyo-full",
  "deptId": "tokyo-tfd",
  "deptName": "東京消防庁",
  "scale": "medium",
  "chapters": [
    // ch1: 目的及び適用範囲等 (outsourced で §3 追加 → adapter gating)
    // ch2: 管理権原者 (unified で ⑸ 追加 → adapter gating) + table override
    // ch3: 火災予防
    // ch4: 守らなければならないこと
    // ch5: 防火・防災教育 + table override
    // ch6: 消防機関との連絡等 + table override
    // ch7: 自衛消防隊等 + table override (緊急連絡先)
    // ch8: 訓練 + table override
    // ch9: 震災対策
    // ch10: その他の災害対策 (テロ、大雨、受傷事故)
    // ch11: その他
    // 帰宅困難者対策 (chapter-level、第XX 番号なし)
    // 附則
  ]
}
```

### 附則・cover page

Step 4b 同様:
- cover page は当面 degradation 許容（v1 固有スタイリング）
- 附則は最終 chapter として JSON に配置、eraDate computed で施行日

### カラーテーマ

table-helpers.ts を**テーマ対応に拡張**する必要あり:
- 京都: hdrFill `#2B4C7E` (navy)、altFill `#F5F7FA`
- 東京: hdrFill `#C41E3A` (red)、altFill `#FFF5F5`

**推奨**: `TableTheme` 型を導入し、`styledTable(headers, rows, widths, theme)` に refactor。京都の既存テスト + smoke test は kyotoTheme を渡す形に変更するだけで互換性維持。

---

## 7. adapter 改修範囲の見積もり

### 新規ファイル

| ファイル | 責務 | 推定行数 |
|---|---|---|
| `lib/engine-v2/adapters/tokyo-full.ts` | buildTokyoFull(form) entry point | ~80-100行 (kyoto-full.ts と対称構造) |
| `lib/engine-v2/builders/tokyo/appendices.ts` | 東京独自別表 + 共通流用 dispatch | ~200行 |
| `lib/engine-v2/builders/tokyo/tables/` (2-3 files) | ch2 業務 table + 消防機関 table param + 別表一覧 param | ~80行 |

### 変更ファイル

| ファイル | 変更内容 | 推定 diff |
|---|---|---|
| `adapters/generate-plan.ts` | `pack=tokyo-full` 分岐追加 | +3 行 |
| `app/api/generate-plan/route.ts` | v2 分岐の pack に `tokyo-full` を追加 | +2 行 |
| `builders/kyoto/table-helpers.ts` | TableTheme 化(色のパラメータ化) | ~30 行 diff |
| `builders/kyoto/appendices.ts` | 共有関数を shared 化 or 再 import | 最小 |
| `to-render-data.ts` | 変更なし(全キー Step 4b で追加済み) | **0** |

### 共通化戦略

| 資産 | 現在地 | 推奨 |
|---|---|---|
| `kyoto/table-helpers.ts` | kyoto/ | **shared/** に移動 + テーマ化 |
| `kyoto/paragraph-helpers.ts` | kyoto/ | **shared/** に移動(font/size は京都東京で同一) |
| `kyoto/logic.ts` | kyoto/ | **shared/dept-logic.ts** に共通関数を抽出、kyoto/tokyo 固有は各自の module に残す |
| `kyoto/appendices.ts` | kyoto/ | 共通別表 builder を **shared/** に抽出、dept 固有を tokyo/ に新規 |

**注意**: ファイル移動は既存 kyoto import パスに影響する。移動は 1 コミットにまとめ、import path を全て更新した上で全テスト green を確認する必要あり。

---

## 8. Step 5 全体のコミット数予測

### 予測: **8-10 コミット**

| Task | 内容 | コミット数 |
|---|---|---|
| Task 0 | v1 回帰テスト(東京) | 1 ✅ (完了) |
| Task 1 | 事前調査レポート | 1 (本レポート) |
| Task 2 | table-helpers テーマ化 + shared 化 | 1-2 |
| Task 3 | 東京 chapter table builders (ch2 業務 + ch6 消防機関 param化) | 1 |
| Task 4 | 東京 appendix builders (5 新規 + 共通化) | 1-2 |
| Task 5 | tokyo-tfd.full.json (13 章 + 附則) | 1 |
| Task 6 | adapter wiring (tokyo-full.ts + route.ts) | 1 |
| Task 7 | smoke tests | 1 |
| **合計** | | **8-10** |

Step 4b (12 コミット) より少ない。理由:
- builder インフラ (document.ts 拡張、computed fn) が既存
- TS factory パターンが確立済み
- 条件分岐が 4 箇所のみ (京都 16 箇所の 1/4)
- 2 バリアント JSON 分割が不要

---

## 9. 停止基準の事前判定

### 案Y で解決不能な箇所があるか

**なし**。全 4 条件分岐が adapter gating で処理可能。schema 拡張不要。

### builders/document.ts の拡張が 500 行を超える見込みか

**No**。document.ts は Step 4b の時点で完成形。東京移植で変更なし。

### v1 ソースが想定と大きく異なる箇所があるか

3 点の「想定との差異」あり（いずれも致命的でない）:

1. **防災センター要件が v1 に未実装**: 指示書の「東京独自要素」に挙がっていたが、generate_tokyo_full.js に該当コードは存在しない。→ Step 5 スコープ外として skip
2. **自衛消防隊 B 区分が v1 に未実装**: A 区分のみハードコード。→ A 区分のみ移植
3. **帰宅困難者対策が「第N 章」ではなく「(追加)」ラベル**: JSON pack の chapter としては問題ないが、title が `"（追加）帰宅困難者対策"` と通常の `"第N　..."` 形式と異なる。→ 京都 附則 と同じパターン: chapter-level entry として追加

---

## 10. 想定リスク

### Risk 1: table-helpers の共有化で kyoto テストが壊れる

**確率**: 中
**対策**: テーマ化 refactor を 1 コミットにまとめ、kyoto 全テスト + v1-regression テスト green を確認してから東京 builder に着手。移動でなく「shared/ にコピー + kyoto/ の import 先変更」のアプローチなら段階的に移行できる。

### Risk 2: 東京の別表番号体系が split (4-1, 4-2)

**確率**: 低
**対策**: 別表 builder の命名を `tkA4_1`, `tkA4_2` 形式に合わせるだけ。JSON の appendix id も `"tokyo-app4-1"` 等にすればスキーマ上の問題なし。

### Risk 3: 京都と東京で共通別表の行内テキストに微差がある

**確率**: 高（既に確認済み: app3/4-1 の実施時期 "毎日終業時" vs "毎日"）
**対策**: 共通化する別表 builder にはテキスト差分を `opts` で上書き可能にする。あるいは共通化せず、東京用に小さな fork を作る（コード量は少ないので重複コストは低い）。

### Risk 4: 東京用 adapter のボイラープレートが kyoto-full.ts とほぼ同じ

**確率**: 高
**対策**: 許容する。Step 5 完了後に共通化する余地はあるが、2 ファイルの重複は可読性を保つために許容範囲。DRY にこだわって抽象化層を入れると、dept 固有の差分を入れにくくなるリスクの方が高い。

---

## まとめ

Step 5 は Step 4b より **軽い作業** です。

- 新規 computed fn: **0**
- schema 拡張: **0**
- 案Y 不適合箇所: **0**
- 条件分岐: **4 箇所** (京都の 1/4)
- 2 バリアント分割: **0** (京都では 1 箇所あった)
- テーブル: 18 箇所中 12 が流用 or パラメータ化
- 最大のコード作業: 東京独自別表 5 本(いずれも静的テーブル)の新規作成

**最大の設計判断ポイント**: table-helpers の共有化タイミングと方法。Task 2 で着手し、全テスト green を確認してから先に進むのが安全。
