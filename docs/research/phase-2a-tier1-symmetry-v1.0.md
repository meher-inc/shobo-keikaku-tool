# Phase 2A — Tier 1 + Tier 2 Symmetry Report (osaka / yokohama / fukuoka / nagoya)

> **改訂履歴**:
> - **v1.3 (2026-04-30 朝→昼)**: 名古屋市消防局 (nagoya-city) の Phase 2A
>   完走を反映。**4 dept 統合報告化**（Tier 1 + Tier 2）。テスト累計 92 passed
>   / 12 test files。
> - v1.2 (2026-04-30 朝): 福岡市消防局 (fukuoka-city) の Phase 2A 完走を反映。
>   3 dept 統合報告化。テスト累計 81 passed / 11 test files。
> - v1.0 (2026-04-29): 初版、osaka + yokohama 2 dept 報告として作成。

Phase 2A の Tier 1 + Tier 2 展開対象である **大阪市消防局 (osaka-city)**、
**横浜市消防局 (yokohama-city)**、**福岡市消防局 (fukuoka-city)**、
**名古屋市消防局 (nagoya-city)** の v2 engine 実装が完了したことを記録し、
4 ブランチで採用した設計判断の整合性、テスト結果、Phase 2B / 2C への
申し送り事項を一元化したリリースゲート文書。

## 1. 基本メタ情報

### 1.1 ブランチと最新 commit

| ブランチ | 最新 commit | Phase 2A 状態 | main 統合 |
|---|---|---|---|
| `feat/yokohama-full-engine-v2` | `10a5760` | **完了** | ✅ Tier 1 第1弾で main 反映済 (`ec26c0e`)、ブランチ削除済 |
| `feat/osaka-full-engine-v2` | `c0e507e` | **完了** | ✅ Tier 1 第1弾で main 反映済 (`ec26c0e`)、ブランチ削除済 |
| `feat/fukuoka-full-engine-v2` | `6464498` | **完了**（v1.2 で追加）| ✅ Tier 1 第2弾で main 反映済 (`cf3fafa`)、ブランチ削除済 |
| `feat/nagoya-full-engine-v2` | `753849e` | **完了**（v1.3 で追加）| ⏸ Tier 1 第3弾（Phase 2C 統合タスク）で反映予定 |

### 1.2 commit 系譜（main 起点）

```
main (2ac5a87 → ec26c0e Tier 1 第1弾マージ後)
├── feat/yokohama-full-engine-v2 (✅ ec26c0e で main 反映済)
│   ├── 10d77e6  docs(yokohama): Phase 1 recon
│   ├── 02ea3b4  feat(engine-v2): yokohama-city.full.json — Step 1
│   ├── 76ca96f  feat(engine-v2): yokohama-full adapter — Step 2
│   ├── 6454d08  feat(engine-v2): yokohama builders + appendix wiring — Step 3
│   └── 10a5760  test(engine-v2): yokohama smoke (Y1–Y6 + 補助4) — Step 4
├── feat/osaka-full-engine-v2 (✅ ec26c0e で main 反映済)
│   ├── ae8ffb8  docs(osaka): Phase 1 recon
│   ├── 6e6a925  feat(engine-v2): osaka-city.full.json — Step 1
│   ├── 6189903  feat(engine-v2): osaka-full adapter — Step 2
│   ├── a57a61e  chore(tsconfig): exclude tmp/ from type-check scope
│   ├── 30794fb  feat(engine-v2): osaka builders + appendix wiring — Step 3
│   └── c0e507e  test(engine-v2): osaka smoke (O1–O4 + 補助7) — Step 4
├── feat/fukuoka-full-engine-v2 (✅ cf3fafa で main 反映済、ブランチ削除済)
│   ├── 37c60ed  docs(fukuoka): Phase 1 recon (lightweight)
│   ├── b366d82  docs(fukuoka): expand Phase 1 recon to detailed version
│   ├── a207209  feat(engine-v2): fukuoka-city.full.json — Step 1
│   ├── 8733bb8  feat(engine-v2): fukuoka-full adapter — Step 2
│   ├── a163840  feat(engine-v2): fukuoka builders + appendix wiring — Step 3
│   └── 6464498  test(engine-v2): fukuoka smoke (F1–F5 + 補助5) — Step 4
└── feat/nagoya-full-engine-v2 (⏸ Tier 1 第3弾 (Phase 2C) で main 反映予定)
    ├── 4527d8b  docs(nagoya): Phase 1 recon (rebased on cf3fafa)
    ├── 505229b  feat(engine-v2): nagoya-city.full.json — Step 1
    ├── b573bf7  feat(engine-v2): nagoya-full adapter — Step 2
    └── 753849e  feat(engine-v2): nagoya builders + appendix wiring + smoke (N1–N5 + 補助5) — Step 3
```

### 1.3 作業期間と意思決定タイミング

- v1.0 作業期間: 2026-04-29（osaka + yokohama 同日完走）
- v1.2 作業期間: 2026-04-30 朝（fukuoka 完走）
- v1.3 作業期間: 2026-04-30 昼（nagoya 完走、Tier 1 第1+2 弾本番反映後）
- SHUN 設計判断確定日: 2026-04-29（osaka/yokohama 7 項目）/ 2026-04-30 朝（fukuoka 4 項目）/ 2026-04-30 昼（nagoya 4 項目、claude.ai 推奨全採用方針恒久ルール下）
- 整合性総括承認日: 2026-04-29（v1.0）/ 2026-04-30 朝（v1.2）/ 2026-04-30 昼（v1.3、本文書）

