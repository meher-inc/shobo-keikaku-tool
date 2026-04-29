# Osaka Full Engine v2 — Phase 1 Recon

## 1. ブランチ・前提
- ブランチ: `feat/osaka-full-engine-v2`（main @ `2ac5a87` から派生）
- 作業日時: 2026-04-29
- ターゲット: 大阪市消防局「中・小規模（事業所・テナント）用」消防計画
- 直前判定: 「C. 大阪テンプレ未着手、ゼロから」（v1 リポジトリ内には実装なし）

## 2. 入手した一次資料

### 2.1 公式ひな形（CC-BY 4.0、出典：[大阪市公式](https://www.city.osaka.lg.jp/shobo/page/0000580556.html)）

実配信ベース URL は `https://www.city.osaka.lg.jp/shobo/cmsfiles/contents/0000580/580556/`（ページ HTML 上の `./cmsfiles/...` 相対パスは `/shobo/page/cmsfiles/` に解決されないので注意。CMS が `/shobo/cmsfiles/` 直配信）。

DL 済（[tmp/osaka-recon/](../../tmp/osaka-recon/)、Composite Document File V2 / Code page 932）:

| ファイル | サイズ | 中身 |
|---|---:|---|
| `tyuu1.doc` | 82.5 KB | ①中・小規模用消防計画 本文（**主要ターゲット**） |
| `tyuu2.doc` | 45.0 KB | ②別表1 防火・防災管理業務委託状況表 |
| `tyuu3.doc` | 75.0 KB | ③別表2 災害想定 |
| `tyuu4.doc` | 67.0 KB | ④別表3 防火・防災対象物実態把握表 |
| `tyuu5.doc` | 89.0 KB | ⑤別表4 自主検査表（日常） |
| `tyuuu6.doc` | 112.5 KB | ⑥別表5,6 自主検査チェック表（定期）/ 消防用設備等自主点検チェック表 |
| `tyuu7.doc` | 67.5 KB | ⑦別表7,8 防火・防災管理維持台帳編冊書類 / 非常用物品等の一覧 |
| `tyuu8.doc` | 38.0 KB | ⑧別表9 地区隊の編成と任務 |
| `tyuu9.doc` | 44.5 KB | ⑨別記 ガス漏れ事故防止対策 |
| `tyuu10.doc` | 29.5 KB | ⑩別図1〜3 平面図ほか |
| `dai1.doc` | 172.5 KB | 大規模事業所用消防計画 本文（参考） |
| `zenntaisyouboukeikaku1.doc` | 95.5 KB | 全体についての消防計画（防火）本文（参考） |
| `sinkeikakuomote.doc` | 44.0 KB | 消防計画作成（変更）届出書 |

### 2.2 v1 既存資産（リポジトリ外、~/Downloads 配下）
- `~/Downloads/files (5)/generate_osaka_full.js`（6.9 KB / 183行、`docx` ライブラリ直叩き、CommonJS）
- `~/Downloads/Code/osaka_city_template_db.json`（303行、章/別表データ DB）
- `~/Downloads/files (5)/osaka_shobo_keikaku_full.docx`（v1 出力サンプル、16.7 KB）
- `~/Downloads/files (5)/osaka_with_itaku.docx`（委託あり版サンプル、17.2 KB）

リポジトリ内には未配置。recon 材料として [tmp/osaka-recon/v1_*](../../tmp/osaka-recon/) に複製済。

## 3. 中・小規模用ひな形の構造（v1 JSON ベース）

公式 `tyuu1.doc` のフラット構造（「総則 / 予防的事項 / 応急対策的事項 / 教育訓練 / 附則」）を、v1 JSON は京都・東京と同形式の **8章構造**に再編済。

### 章数: 8

| No | タイトル | sections | 備考 |
|---:|---|---:|---|
| 1 | 総則 | 2 | 1-1 目的及び適用範囲等 / 1-2 管理権原者及び防火・防災管理者の業務と権限 |
| 2 | 予防的活動 | 9 | 自主検査・点検、放火防止、避難施設維持、火気管理 等 |
| 3 | 地震対策 | 2 | 非常用物品確保、被害想定 |
| 4 | 自衛消防組織 | 2 | 編成、運用 |
| 5 | 災害発生時の活動 | 5 | 火災時、地震時、避難誘導、被害確認、報告 |
| 6 | **南海トラフ地震対策** | 5 | **大阪独自**。注意報・臨時情報3区分対応、津波避難先、訓練・教育 |
| 7 | 教育訓練 | 3 | 従業員教育、訓練実施月、地震想定避難訓練 |
| 8 | 計画の実施日 | 1 | 附則相当 |

### 別表数（v1 JSON `include_in_standard=true`）: 6

| 別表 | タイトル | gating |
|---|---|---|
| 1 | 防火・防災管理業務委託状況表 | `has_outsourced_management` |
| 2 | 災害想定 | — |
| 3 | 防火・防災対象物実態把握表 | — |
| 7 | 防火・防災管理維持台帳に編冊する書類等 | — |
| 8 | 非常用物品等の一覧 | — |
| 9 | （{building_name}）地区隊の編成と任務 | — |

