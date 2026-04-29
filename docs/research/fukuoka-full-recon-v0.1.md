# Fukuoka Full Engine v2 — Phase 1 Recon (Detailed)

軽量版（commit `37c60ed`）の続き。別表詳細・既存 4 都市比較・特殊条文有無
確認・設計提案を含む詳細版。Phase 2A 着手前の最終 recon ゲート。

## 1. ブランチ・前提
- ブランチ: `feat/fukuoka-full-engine-v2`（main `ec26c0e` から派生）
- 軽量版 commit: `37c60ed`、本詳細版で同ファイル更新
- 作業日時: 2026-04-29
- ターゲット: 福岡市消防局「中規模防火対象物の消防計画（防火）」
- 前提: Tier 1 partial integration（osaka/yokohama）main マージ済、
  7 設計判断確定済（osaka/yokohama 両ブランチで完全整合）

## 2. 入手したひな形

DL 元: 福岡市消防局 申請書様式ページ

| ファイル | サイズ | 形式 |
|---|---:|---|
| [tmp/fukuoka-recon/fukuoka-chukibo.docx](../../tmp/fukuoka-recon/fukuoka-chukibo.docx) | **86,965 B** | Microsoft Word 2007+ |
| [tmp/fukuoka-recon/fukuoka-shokibo.docx](../../tmp/fukuoka-recon/fukuoka-shokibo.docx) | 50,368 B | Microsoft Word 2007+ |

textutil 抽出済（chukibo: 898 行）。

## 3. 中規模ひな形の構造

### タイトル
「中規模防火対象物 / （ ）の消防計画」 — **防火管理のみ**（防火・防災一体化
なし、横浜と同型）。本文中も「防火管理業務」表記で統一。

### 章数: 5（章 → 条 の **2 層フラット**、節分けなし）

| No | タイトル | 主要条 |
|---:|---|---|
| 1 | 総則 | 第1条 目的 / 第2条 適用範囲 / **第3条 委託状況等** / 第4条 管理権原者の責任 / 第5条 防火管理者の業務 / 第6条 消防機関への届出等 / 第7条 防火管理業務に関する資料等の整備 |
| 2 | 予防管理対策 | 第8条 予防管理組織（別表1）/ 第9条 防火担当責任者の業務 / 第12条 自主点検（別表2）等 |
| 3 | 自衛消防活動対策 | 第24条〜 自衛消防隊（別表3）等 |
| 4 | 地震対策 | （次項目で詳細）|
| 5 | 防災教育及び訓練等 | （略）|

### 条数: 41

### 別表数: **3**

| 別表 | タイトル | 出典行 | 用途 |
|:-:|---|:-:|---|
| **別表1** | 火災予防のための組織編成 | L507 | 第8条で参照、防火担当責任者・火元責任者の編成 |
| **別表2** | 自主点検を実施するための組織編成表（例） | L575 | 第12条で参照、点検班の編成 |
| **別表3** | 自衛消防隊の編成と任務 | L629 | 自衛消防隊の編成（第24条等） |

3 本すべて **「組織・編成」系**。kyoto/tokyo/osaka/yokohama にあるような
「委託状況表」は **別表ではなく**、本文末尾に **別記様式** として独立して付属
（L762「防火・防災管理業務の委託状況表」、第3条で参照）。

#### 別記様式（=非別表）
- **委託状況表** 1 件（防火・防災管理業務の委託状況表、共用フォーム形式）—
  本体本文の表記は「防火管理業務」のみだが、委託状況表は防火・防災両用の汎用
  フォームを流用していると推測

## 4. 福岡独自の特記事項

### 4.1 grep ベース検出結果

| 項目 | 検出 | 備考 |
|---|:-:|---|
| **南海トラフ地震** | **なし** | キーワードヒットゼロ。福岡市は南海トラフ地震防災対策推進地域・強化地域に該当しないため、ひな形に独自記述なし |
| **西方沖地震** | **なし** | 2005 年福岡県西方沖地震（M7.0）の経験を反映した独自条文は **存在せず**。震災対応は第4章 地震対策の汎用記述のみ |
| **帰宅困難者対策** | **なし** | キーワードヒットゼロ。東京・横浜と異なり、独立条・本文言及ともになし |
| **テロ対策** | なし | 東京独自要素 |
| **地下街** | なし | 中規模スコープ外 |
| **統括防火管理者** | **あり（複数箇所）**| 第19条「統括防火管理者への報告」**独立条**、第5条(11) 業務リスト、第25条 自衛消防隊長との連携等 |
| **委託** | **あり** | 第3条「委託状況等」**独立条**、第2条で受託者の指示系統、別記様式に詳細表 |
| **防火・防災管理一体化** | **なし**（防火管理のみ）| タイトル + 本文すべて「防火管理業務」表記、防災管理は混入なし |