## 2. 採用した 7 設計判断（最終一覧）

4 ブランチとも **7 項目すべて同方式 (B 方式) を採用**しており完全整合。

### 2.1 比較表

| # | 項目 | osaka | yokohama | fukuoka | **nagoya** | 既存実装との整合 | 判定区分 |
|:-:|---|---|---|---|---|---|---|
| 1 | `version` | `"2.0.0-osaka-full"` | `"2.0.0-yokohama-full"` | `"2.0.0-fukuoka-full"` | `"2.0.0-nagoya-full"` | kyoto/tokyo と同 semver パターン | **強制** (zod schema) |
| 2 | `scale` | `"medium"` | `"medium"` | `"medium"` | `"medium"` | kyoto/tokyo も `"medium"` | **強制** (enum 制約) |
| 3 | `deptId` | `"osaka-city"` | `"yokohama-city"` | `"fukuoka-city"` | `"nagoya-city"` | kyoto = `"kyoto-city"`, tokyo = `"tokyo-tfd"` | 慣例 |
| 4 | `license` フィールド | 省略 | 省略 | 省略 | 省略 | kyoto/tokyo にもなし、schema 未定義 | **強制** (schema strict) |
| 5 | placeholder 命名 | camelCase 8 keys | camelCase 8 keys | camelCase 8 keys + 10 keys（別表用、osaka 完全共通命名）| camelCase 8 keys + 10 keys（別表用、osaka/fukuoka 完全共通命名）| kyoto/tokyo 全 camelCase | 強い慣例 |
| 6 | 章を v2 2 層に圧縮 | flat 化（v1 1-1 + 1-2 統合）| 節 heading 落とし | **圧縮不要**（章→条 既に v2 と直接整合）| **Option B 機能別擬似章**（13 条フラット → 8 章グルーピング）| v2 schema 制約 (章→節 のみ) | **判断** (中) |
| 7 | 委託 gating | 単一 section + skip-list（番号 gap 許容）| 3 sections 一括 skip + 章タイトル残置 | 単一 section + skip-list（osaka 同型、第3条のみ）| 単一 section + skip-list（osaka/fukuoka 同型、第13条のみ）+ 別記様式 2 重 gating | tokyo 流 B 方式と一致、kyoto は A 方式 | **判断** (中) |

### 2.2 placeholder 共通化の効果

4 dept で **班員命名（`leaderName`/`tsuhouMember`/`shokaMember`/`hinanMember`/`kyugoMember`/`anzenMember`）が完全一致**（osaka 別表9 ↔ fukuoka 別表3 ↔ nagoya 別表3 で同一 placeholder 名）。kyoto/tokyo にはない placeholder のため、Phase 2C の `toRenderData` 拡張時に snake_case の単一マッピングで 3 dept をカバー可能。`tsunamiEvac` も osaka + yokohama で完全一致。fukuoka では `defenseSubLeader`（副隊長、第25条2項由来）を独自追加（nagoya/osaka 公式に副隊長行なし）。nagoya では `evacuationSite`（osaka/fukuoka と命名揃え）+ `tokaiQuakeApplicable`（名古屋独自、推進/強化地域フラグ将来予約）を追加。

### 2.3 dept ごとの圧縮手段の差（項目 6）

4 dept とも v2 schema 制約により章→節の 2 層に圧縮しているが、手段は異なる:

- **osaka**: v1 chapter 1-1（目的及び適用範囲等）+ 1-2（管理権原者の業務）の 2 グループを **flat 化**（1〜8 連番 section）。outsource 非該当時は番号 4 が gap になる
- **yokohama**: v1 章→節→条 の 3 層構造の **節を heading として落とし**、章→条 の 2 層化。条は元々グローバル連番のため番号 gap なし。ch7 委託全章は 3 sections 一括 skip で章タイトルのみ残す
- **fukuoka**: 公式 chukibo の **章→条 が既に v2 schema (2 層) と直接整合**。圧縮戦略不要。第3条のみ outsource gating で skip 時に番号 gap が出る（osaka と同パターン）
- **nagoya**: 公式 sonota は **章立てなし、第1〜13条のフラット構造**（横浜小規模用と類似）。**Option B 機能別擬似章**で 8 章にグルーピング（要領の章構造に整合）。ch1-general（第1-2条）/ ch2-prevention（第3-6条）/ ch3-jieishobo（第7条）/ ch4-quake（第8条）/ ch5-warning（第9-10条、**名古屋独自**）/ ch6-education（第11条）/ ch7-reports（第12条）/ ch8-outsource（第13条、gated）+ 附則。第13条 gating で skip 時に番号 gap（osaka と同パターン）

4 dept すべて v2 engine の制約に沿った妥当な対応。Phase 2B で UX 改善（osaka 章分離 / yokohama `（該当なし）` placeholder / fukuoka・nagoya 〔該当〕/〔非該当〕ペア化）の余地あり。

### 2.4 委託 gating 方式の差（項目 7）