**v1 で省略済み**: 別表4（自主検査表 日常）、別表5（自主検査チェック表 定期）、別表6（消防用設備等自主点検チェック表）。詳細チェックリストの繁雑性回避と推測。実用上の提出問題は不明（要 SHUN 確認）。

### プレースホルダ・フィールド候補（v1 JSON `form_fields` から抽出）

`building_name`, `building_address`, `kengen_range`, `building_ownership`, `building_constructed_date`, `building_structure`, `floors_above`, `floors_below`, `total_area_m2`, `occupancy`, `main_usage`, `has_hazardous_materials`, `fire_equipment_summary`, `report_month`, `drill_fire_month1`, `drill_fire_month2`, `drill_eq_month`, `plan_start_date`, `leader_name`, `tsuhou_member`, `shoka_member`, `hinan_member`, `kyugo_member`, `anzen_member`, `tsunami_evac`, `storage_location`, `casualty_estimate`, `property_damage_estimate`, `has_outsourced_management`, `include_appendix`

## 4. 特記事項

| 項目 | Osaka 中・小規模 | 備考 |
|---|---|---|
| 南海トラフ対応 | **記載あり（第6章まるごと）** | 京都「免除」と逆方向。震度6強想定、津波避難先、臨時情報3区分（調査中／巨大地震警戒／巨大地震注意）の対応、年1回以上の訓練 |
| 帰宅困難者対策 | なし | 東京独自（条例 1.1万人以上） |
| テロ対策 | なし | 東京独自 |
| 地下街対応 | なし | 中・小規模スコープ外 |
| 委託状況 | 第1章1-1-4 に節、別表1 に詳細表 | `optional_flag: has_outsourced_management` |
| 防災管理 | 防火と一体（タイトル「防火・防災管理に係る消防計画」） | 京都・東京と同水準 |
| タイトル形式 | `〔{building_name}〕消防計画` | プレースホルダ１個 |

## 5. 京都・東京 v2 テンプレとの差分