### 4.2 統括防火管理者関連条文の抜粋

```
第19条　防火管理者は，自主点検及び法定点検の結果を統括防火管理者へ報告
       しなければならない。
２　防火管理者は，不備・欠陥部分の改修計画及び改修結果を統括防火管理者
   に報告しなければならない。
```

横浜の `ch2-art13-2-unified-report` と同型の **独立条による統括報告義務**。
gating パターンは横浜と同じ `requiresUnifiedFpm` フラグで運用可能。

### 4.3 委託（第3条）の構造

```
（委託状況等）
第３条　防火管理上必要な業務の一部委託に係る受託者の氏名及び住所並びに当該
       受託者の行う防火管理上必要な業務の範囲及び方法は，別記様式のとおり
       とする。
```

**第3条全体が委託有無で gating される**（osaka 第1章第4節と同型の
single-section skip パターン）。

## 5. 既存 4 都市 v2 テンプレとの差分

| 観点 | Kyoto | Tokyo | Osaka | Yokohama | **Fukuoka** |
|---|:-:|:-:|:-:|:-:|:-:|
| 章数 | 11 | 13 | 8 | 7+附則 | **5** |
| 条数 | — | — | — | — | **41** |
| 章番号書式 | 第１ | 第１ | 第１ | **第１章** | **第１章**（横浜と同型）|
| 別表数（programmatic）| 9 | 11 | 6 | 4 | **3** |
| 階層 | 章→節 | 章→節 | 章→節（v1 グルーピング flat 化）| 章→（節 drop）→条 | **章→条**（圧縮不要）|
| 防火・防災一体 | あり | あり | あり | なし | **なし**（横浜同型）|
| 統括防火管理者 gating | — | — | — | あり | **あり**（横浜同型、第19条 独立条 → `requiresUnifiedFpm`）|
| 南海トラフ | 免除 | なし | 第6章 | 第5章2節 | **なし** |
| 西方沖地震 | — | — | — | — | **なし**（独自要素なし）|
| 帰宅困難者 | なし | あり（追加章）| なし | あり（第36/45条）| **なし** |
| テロ対策 | なし | あり | なし | なし | なし |
| 地下街 | なし | あり | なし | なし | なし |
| 防災センター | — | — | — | あり（別表3）| なし |
| 委託 gating | ペア（〔該当〕/〔非該当〕）| 単一 section + skip | 単一 section + 番号 gap | 3 sections 一括 skip | **単一 section + skip**（osaka 同型）|
| 委託表の位置 | 別表1 | 別表1 | 別表1 | 別表4 | **別記様式**（別表外）|
| placeholder 数 | 多 | 多 | 8 keys | 8 keys | **6〜8 keys 想定**（最少）|

### 構造類似度
- **横浜と最も類似**: 章建て書式（第N章）、防火管理のみ、統括防火管理者条 独立、章→条 階層
- **大きな差**: yokohama 7+附則 vs **fukuoka 5**（章数最少）、yokohama 別表 4 vs **fukuoka 別表 3 + 別記様式 1**

### 福岡が他と異なる点
1. **章→条 が直接 v2 schema (2 層) と一致** — 圧縮戦略不要（osaka の flat 化、
   yokohama の節 heading drop が不要）
2. **委託表が別表ではなく別記様式** — 別表 3 本は組織編成系のみ（防火担当者・
   点検班・自衛消防隊）
3. **既存 4 都市の中で構造最シンプル** — Phase 2A 工数最小見込み

## 6. 7 設計判断の準拠確認（osaka/yokohama 確定済 → 福岡実装方針）

| # | 項目 | 福岡実装方針 | 整合 |
|---|---|---|:-:|
| 1 | version | `"2.0.0-fukuoka-full"` | ✅ osaka/yokohama 同 |
| 2 | scale | `"medium"` | ✅ chukibo 中規模相当 |
| 3 | deptId | `"fukuoka-city"` | ✅ kyoto-city / osaka-city / yokohama-city と同型 |
| 4 | license フィールド | 省略 | ✅ schema 制約 |
| 5 | placeholder camelCase | 採用 | ✅ |
| 6 | 章を v2 2 層に圧縮 | **圧縮不要**（章→条 が既に 2 層） | ✅ 既に整合 |
| 7 | 委託 gating skip-list | **single-section skip**（osaka 型） | ✅ 第3条全体を単一 section として skip |