| dept | 方式 | 説明 |
|---|---|---|
| **osaka** | B (skip-list 単一) | `ch1-outsource` 1 section、outsource 非該当で skip。番号 4 が gap |
| **yokohama** | B (skip-list 複数) | `ch7-art56-outsource` / `ch7-art57-command` / `ch7-art58-report` の 3 sections を一括 skip。章 7 タイトル「第７章　防火管理業務の一部委託」のみ残置 |
| **fukuoka** | B (skip-list 単一 + 別記様式 2 重 gating) | `ch1-art3-outsource` 1 section、outsource 非該当で skip（osaka 同型）。**かつ** appendices.ts dispatcher で別記様式（委託状況表）も同フラグで gating。adapter skip-list と appendix dispatcher の **2 重 gating 同期** を smoke F2 vs F1 で検証済 |
| **nagoya** | B (skip-list 単一 + 別記様式 2 重 gating) | `art13-outsource` 1 section、outsource 非該当で skip（osaka/fukuoka 同型）。**かつ** appendices.ts dispatcher で別記様式（委託状況票）も同フラグで gating（fukuoka 同パターン）。N2 vs N1 で 2 重 gating 同期検証済（tbl=3 vs tbl=0、第13条本文 + 別記様式 + outsourceCompany placeholder fill が同期 emit）|
| kyoto | A (ペア) | `ch1-outsource-applicable`〔該当〕 / `ch1-outsource-not-applicable`〔非該当〕 の 2 sections のいずれかを emit |
| tokyo | B (skip-list 単一) | osaka と同方式 |

4 dept の B 方式採用は v1 互換 + tokyo 整合の判断。fukuoka/nagoya は別記様式の 2 重 gating で第3条/第13条本文 + 委託状況票が同期動作（**所轄消防署提出時の整合性担保**）。Phase 2B で kyoto 流 A 方式への切替可能性あり（ペア追加で番号 gap 解消）。

## 3. テスト結果サマリ

### 3.1 全体スイート（リグレッション最終確認）

| 観点 | v1.0 (osaka+yokohama) | v1.2 (+fukuoka) | **v1.3 (+nagoya)** |
|---|---:|---:|---:|
| Test files | 8 passed (8) | 11 passed (11) | **12 passed (12)** |
| Tests | 57 passed (57) | 81 passed (81) | **92 passed (92)** |
| Duration | 679 ms | 1.88 s | 1.49 s |
| Type-check (`npx tsc --noEmit`) | PASS | PASS | **PASS**（exit 0、出力なし）|
| Lint (`npm run lint`) | 58 errors + 1 warning | 58 errors + 1 warning | **58 errors + 1 warning**（baseline 維持、Phase 2A 全 dept で +0）|

累積比 (v1.0 → v1.2 → v1.3): 57 → 81 → 92（v1.2 +24、v1.3 +11: nagoya smoke 10 + 既存細分化 1）。nagoya 単独追加分は 10 tests。

### 3.2 横浜 smoke test 詳細

ファイル: [lib/engine-v2/tests/yokohama-full-smoke.test.ts](../../lib/engine-v2/tests/yokohama-full-smoke.test.ts)（**214 行 / 10 tests**）

主要 6 ケース (Y1–Y6) + 補助 4 ケース（章順序 / 帰宅困難者条文 / tsunami body / cover subtitle）= 10 tests。

| ケース | フラグ | docx (B) | `<w:tbl>` |
|:-:|---|---:|---:|
| Y1 | 全 false | 15,540 | 1 |
| Y2 | outsourced=true | 15,878 | 2 |
| Y3 | unified_fpm=true | 15,666 | 1 |
| Y4 | disaster_center=true | 15,923 | 2 |
| Y5 | 全 true | 16,410 | 3 |
| Y6 | plan=light, 全 true | 15,089 | 0 |

### 3.3 大阪 smoke test 詳細

ファイル: [lib/engine-v2/tests/osaka-full-smoke.test.ts](../../lib/engine-v2/tests/osaka-full-smoke.test.ts)（**235 行 / 11 tests**）

主要 4 ケース (O1–O4) + 補助 7 ケース（章順序 / 第6章 + 5節 / 帰宅困難者非存在 / tsunamiEvac fill / cover subtitle / 別表9 buildingName / osaka-specific fields RenderData 流入）= 11 tests。

当初 10 想定だったが、補助の「osaka-specific fields RenderData 流入」を追加し 11 に。Phase 2A 範囲では別表2 STUB のため値は xml に出ないが、adapter が値を受け入れ STUB 構造が壊れていないことの回帰テスト。

| ケース | フラグ | docx (B) | `<w:tbl>` |
|:-:|---|---:|---:|
| O1 | outsourced=true × plan=light | 15,378 | 0 |
| O2 | outsourced=false × plan=light | 15,232 | 0 |
| O3 | outsourced=true × plan=standard × member fallback | 16,919 | 2 |
| O4 | outsourced=false × plan=standard × full member | 16,774 | 2 |

### 3.4 福岡 smoke test 詳細（v1.2 で追加）

ファイル: [lib/engine-v2/tests/fukuoka-full-smoke.test.ts](../../lib/engine-v2/tests/fukuoka-full-smoke.test.ts)（**224 行 / 10 tests**）