| 観点 | Kyoto v2 | Tokyo v2 | Osaka v1 → v2 計画 |
|---|---|---|---|
| 章数 | 11 | 13 | **8** |
| 章番号方式 | `第１　…` 形式 | `第１　…` 形式 | v1 は数値 `no:1`。v2 化時は kyoto/tokyo に合わせ `第１　総則` 等に正規化推奨 |
| 別表 (JSON 内) | 0（builders で programmatic emit） | 0（同上） | v1 は JSON 直書き。**v2 移植時は builders/osaka/tables/*.ts に再実装が必要** |
| 南海トラフ | なし | なし | **第6章で正式実装** |
| 帰宅困難者 | なし | あり（追加章） | なし |
| 地震対策章 | 第8章 | 第9章「震災対策」 | 第3章 + 第6章（南海トラフ）に分離 |
| 自衛消防組織 | 第6章 | 第7章 | 第4章 |
| 委託 gating | `has_outsourced_management`（別表1, 別表2） | 同左（別表1+2） | 第1章節 + 別表1 |
| 教育訓練 | 第9章「防災教育」+ 第10章「訓練」（分離） | 第5章「防火・防災教育」+ 第8章「訓練」（分離） | 第7章「教育訓練」（一体） |
| プレースホルダ命名 | `{building_name}` 等 snake_case | 同左 | 同左（v1 互換） |
| ライセンス表記 | 「京都市消防局より引用」 | 「東京消防庁より引用」 | **CC-BY 4.0** 表記要（公式ライセンス） |

### 共通要素（推定 60〜70%）
総則、自衛消防組織編成、自主検査・点検、避難施設維持管理、災害発生時の活動（火災／地震共通）、教育訓練、訓練実施記録、別表（委託状況、対象物実態把握、地区隊編成）

### Osaka 独自要素
- 南海トラフ第6章（津波避難先 `tsunami_evac`、臨時情報3区分の対応手順、別図1：3階以上避難階の平面図参照）
- フィールド `tsunami_evac`, `casualty_estimate`, `property_damage_estimate`（kyoto/tokyo にはない）

### Osaka に欠ける要素
- 防火対象物点検報告（kyoto第3章／tokyo第6章相当）は、osaka では予防的活動 2-3 節に薄く言及のみ
- 帰宅困難者対策（東京）
- 厳守事項章（京都第5章相当）

## 6. 設計提案（Phase 2 へ向けた逆提案歓迎）

### 6.1 ファイル構成案（kyoto/tokyo 踏襲）

```
lib/engine-v2/
├── templates/
│   └── osaka-city.full.json          # 章/節/items のテキスト + placeholder のみ
├── adapters/
│   └── osaka-full.ts                 # kyoto-full.ts / tokyo-full.ts 模倣
├── builders/
│   └── osaka/
│       ├── logic.ts                  # 章配列の dispatcher（gating 含む）
│       ├── appendices.ts             # 別表 1, 2, 3, 7, 8, 9 emitter
│       └── tables/
│           ├── ch3-disaster.ts       # 別表2 災害想定
│           ├── ch4-jieishobo.ts      # 別表9 地区隊編成
│           └── ch6-tsunami.ts        # 第6章テーブル/フロー（必要なら）
└── tests/
    └── osaka-full-smoke.test.ts      # kyoto-full-smoke / tokyo-full-smoke 模倣
```

### 6.2 template pack JSON 構成案

`lib/engine-v2/templates/osaka-city.full.json`:
- top: `version`, `deptId="osaka"`, `deptName="大阪市消防局"`, `scale="medium-small"`, `chapters[]`, `appendices[]`
- `chapters[]`: 8 件、各 `{no:"第１"｜"第２"…, title, sections:[{no, heading, items:[{no, title, body, list, optional_flag}]}]}`
- v1 JSON の構造をそのまま v2 スキーマにマッピングできる（章番号を「第１」表記に正規化、`{building_name}` 等の placeholder はそのまま）

### 6.3 route.ts 拡張

```ts
// app/api/generate-plan/route.ts
const VALID_PACKS = ["full", "tokyo-full", "osaka-full", "sample"] as const;
// auto-select:
pack = prefecture === "東京都" ? "tokyo-full"
     : prefecture === "大阪府" ? "osaka-full"
     : "full";
```

### 6.4 gating 必要箇所
- 第1章 1-1-4「防火・防災管理業務の委託」: `has_outsourced_management`
- 別表1: 同上
- 第6章（南海トラフ）: **gating なし**（大阪市は南海トラフ地震防災対策推進地域に該当）
- `include_appendix`: 既存 v2 と同様

### 6.5 リスク・難所

1. **公式フラット構造 vs v1 の8章再編の正当性** — 公式 tyuu1.doc は予防的事項／応急対策的事項のフラット構造。v1 の8章は閲読性高いが、所轄消防署提出時に章立て差で指摘されるリスク。v1 サンプル docx の提出実績有無を SHUN に確認必要。
2. **南海トラフ第6章の法定文言** — 臨時情報3区分の説明は引用文が長く誤転記リスク。v1 JSON を正本扱いするか、公式 tyuu1.doc から再抽出するか判断要。
3. **別表4〜6（自主検査系）の扱い** — v1 で省略。Phase 2 では同方針で進めるか、有料プランの完全準拠期待を満たすため後追いで追加するかは要判断。
4. **CC-BY 4.0 表示** — 公式ライセンスを生成 docx に明示する必要があるか、`deptName` 等のメタに留めるか、京都・東京を含めて統一方針として要レビュー。
5. **v1 JSON の `appendices[].rows_template` 形式と v2 builders/&lt;dept&gt;/tables/*.ts の相性** — v1 はテーブル行を JSON 直書き、v2 は TypeScript で `Table` emit。**v2 化では JSON はテキスト + placeholder のみ、テーブルは builders/osaka/tables/*.ts で emit** のパターンに揃えるのが kyoto/tokyo と整合的。

### 6.6 Phase 2 ステップ提案（逆提案）

| ステップ | スコープ | 動作確認 |
|---|---|---|
| **2A 最小** | template pack JSON + adapter + smoke、別表は別表9のみ | 第1〜8章本文の placeholder fill、`include_appendix=false` で動く |
| **2B builders** | builders/osaka/tables/*.ts 実装、別表1, 2, 3, 7, 8, 9 完備 | `include_appendix=true` で 6 別表すべて出力 |
| **2C 仕上げ** | route.ts 分岐拡張、ライセンス表記、UI 側の prefecture 選択肢追加 | `prefecture=大阪府` → `osaka-full` 自動選択、本番疎通 |

**推奨**: 2A 着地で動作保証 → 2B でテーブル拡充 → 2C で接続。1 PR にまとめず段階レビュー。

## 7. 次タスク（Phase 2 着手指示前提）

1. SHUN 確認: v1 で省略している別表4〜6 を含めるか、公式8章フラット構造との整合性
2. SHUN 確認: CC-BY 4.0 表示の置き場所（生成 docx 末尾／メタ／無記載）
3. Phase 2A から実装着手（template pack JSON 作成）

## 付録：参考ファイルの所在

- 公式ひな形: [tmp/osaka-recon/](../../tmp/osaka-recon/)（gitignore 対象、recon 用一時保管）
- v1 ジェネレータ: [tmp/osaka-recon/v1_generate_osaka_full.js](../../tmp/osaka-recon/v1_generate_osaka_full.js)
- v1 JSON 原本: `~/Downloads/Code/osaka_city_template_db.json`
- 抽出テキスト: [tmp/osaka-recon/tyuu1.txt](../../tmp/osaka-recon/tyuu1.txt) ほか