**項目 6/7 で福岡は最もシンプル**:
- osaka は 1-1+1-2 を flat 化、yokohama は節 heading drop が必要だったが、
  福岡は **章→条 を直接 v2 chapter→section にマップ**するだけ
- 委託は第3条 1 条のみのため、osaka と同じく単一 section skip（番号 gap が
  発生するが第3条の前後（第2条→第4条）で gap が目立つ点に注意）

### 章番号書式の決着
fukuoka 公式が `第１章` 表記（横浜と同型）。Phase 2A では **`第１章　総則`
形式**（章タイトルに番号埋込み）を採用、yokohama-city.full.json と同パターン。

## 7. 設計提案

### 7.1 ファイル構成案

```
lib/engine-v2/
├── templates/
│   └── fukuoka-city.full.json             # 5 章 / 41 条 → ~50 sections
├── adapters/
│   └── fukuoka-full.ts                    # yokohama-full.ts 模倣
├── builders/
│   └── fukuoka/
│       ├── logic.ts                       # applicableLabel のみ
│       └── appendices.ts                  # 別表 1,2,3 + 別表等一覧
└── tests/
    └── fukuoka-full-smoke.test.ts         # F1〜F4 + 補助
```

`tables/` サブディレクトリ **不要**（別表 3 本すべて単純な編成テーブル、
SectionOverride 不要）。

### 7.2 template pack JSON 構成案

```jsonc
{
  "version": "2.0.0-fukuoka-full",
  "deptId": "fukuoka-city",
  "deptName": "福岡市消防局",
  "scale": "medium",
  "chapters": [
    { "id": "ch1", "title": "第１章　総則", "sections": [
      { "id": "ch1-art1-purpose", "heading": "第１条　目的", "body": [...] },
      { "id": "ch1-art2-scope", "heading": "第２条　適用範囲", "body": [...] },
      { "id": "ch1-art3-outsource", "heading": "第３条　委託状況等", "body": [...] },  // gated
      { "id": "ch1-art4-owner", "heading": "第４条　管理権原者の責任等", "body": [...] },
      { "id": "ch1-art5-manager", "heading": "第５条　防火管理者の業務", "body": [...] },
      { "id": "ch1-art6-reports", "heading": "第６条　消防機関への届出等", "body": [...] },
      { "id": "ch1-art7-records", "heading": "第７条　防火管理業務に関する資料等の整備", "body": [...] }
    ]},
    { "id": "ch2", "title": "第２章　予防管理対策", "sections": [...] },
    { "id": "ch3", "title": "第３章　自衛消防活動対策", "sections": [...] },
    { "id": "ch4", "title": "第４章　地震対策", "sections": [...] },
    { "id": "ch5", "title": "第５章　防災教育及び訓練等", "sections": [
      ...,
      { "id": "ch?-art19-unified-report", "heading": "第19条　統括防火管理者への報告", "body": [...] }  // gated
    ]}
  ],
  "appendices": []
}
```

### 7.3 placeholder 候補（camelCase、6〜8 keys 想定）

公式テキストから抽出:
- `companyName` または `buildingName` — タイトル「（ ）の消防計画」+ 第1条
  の事業所名
- `outsourceCompany` — 第3条 委託表の受託者
- `creationDate` / `creationDateIso` — 共通
- `wideAreaEvacuationSite` または `evacuationSite` — 地震対策章での避難場所
- 別表用 placeholder（別表1〜3 の組織編成: 防火担当者氏名・点検担当者氏名・
  自衛消防隊員氏名）→ `defenseLeader`, `inspectionTeam` 等の単純 string か、
  または横浜 `tsuhouMember` / `shokaMember` 等のロール別フィールド

最終的な placeholder 数は Phase 2A Step 1 の JSON 設計で確定。

### 7.4 gating 必要箇所

| flag | 影響 section ID（候補） | 内容 |
|---|---|---|
| `hasOutsourcedManagement` | `ch1-art3-outsource` | 第3条 委託状況等（osaka 同型 single-section skip）|
| `requiresUnifiedFpm` | `ch?-art19-unified-report` | 第19条 統括防火管理者への報告（横浜 ch2-art13-2-unified-report 同型）|
| 任意: 統括 inline 言及（第5条(11)・第25条 等） | inline references | osaka/yokohama 議論と同じ Phase 2B 検討事項 |
| `includeAppendix` | 別表全体 | 既存 v2 同様 |

### 7.5 リスク・難所