主要 5 ケース (F1–F5) + 補助 5 ケース（章順序 / 第5条(11) + 第25条 inline 無条件 emit / 帰宅困難者非存在 / cover subtitle 「【中規模防火対象物用】」 / 別表3 副隊長行 独自性）= 10 tests。

| ケース | フラグ | docx (B) | `<w:tbl>` | 第3条 | 第19条 | 別記様式 |
|:-:|---|---:|---:|:-:|:-:|:-:|
| F1 | plan=light × 全 false (minimum) | 16,365 | 0 | × | × | × |
| F2 | outsourced=true (2-gate sync) | 18,073 | 3 | ✅ | × | ✅ |
| F3 | unified_fpm=true | 17,805 | 2 | × | ✅ | × |
| F4 | 全 flags true | 18,114 | 3 | ✅ | ✅ | ✅ |
| F5 | plan=standard × 全 false (appendix on) | 17,764 | 2 | × | × | × |

**2 重 gating 同期確認 (F1 vs F2)**: `hasOutsourcedManagement` フラグで第3条本文（adapter skip-list）と別記様式（appendices.ts dispatcher）が同期動作。F1 では body/appendix 両方 hidden、F2 では両方 visible。第3条本文 + 別記様式 + outsourceCompany placeholder fill の 4 件すべてが F2 でのみ検出され、所轄消防署提出時の整合性を smoke レベルで保証。

### 3.4-2 名古屋 smoke test 詳細（v1.3 で追加）

ファイル: [lib/engine-v2/tests/nagoya-full-smoke.test.ts](../../lib/engine-v2/tests/nagoya-full-smoke.test.ts)（**221 行 / 10 tests**）

主要 5 ケース (N1–N5) + 補助 5 ケース（章順序 第１〜第８ + 附則 / **第9-10条 東海地震・警戒宣言 無条件 emit** (名古屋独自) / 帰宅困難者条文の非存在 / cover subtitle 「【中規模防火対象物用】」 / 別表3 隊長行 placeholder fill）= 10 tests。

| ケース | フラグ | docx (B) | `<w:tbl>` | 第13条 | 第9-10条 | 別記様式 |
|:-:|---|---:|---:|:-:|:-:|:-:|
| N1 | plan=light × 全 false (minimum) | 14,445 | 0 | × | ✅ | × |
| N2 | outsourced=true (**2-gate sync**) | 16,048 | 3 | ✅ | ✅ | ✅ |
| N3 | unified_fpm=true (**no-op**) | 15,778 | 2 | × | ✅ | × |
| N4 | tokai_quake_applicable=true (**no-op**) | 15,777 | 2 | × | ✅ | × |
| N5 | plan=standard × 全 false (appendix on) | 15,778 | 2 | × | ✅ | × |

**第9-10条 (東海地震注意情報・警戒宣言) は全 5 ケースで unconditional emit**（名古屋市は東海地震防災対策強化地域該当）。**N3/N4 は no-op として設計通り**（Phase 2A 範囲では gating 対象 section なし、Phase 2B で動的拡張可能）。**N2 で 2 重 gating 同期確認**（第13条本文 + 別記様式 + outsourceCompany placeholder の 3 件が同期 emit、福岡 F2 と同パターン）。

### 3.5 false positive 対応設計

osaka Step 3 で発見した「`地区隊の編成と任務` 文字列が body と appendix の両方に出る」問題に対し、**正規表現で全角スペース prefix 識別**を採用。fukuoka/nagoya でも同パターンを踏襲（**APPENDIX_RE の系統化**）。

| dept | 識別正規表現 | 用途 |
|---|---|---|
| osaka | `/別表９　（[^）]+）地区隊の編成と任務/` | `APPENDIX9_HEADING_RE` (Step 4 smoke) |
| fukuoka | `/別表[3３]　自衛消防隊の編成と任務/` | `APPENDIX3_HEADING_RE` (Step 4 smoke) |
| **nagoya** | `/別表[3３]　自衛消防隊の編成と任務/` | `APPENDIX3_HEADING_RE` (Step 3 smoke、fukuoka と同正規表現) |

`<w:tbl>` カウントによる構造的検証と併用し、文字列レベルの誤判定を排除。nagoya/fukuoka は別表3 名称が同一のため正規表現は完全一致、cover subtitle や章タイトル format で dept 識別。

### 3.6 ブランド差異の検証

各 dept で以下を回帰テストとして組み込み済:

| 検証項目 | 横浜 | 大阪 | 福岡 | **名古屋** |
|---|:-:|:-:|:-:|:-:|
| 章タイトル順序 | ✅ 第1〜第7 + 附則 | ✅ 第1〜第8 | ✅ 第1章〜第5章 | ✅ 第1〜第8章 + 附則（Option B 機能別擬似章）|
| cover subtitle | ✅ 「【一般用】」 | ✅ 「【中・小規模事業所・テナント用】」 | ✅ 「【中規模防火対象物用】」 | ✅ 「【中規模防火対象物用】」（5 dept 統一）|
| 帰宅困難者条文 | ✅ 第36条 / 第45条 unconditional emit | ✅ 非存在を確認（大阪に欠ける差分の保証） | ✅ 非存在を確認（福岡に欠ける差分の保証） | ✅ 非存在を確認（名古屋に欠ける差分の保証）|
| 南海トラフ | ✅ 第5章2節（第43条） tsunami body emit | ✅ 第6章 + 5節 全節 emit | ⊘ 該当なし（推進地域非該当）| ⊘ 該当なし（強化地域該当だが章独立せず、第8条 (1)〜(4) 震災対策に統合）|
| **東海地震・警戒宣言** | — | — | — | ✅ **第9-10条で独立 emit（unconditional、名古屋独自、強化地域該当）**|
| 西方沖地震 | — | — | ⊘ 該当なし（独自条文不在を recon §4.1 で確認）| — |
| 統括 inline | — | — | ✅ 第5条(11) + 第25条 無条件 emit（Phase 2A 設計遵守、Phase 2B 持ち越し） | ⊘ 統括防火管理者言及なし（中規模スコープ外、recon §4.1）|
| 防災管理 | 防火管理のみ（一体化なし） | 防火・防災一体（タイトル「防火・防災管理に係る消防計画」） | 防火管理のみ（一体化なし、横浜と同型）| 防火管理のみ（一体化なし、防火管理規程表記）|
| 別表3 副隊長行 | — | — | ✅ 福岡固有（osaka 別表9 になし、第25条2項由来）| ⊘ なし（osaka 同型、副隊長行は福岡固有）|
| **班/係 naming** | — | — | 係（消火係 等）| **班（消火班 等、osaka 同型）** |

## 4. Phase 2C への申し送り（route 統合 + UI + 本番疎通）

> **v1.3 注**:
> - Tier 1 第1弾（osaka + yokohama）は **`ec26c0e` で main 反映済**（PR #5、4/29）
> - Tier 1 第2弾（fukuoka 単独 PR）は **`cf3fafa` で main 反映済**（PR #6、4/30 朝）
> - Tier 1 第3弾（nagoya 単独 PR）は **本 v1.3 完了後に着手予定**（パターン A 同形）

### 4.1 route.ts 拡張

現状 `lib/engine-v2/adapters/generate-plan.ts` の `V2Pack` 型は **第2弾マージ後**で 6 値。nagoya 統合（第3弾）で以下に拡張:

```ts
export type V2Pack =
  | "sample"
  | "full"
  | "tokyo-full"
  | "osaka-full"
  | "yokohama-full"
  | "fukuoka-full"
  | "nagoya-full";   // 第3弾で追加
```

`runV2Adapter` の dispatcher に 1 分岐追加:

```ts
if (packName === "nagoya-full") return buildNagoyaFull(form);
```

### 4.2 app/api/generate-plan/route.ts auto-select

第2弾マージ後の auto-select は 5-way ternary（東京都/大阪府/神奈川県/福岡県/full）。nagoya 統合（第3弾）で以下に拡張:

```ts
pack = prefecture === "東京都" ? "tokyo-full"
     : prefecture === "大阪府" ? "osaka-full"
     : prefecture === "神奈川県" ? "yokohama-full"
     : prefecture === "福岡県" ? "fukuoka-full"
     : prefecture === "愛知県" ? "nagoya-full"   // 第3弾で追加
     : "full";
```

`packParam` の値判定にも `"nagoya-full"` を追加（6 値 → **7 値**）。

### 4.3 UI prefecture 選択肢

text input 維持（B1 採用、第1弾と同方針）。FAQ + deptName 派生（[app/page.tsx](../../app/page.tsx)）を nagoya 統合で更新:

- FAQ_ITEMS L43: 「京都市消防局・東京消防庁・大阪市消防局・横浜市消防局・福岡市消防局の最新様式」→「...・**名古屋市消防局**の最新様式」（6 都市並び）
- FAQ_ITEMS L47: 「正式対応...名古屋は順次対応予定」→「**6 都市すべて正式対応**」（順次対応予定セクション削除、Tier 1 完了）
- deptName 派生 (L160): `form.city === "名古屋市" → "名古屋市消防局"` を追加（C1: city レベル維持、6-way → **7-way ternary**）

### 4.4 toRenderData 拡張

`tsunamiEvac` placeholder（osaka/yokohama 共通）+ 班員 placeholder（osaka 別表9 ↔ fukuoka 別表3 共通命名: `leaderName`/`tsuhouMember`/`shokaMember`/`hinanMember`/`kyugoMember`/`anzenMember`）を `lib/engine-v2/adapters/to-render-data.ts` に追加候補:

```ts
tsunamiEvac: str(form.tsunami_evac),
leaderName: str(form.leader_name),
tsuhouMember: str(form.tsuhou_member),
// ... 5 班員
```

3 dept adapter の `extendFor{Dept}` で個別設定済のため、toRenderData 側に上げれば extend 側から外せる（将来的なリファクタ）。Phase 2C スコープでは optional。

### 4.5 dispatcher テスト

第2弾で 5 cases 化された `lib/engine-v2/tests/dispatcher.test.ts`（full/tokyo-full/osaka-full/yokohama-full/fukuoka-full）に **nagoya-full ケースを追加** (6 cases):

```ts
it("pack=nagoya-full → nagoya builder (中規模防火対象物用 + 第１章 format + 名古屋独自 第5章)", async () => {
  const xml = await dispatch("nagoya-full");
  expect(xml).toContain("第１章　総則");
  expect(xml).toContain("【中規模防火対象物用】");
  expect(xml).toContain("第５章　警戒宣言発令時の応急対策"); // 名古屋独自
});
```