1. **第3条 単一 section skip による番号 gap** — outsource なしで「第1条→
   第2条→第4条→...」の gap が発生（osaka と同じ既存負債）。Phase 2B で
   〔該当〕/〔非該当〕ペア化検討
2. **別記様式（委託状況表）の builders 化** — 別表 3 本は単純編成テーブルで
   programmatic emit 容易だが、別記様式の委託状況表は別表とは別の builder
   関数として `hasOutsourcedManagement` gated で実装する判断が必要。Phase 2A
   では builders/fukuoka/appendices.ts に別記様式 builder も含める方針推奨
3. **章タイトル形式の混在回避** — fukuoka と yokohama は `第N章`、kyoto/
   tokyo/osaka は `第N`。dispatcher テストでこの区別を明示的に検証必要
4. **placeholder 命名の共通化** — osaka/yokohama 共通の `tsunamiEvac` のような
   共通 placeholder は福岡には存在しない（震災章は汎用記述のみ）。
   `companyName` などは既存と統一可能
5. **西方沖地震対応の今後の追加リスク** — 福岡市消防局がひな形改訂で西方沖
   関連条文を追加する将来可能性。Phase 2A 着手後に SHUN との reconfirm 推奨

### 7.6 福岡 Phase 2A 工数見積（既存 osaka/yokohama 比較）

| Step | osaka | yokohama | **fukuoka 見積** |
|:-:|:-:|:-:|:-:|
| Step 1 (JSON pack) | 8章/35節/8 placeholder | 8章/52節/8 placeholder | **5章/~30節/6-8 placeholder** |
| Step 2 (adapter) | 268 行 | 197 行 | **~150 行**（最少 placeholder + 単一 gating + 統括 gating）|
| Step 3 (builders) | 198 行 + 別表9 FULL + 5 STUB | 145 行 + 別表3,4 FULL + 別表1,2 STUB | **~120 行 + 別表3 FULL + 別表1,2 STUB + 別記様式 STUB** |
| Step 4 (smoke) | 11 tests | 10 tests | **8〜10 tests**（F1〜F4 + 補助）|

**福岡は既存 4 都市中で工数最小見込み**（osaka/yokohama より +20〜30% 短縮）。

## 8. Phase 2A への申し送り

### 8.1 SHUN 確認要事項

1. **placeholder 命名**: `defenseLeader` / `inspectionLeader` / `jieishoboMember` 等の
   ロール別フィールド設計について、横浜方式（`tsuhouMember` / `shokaMember`）に
   揃えるか、福岡独自命名にするか判断
2. **別記様式（委託状況表）の builder 化**: 別表 3 本と同列に builders/fukuoka/
   appendices.ts に含めるか、別ファイル（builders/fukuoka/forms.ts 等）に分離
   するか
3. **統括防火管理者 gating の inline 言及**: 第5条(11) と 第25条 のインライン
   references を gating するか、Phase 2B 持ち越しか（横浜と同じ判断パターン）

### 8.2 設計判断ポイント（Phase 2A Step 1 着手時）

- 章タイトル: `第１章　総則` 形式採用（横浜と同パターン）
- 委託 gating: single-section skip（osaka 同型）
- 第3条 番号 gap 許容
- 統括 gating section ID: `ch5-art19-unified-report`（または ch4 の地震対策
  章末か、仕様再確認）

### 8.3 リスクの優先順位

| 優先度 | リスク | 対応 |
|:-:|---|---|
| 高 | 別記様式 builder の構造設計 | Phase 2A Step 3 着手前に SHUN 確認 |
| 中 | placeholder 命名の整合性 | Phase 2A Step 2 で extendForFukuoka 設計時に確定 |
| 低 | 第3条番号 gap | 既知の既存負債、Phase 2B 改善候補 |
| 低 | 西方沖地震追加可能性 | 将来の改訂リスク、現時点では対応不要 |

## 9. ブランチ最新性確認

- `feat/fukuoka-full-engine-v2`: HEAD = `37c60ed`（軽量版）
- 派生元: `ec26c0e`（Tier 1 partial integration マージ済 main）
- main `ec26c0e..HEAD`: +1 commit（軽量版 recon のみ）
- `HEAD..origin/main`: 0 commits（rebase 不要）

本詳細版 commit でブランチを更新後、Phase 2A 着手可能。

## 付録: 抽出済テキスト

- [tmp/fukuoka-recon/fukuoka-chukibo.txt](../../tmp/fukuoka-recon/fukuoka-chukibo.txt)（898 行、textutil 抽出済）
- shokibo は次セッション以降で構造比較に利用可能