### 4.6 本番疎通テスト観点（6 都市分）

| 都市 | prefecture | 期待 pack | 期待 `<w:tbl>`（standard plan）|
|---|---|---|---:|
| 京都 | 京都府 | full | 13 |
| 東京 | 東京都 | tokyo-full | 16 |
| 大阪 | 大阪府 | osaka-full | 2 |
| 横浜 | 神奈川県 | yokohama-full | 1 |
| 福岡 | 福岡県 | fukuoka-full | 2 |
| **名古屋** | **愛知県** | **nagoya-full** | **2** |
| その他 | （任意）| full（kyoto fallback）| — リグレッション |
| light プラン × 各 dept | — | — | 別表 skip 動作確認 |

## 5. Phase 2B への申し送り（別表完全実装 + リファイン）

### 5.1 別表 STUB → 完全実装

| dept | 残 STUB 別表 | gating | 優先度 |
|---|---|---|---|
| **osaka** | 別表1 委託状況表（5項目）| `hasOutsourcedManagement` | 高（gated 別表） |
| **osaka** | 別表2 災害想定（4項目）| なし | 中 |
| **osaka** | 別表3 防火・防災対象物実態把握表（10項目）| なし | 中 |
| **osaka** | 別表7 防火・防災管理維持台帳に編冊する書類等（12行 fixed）| なし | 低 |
| **osaka** | 別表8 非常用物品等の一覧（8行 fixed + storageLocation）| なし | 中 |
| **yokohama** | 別表1 自主点検チェックリスト | なし | 中 |
| **yokohama** | 別表2 自衛消防隊の組織及び任務分担 | なし | 中 |
| **fukuoka** | 別表1 火災予防のための組織編成（階・区域 × 防火担当責任者・火元責任者）| なし | 中 |
| **fukuoka** | 別表2 自主点検を実施するための組織編成表（点検班 × 対象設備）| なし | 中 |
| **nagoya** | 別表1 予防管理組織編成（第3条インラインテーブル由来、階×担当区域×職氏名） | なし | 中 |
| **nagoya** | 別表2 自主点検チェックリスト（第4条+第6条インラインテーブル由来） | なし | 中 |
| **nagoya** | 第8条 (1) 備蓄品テーブル / 救助救出資機材テーブル | なし | 中（名古屋独自）|
| **nagoya** | 第11条 教育時期表 / 訓練種別表 | なし | 中（名古屋独自）|

osaka 別表2 / 別表3 の値は extend で既に RenderData に流入済。fukuoka も同様に `defenseHandler`, `fireHandler`, `inspectionTeam` を先取り定義済。**nagoya も Step 2 で `defenseHandler`, `fireHandler`, `inspectionTeam` 同名で先取り定義済**（osaka/fukuoka と完全共通）。Phase 2B の builders 実装は **adapter 編集なしで data.xxx 参照のみ**で完結する設計。

### 5.2 ブランドカラー確定

| dept | 現状 (Phase 2A interim) | Phase 2B での確定対象 |
|---|---|---|
| osaka | osakaTheme = 濃緑 `#1F6E5B` / 淡緑 `#F0F7F4` | 大阪市公式ブランドカラー（緑系？）の確認後に確定 |
| yokohama | kyotoTheme borrow (navy `#2B4C7E` / `#F5F7FA`) | 横浜市ブランドカラー（青系）に置換、独立 yokohamaTheme 定義 |
| **fukuoka** | fukuokaTheme = 紺青系 `#1A4789` / 淡青 `#F0F4FA` (暫定値) | 福岡市公式ブランドカラーの確認後に確定 |
| **nagoya** | nagoyaTheme = ライトオレンジ系 `#D77A1F` / 淡オレンジ `#FCF3E8` (暫定値) | 名古屋市公式ブランドカラーの確認後に確定 |

4 dept とも `lib/engine-v2/builders/<dept>/appendices.ts` 内に local 定義のため、shared/table-helpers.ts に集約するリファクタも併せて検討。**ブランドカラー一括確定**（osaka 緑 / yokohama navy / fukuoka 紺青 / nagoya オレンジ）が Phase 2B 序盤の目玉タスク候補。

### 5.3 設計の再評価候補

| dept | 項目 | 内容 | 影響範囲 |
|---|---|---|---|
| yokohama | ch7 全章 gating 時の章タイトル emit | outsourced=false 時に「第７章　防火管理業務の一部委託」のみ残る冗長性。`（該当なし）　防火管理業務の一部委託は行わない。` placeholder section の追加で UX 改善 | yokohama-city.full.json + adapter |
| yokohama | ch1-art3-unified-clause / ch1-art4-unified-clause の節分離 | 統括 inline 節を独立 section にしている現状が読みやすさを損なう。テキスト合成（条本体 + 第5項を文字列結合）方式への切替検討 | yokohama-city.full.json + adapter |
| osaka | ch1 flat 化の章分離 C 案 | v1 1-1 と 1-2 をそれぞれ独立章 (ch1, ch2) に分離して章数 8→9 に。所轄消防署提出時の慣例次第 | osaka-city.full.json 構造再設計 |
| osaka | 委託 ペア方式 (kyoto 流 A 案) | `〔該当〕`/`〔非該当〕` ペアで番号 gap 解消。所轄消防署提出時の慣例次第 | osaka-city.full.json + adapter（5 行程度の修正） |
| **fukuoka** | 第3条 番号 gap ペア化 | osaka と同型の既存負債。`〔該当〕`/`〔非該当〕` ペアで第2条→第4条 gap 解消 | fukuoka-city.full.json + adapter |
| **fukuoka** | 第5条(11) 統括 inline + 第25条 inline gating | Phase 2A は無条件 emit（独立条のみ gating）。Phase 2B で `requiresUnifiedFpm=false` 時に inline references も skip する設計検討 | fukuoka-city.full.json (sub-list 文字列分解 or 2 variant section) |
| **fukuoka** | 別記様式 forms.ts 抽出 | 現状 appendices.ts 包含（B-2 B1）。他 dept (横浜 別記様式相当 / 名古屋 別記様式) が増えた段階で `lib/engine-v2/builders/<dept>/forms.ts` 分離検討 | builders/<dept>/forms.ts 新設 |
| **fukuoka** | 第13/14/16/33/36/40 条 インラインテーブル emit | Phase 2A は body の導入文 + 「下表のとおり」省略形。Phase 2B で実テーブル（点検時期表 / 備蓄品表 / 防災教育表 / 訓練表）を builders/fukuoka/tables/ に追加 | builders/fukuoka/tables/*.ts 新設 |
| **nagoya** | 第13条 番号 gap ペア化 | osaka/fukuoka と同型の既存負債。`〔該当〕`/`〔非該当〕` ペア化で番号 gap 解消（第12条→第13条）| nagoya-city.full.json + adapter |
| **nagoya** | requiresUnifiedFpm の gating 対象 section 追加 | Phase 2A 範囲では gating 対象 section が JSON pack に存在しない (recon §4.1: 中規模スコープ外)。Phase 2B で要領由来の統括関連条文を JSON 追加 → 既存の skip-list が自動的に gating 動作 | nagoya-city.full.json (新規 section 追加) |
| **nagoya** | tokaiQuakeApplicable=false 時の第9-10条 gating | 現状無条件 emit (強化地域該当)。推進/強化地域外向けに動的 gating 拡張 | adapter sectionsToSkip (コメントアウト箇所を有効化)|
| **nagoya** | 第3/4/6/7/8/11 条 インラインテーブル emit | Phase 2A は body の導入文 + 「下表のとおり」省略形。Phase 2B で 6 種テーブル（予防管理組織 / 自主検査票 / 法定点検時期 / 自衛消防隊編成 / 備蓄品+救助救出 / 教育時期+訓練種別）を builders/nagoya/tables/ に追加 | builders/nagoya/tables/*.ts 新設 |

これら 12 項目は Phase 2A 完了承認時に「Phase 2B で必要に応じて別 PR」と SHUN 確定済。

### 5.4 toRenderData リファクタ機会

4 dept で個別に `extendFor{Dept}` を持っているが、共通 placeholder は toRenderData 本体に上げる方が cleaner:
- `tsunamiEvac` (osaka + yokohama 共通)
- `leaderName` / `tsuhouMember` / `shokaMember` / `hinanMember` / `kyugoMember` / `anzenMember` (osaka 別表9 + fukuoka 別表3 + **nagoya 別表3** 完全共通命名)
- `defenseSubLeader` (fukuoka 独自、osaka/nagoya が将来追加した場合の共通化候補)
- `defenseHandler` / `fireHandler` / `inspectionTeam` (fukuoka + **nagoya** 共通)
- `evacuationSite` (osaka + fukuoka + **nagoya** 共通)
- `planStartDate` (osaka + yokohama + fukuoka + **nagoya** 共通)
- `reportFrequency` (fukuoka + **nagoya** 共通)
- `tokaiQuakeApplicable` (**nagoya 独自**、推進/強化地域外への将来予約)

Phase 2B 中盤での整理候補。adapter 行数を osaka 268 → ~230、fukuoka 237 → ~200、**nagoya 263 → ~210** 程度に削減見込み。共通化の効果は dept 数増加とともに加速。

### 5.5 osaka 別表9 / fukuoka 別表3 / **nagoya 別表3** と shared buildFireBrigade の溝

3 dept ともに **shared `buildFireBrigade` を再利用せず custom 実装**:
- osaka: v1 仕様の班 naming（通報連絡班 等）と任務テキストが kyoto 流 `COMMON_BRIGADE_ROWS` と異なる
- fukuoka: 公式 chukibo の **係 naming**（消火係 等）+ **副隊長行**（osaka/nagoya にない、第25条2項由来）+ 任務テキストが福岡固有
- nagoya: 公式 sonota の **班 naming**（osaka 同型）+ 副隊長行なし + 「（＊ 必要に応じ組織）」表記（救護班・安全防護班）+ 任務テキストが名古屋固有

**3 dept の共通化が確定**したため、Phase 2B で shared 側に「班/係 rows を opt 経由で完全置換可能にする extension」+「副隊長 optional row」+「『必要に応じ組織』脚注 optional」を追加すれば、3 dept custom 実装を shared に巻き取れる見込み。**Phase 2A 完走時点で shared refactor 価値が定量的に確定**。

## 6. Phase 2A 完了の正式宣言

| dept | Phase 2A 状態 | 最終 commit | main 反映 | 確認 |
|---|---|---|---|---|
| **yokohama** | **完了** | `10a5760` | ✅ `ec26c0e`（Tier 1 第1弾、PR #5）| Step 4 完了時に Step 5 = 最終 lint 吸収済み |
| **osaka** | **完了** | `c0e507e` | ✅ `ec26c0e`（Tier 1 第1弾、PR #5）| v1.0 本文書で最終確認 |
| **fukuoka** | **完了** | `6464498` | ✅ `cf3fafa`（Tier 1 第2弾、PR #6）| v1.2 本文書で最終確認、Tier 1 第2弾で本番反映済 |
| **nagoya** | **完了**（v1.3）| `753849e` | ⏸ Tier 1 第3弾（Phase 2C パターン A）で予定 | v1.3 本文書で最終確認 |

4 dept とも:
- Step 1〜5 全完走（nagoya は Step 3+4 を一括実行で smoke 同時完成、Step 4 = v1.3 化、Step 5 = structure tests）
- 全テスト **92/92 PASS**（v1.3 累計、kyoto/tokyo + osaka 11 + yokohama 10 + fukuoka 10 + nagoya 10 + dispatcher 4）
- lint baseline 58 維持
- 型チェック PASS
- 設計判断 7 項目すべて整合
- osaka/yokohama/fukuoka は main 反映済、nagoya は Phase 2C 第3弾で main マージ予定

## 7. Phase 2C 着手準備完了の確認

- [x] **4 ブランチ独立 push 済**: osaka/yokohama/fukuoka は main 反映済 + ブランチ削除済、**nagoya `753849e` 残存**（第3弾統合タスク用）
- [x] **整合性総括完了**: 本文書 v1.3
- [x] **Phase 2C スコープ明確化**: §4.1〜4.6 に列挙、第3弾は nagoya 単独 PR
- [x] **回帰リスク評価**: kyoto/tokyo/osaka/yokohama/fukuoka 既存テストはすべて pass、Tier 1 第3弾で route.ts を 1 分岐追加するのみで影響範囲は限定的
- [x] **TS table override の競合なし**: 4 dept とも `overrides: Record<string, SectionOverride> = {}` で空、kyoto/tokyo の override セットと干渉なし
- [x] **dispatcher テストの拡張容易性**: 第2弾で 5 cases 化済、名古屋分は 1 ケース追加で済む

### Phase 2C 第3弾（パターン A: 名古屋単独 PR）の最小構成:

1. main から `feat/tier1-nagoya-integration` を派生
2. `git merge feat/nagoya-full-engine-v2 --no-ff`
3. `lib/engine-v2/adapters/generate-plan.ts` の `V2Pack` 型 + dispatcher 拡張（1 行追加 + 1 分岐追加）
4. `app/api/generate-plan/route.ts` の `packParam` 検証 6 値 → 7 値、auto-select 5-way → 6-way（`prefecture === "愛知県" ? "nagoya-full"`）
5. `app/page.tsx` の FAQ + deptName 派生に名古屋追加（**6 都市すべて正式対応**、順次対応予定セクション削除で Tier 1 完了状態）
6. `lib/engine-v2/tests/dispatcher.test.ts` に nagoya-full ケース追加（5 → 6 cases）
7. PR 作成 → Vercel preview **6 都市疎通**テスト → SHUN 本番 push → 本番疎通
8. **6 都市カバレッジ達成宣言**（京都・東京・大阪・横浜・福岡・名古屋）

`cf3fafa`（Tier 1 第2弾）と同じ流れ、本日中の本番反映を狙う。

## 付録 A: テスト集計（v1.3 全体）

```
Test Files  12 passed (12)
Tests       92 passed (92)
  - kyoto-full-smoke.test.ts        (Phase 1+ 既存)
  - tokyo-full-smoke.test.ts        (Phase 1+ 既存)
  - yokohama-full-smoke.test.ts     (Phase 2A、10 tests)
  - osaka-full-smoke.test.ts        (Phase 2A、11 tests)
  - fukuoka-full-smoke.test.ts      (Phase 2A、10 tests) ← v1.2 で追加
  - nagoya-full-smoke.test.ts       (Phase 2A、10 tests) ← v1.3 で追加
  - dispatcher.test.ts              (Tier 1 第1+2弾、5 tests)
  - generate-plan-adapter.test.ts   (既存)
  - render-pack.test.ts             (既存)
  - placeholder.test.ts             (既存)
  - indent-heuristic.test.ts        (既存)
  - template-pack.test.ts (types/)  (既存)
Duration  1.49 s
```

## 付録 B: 関連ドキュメント

- [docs/research/osaka-full-recon-v0.1.md](osaka-full-recon-v0.1.md) — 大阪 Phase 1 recon
- [docs/research/yokohama-full-recon-v0.1.md](yokohama-full-recon-v0.1.md) — 横浜 Phase 1 recon
- [docs/research/fukuoka-full-recon-v0.1.md](fukuoka-full-recon-v0.1.md) — 福岡 Phase 1 recon（v1.2 で追加）
- [docs/research/nagoya-full-recon-v0.1.md](nagoya-full-recon-v0.1.md) — 名古屋 Phase 1 recon（v1.3 で追加、Phase 2A 完走済）
