# Phase 2A — Tier 1 Symmetry Report (osaka / yokohama / fukuoka)

> **改訂履歴**:
> - **v1.2 (2026-04-30)**: 福岡市消防局 (fukuoka-city) の Phase 2A 完走を反映。
>   3 dept 統合報告化。テスト累計 81 passed / 11 test files。
> - v1.0 (2026-04-29): 初版、osaka + yokohama 2 dept 報告として作成。

Phase 2A の Tier 1 展開対象である **大阪市消防局 (osaka-city)**、
**横浜市消防局 (yokohama-city)**、**福岡市消防局 (fukuoka-city)** の
v2 engine 実装が完了したことを記録し、3 ブランチで採用した設計判断の
整合性、テスト結果、Phase 2B / 2C への申し送り事項を一元化した
リリースゲート文書。

## 1. 基本メタ情報

### 1.1 ブランチと最新 commit

| ブランチ | 最新 commit | Phase 2A 状態 | main 統合 |
|---|---|---|---|
| `feat/yokohama-full-engine-v2` | `10a5760` | **完了** | ✅ Tier 1 第1弾で main 反映済 (`ec26c0e`) |
| `feat/osaka-full-engine-v2` | `c0e507e` | **完了** | ✅ Tier 1 第1弾で main 反映済 (`ec26c0e`) |
| `feat/fukuoka-full-engine-v2` | `6464498` | **完了**（v1.2 で追加）| ⏸ Phase 2C 統合タスクで反映予定 |

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
└── feat/fukuoka-full-engine-v2 (⏸ Phase 2C で main 反映予定)
    ├── 37c60ed  docs(fukuoka): Phase 1 recon (lightweight)
    ├── b366d82  docs(fukuoka): expand Phase 1 recon to detailed version
    ├── a207209  feat(engine-v2): fukuoka-city.full.json — Step 1
    ├── 8733bb8  feat(engine-v2): fukuoka-full adapter — Step 2
    ├── a163840  feat(engine-v2): fukuoka builders + appendix wiring — Step 3
    └── 6464498  test(engine-v2): fukuoka smoke (F1–F5 + 補助5) — Step 4
```

### 1.3 作業期間と意思決定タイミング

- v1.0 作業期間: 2026-04-29（osaka + yokohama 同日完走）
- v1.2 作業期間: 2026-04-30（fukuoka 完走）
- SHUN 設計判断確定日: 2026-04-29（osaka/yokohama 7 項目）/ 2026-04-30（fukuoka 4 項目 + 設計判断 4 件、claude.ai 推奨全採用方針）
- 整合性総括承認日: 2026-04-29（v1.0）/ 2026-04-30（v1.2、本文書）

## 2. 採用した 7 設計判断（最終一覧）

3 ブランチとも **7 項目すべて同方式 (B 方式) を採用**しており完全整合。

### 2.1 比較表

| # | 項目 | 採用 (osaka) | 採用 (yokohama) | 採用 (fukuoka) | 既存実装との整合 | 判定区分 |
|:-:|---|---|---|---|---|---|
| 1 | `version` | `"2.0.0-osaka-full"` | `"2.0.0-yokohama-full"` | `"2.0.0-fukuoka-full"` | kyoto/tokyo と同 semver パターン | **強制** (zod schema) |
| 2 | `scale` | `"medium"` | `"medium"` | `"medium"` | kyoto/tokyo も `"medium"` | **強制** (enum 制約) |
| 3 | `deptId` | `"osaka-city"` | `"yokohama-city"` | `"fukuoka-city"` | kyoto = `"kyoto-city"`, tokyo = `"tokyo-tfd"` | 慣例 |
| 4 | `license` フィールド | 省略 | 省略 | 省略 | kyoto/tokyo にもなし、schema 未定義 | **強制** (schema strict) |
| 5 | placeholder 命名 | camelCase 8 keys（`buildingName`, `tsunamiEvac` 等）| camelCase 8 keys（`companyName`, `tsunamiEvac` 等）| camelCase 8 keys（本文）+ 10 keys（別表用ロール別、osaka と完全共通命名）| kyoto/tokyo 全 camelCase | 強い慣例 |
| 6 | 章を v2 2 層に圧縮 | flat 化（v1 1-1 + 1-2 統合）| 節 heading 落とし | **圧縮不要**（章→条 既に v2 と直接整合）| v2 schema 制約 (章→節 のみ) | **判断** (中) |
| 7 | 委託 gating | 単一 section + skip-list（番号 gap 許容）| 3 sections 一括 skip + 章タイトル残置 | 単一 section + skip-list（osaka 同型、第3条のみ）| tokyo 流 B 方式と一致、kyoto は A 方式 | **判断** (中) |

### 2.2 placeholder 共通化の効果

3 dept で **`tsunamiEvac`（osaka/yokohama）と osaka 別表9 ↔ fukuoka 別表3 の班員命名（`leaderName`/`tsuhouMember`/`shokaMember`/`hinanMember`/`kyugoMember`/`anzenMember`）が完全一致**。kyoto/tokyo にはない placeholder のため、Phase 2C の `toRenderData` 拡張時に snake_case の単一マッピングで複数 dept をカバー可能。fukuoka では加えて `defenseSubLeader`（副隊長、第25条2項由来）を独自追加し、osaka が将来 副隊長行を導入する場合の共通化に備えて先取り命名済。

### 2.3 dept ごとの圧縮手段の差（項目 6）

3 dept とも v2 schema 制約により章→節の 2 層に圧縮しているが、手段は異なる:

- **osaka**: v1 chapter 1-1（目的及び適用範囲等）+ 1-2（管理権原者の業務）の 2 グループを **flat 化**（1〜8 連番 section）。outsource 非該当時は番号 4 が gap になる
- **yokohama**: v1 章→節→条 の 3 層構造の **節を heading として落とし**、章→条 の 2 層化。条は元々グローバル連番のため番号 gap なし。ch7 委託全章は 3 sections 一括 skip で章タイトルのみ残す
- **fukuoka**: 公式 chukibo の **章→条 が既に v2 schema (2 層) と直接整合**。圧縮戦略不要。第3条のみ outsource gating で skip 時に番号 gap が出る（osaka と同パターン）

3 dept すべて v2 engine の制約に沿った妥当な対応。Phase 2B で UX 改善（osaka 章分離 / yokohama `（該当なし）` placeholder / fukuoka 〔該当〕/〔非該当〕ペア化）の余地あり。

### 2.4 委託 gating 方式の差（項目 7）

| dept | 方式 | 説明 |
|---|---|---|
| **osaka** | B (skip-list 単一) | `ch1-outsource` 1 section、outsource 非該当で skip。番号 4 が gap |
| **yokohama** | B (skip-list 複数) | `ch7-art56-outsource` / `ch7-art57-command` / `ch7-art58-report` の 3 sections を一括 skip。章 7 タイトル「第７章　防火管理業務の一部委託」のみ残置 |
| **fukuoka** | B (skip-list 単一 + 別記様式 2 重 gating) | `ch1-art3-outsource` 1 section、outsource 非該当で skip（osaka 同型）。**かつ** appendices.ts dispatcher で別記様式（委託状況表）も同フラグで gating。adapter skip-list と appendix dispatcher の **2 重 gating 同期** を smoke F2 vs F1 で検証済 |
| kyoto | A (ペア) | `ch1-outsource-applicable`〔該当〕 / `ch1-outsource-not-applicable`〔非該当〕 の 2 sections のいずれかを emit |
| tokyo | B (skip-list 単一) | osaka と同方式 |

3 dept の B 方式採用は v1 互換 + tokyo 整合の判断。fukuoka は別記様式の 2 重 gating で第3条本文 + 委託状況表が同期動作（**所轄消防署提出時の整合性担保**）。Phase 2B で kyoto 流 A 方式への切替可能性あり（ペア追加で番号 gap 解消）。

## 3. テスト結果サマリ

### 3.1 全体スイート（リグレッション最終確認）

| 観点 | v1.0 (osaka+yokohama) | **v1.2 (+fukuoka)** |
|---|---:|---:|
| Test files | 8 passed (8) | **11 passed (11)** |
| Tests | 57 passed (57) | **81 passed (81)** |
| Duration | 679 ms | 1.88 s |
| Type-check (`npx tsc --noEmit`) | PASS | **PASS**（exit 0、出力なし）|
| Lint (`npm run lint`) | 58 errors + 1 warning | **58 errors + 1 warning**（baseline 維持、Phase 2A 全 dept で +0）|

直前比 (v1.0 → v1.2): 57 → 81（**+24**: fukuoka smoke 10 + dispatcher 4 + 既存テストの細分化 10）。fukuoka 単独追加分は 10 tests。

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

### 3.5 false positive 対応設計

osaka Step 3 で発見した「`地区隊の編成と任務` 文字列が body と appendix の両方に出る」問題に対し、**正規表現で全角スペース prefix 識別**を採用。fukuoka でも同パターンを踏襲（**APPENDIX_RE の系統化**）。

| dept | 識別正規表現 | 用途 |
|---|---|---|
| osaka | `/別表９　（[^）]+）地区隊の編成と任務/` | `APPENDIX9_HEADING_RE` (Step 4 smoke) |
| fukuoka | `/別表[3３]　自衛消防隊の編成と任務/` | `APPENDIX3_HEADING_RE` (Step 4 smoke) |

`<w:tbl>` カウントによる構造的検証と併用し、文字列レベルの誤判定を排除。

### 3.6 ブランド差異の検証

各 dept で以下を回帰テストとして組み込み済:

| 検証項目 | 横浜 | 大阪 | **福岡** |
|---|:-:|:-:|:-:|
| 章タイトル順序 | ✅ 第1〜第7 + 附則 | ✅ 第1〜第8 | ✅ 第1章〜第5章 |
| cover subtitle | ✅ 「【一般用】」 | ✅ 「【中・小規模事業所・テナント用】」 | ✅ 「【中規模防火対象物用】」 |
| 帰宅困難者条文 | ✅ 第36条 / 第45条 unconditional emit | ✅ 非存在を確認（大阪に欠ける差分の保証） | ✅ 非存在を確認（福岡に欠ける差分の保証） |
| 南海トラフ | ✅ 第5章2節（第43条） tsunami body emit | ✅ 第6章 + 5節 全節 emit | ⊘ 該当なし（推進地域非該当）|
| 西方沖地震 | — | — | ⊘ 該当なし（独自条文不在を recon §4.1 で確認）|
| 統括 inline | — | — | ✅ 第5条(11) + 第25条 無条件 emit（Phase 2A 設計遵守、Phase 2B 持ち越し） |
| 防災管理 | 防火管理のみ（一体化なし） | 防火・防災一体（タイトル「防火・防災管理に係る消防計画」） | 防火管理のみ（一体化なし、横浜と同型）|
| 別表3 副隊長行 | — | — | ✅ 福岡固有（osaka 別表9 になし、第25条2項由来） |

## 4. Phase 2C への申し送り（route 統合 + UI + 本番疎通）

> **v1.2 注**: Tier 1 第1弾（osaka + yokohama）は **`ec26c0e` で main 反映済**（PR #5）。本セクションは fukuoka を中心とした Tier 1 第2弾（パターン A: 福岡単独 PR）の作業項目。

### 4.1 route.ts 拡張

現状 `lib/engine-v2/adapters/generate-plan.ts` の `V2Pack` 型は **第1弾マージ後**で `"sample" | "full" | "tokyo-full" | "osaka-full" | "yokohama-full"`。fukuoka 統合で以下に拡張:

```ts
export type V2Pack =
  | "sample"
  | "full"
  | "tokyo-full"
  | "osaka-full"
  | "yokohama-full"
  | "fukuoka-full";   // 第2弾で追加
```

`runV2Adapter` の dispatcher に 1 分岐追加:

```ts
if (packName === "fukuoka-full") return buildFukuokaFull(form);
```

### 4.2 app/api/generate-plan/route.ts auto-select

第1弾マージ後の auto-select は 4-way ternary（東京都/大阪府/神奈川県/full）。fukuoka 統合で以下に拡張:

```ts
pack = prefecture === "東京都" ? "tokyo-full"
     : prefecture === "大阪府" ? "osaka-full"
     : prefecture === "神奈川県" ? "yokohama-full"
     : prefecture === "福岡県" ? "fukuoka-full"   // 第2弾で追加
     : "full";
```

`packParam` の値判定にも `"fukuoka-full"` を追加（5 値 → **6 値**）。

### 4.3 UI prefecture 選択肢

text input 維持（B1 採用、第1弾と同方針）。FAQ + deptName 派生（[app/page.tsx](../../app/page.tsx)）を更新:

- FAQ_ITEMS L43: 「京都市消防局・東京消防庁・大阪市消防局・横浜市消防局・**福岡市消防局**の最新様式」
- FAQ_ITEMS L47: 「正式対応...名古屋は順次対応予定」（福岡を「正式対応」側に移動、名古屋のみ残置）
- deptName 派生 (L160): `form.city === "福岡市" → "福岡市消防局"` を追加（C1: city レベル維持）

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

第1弾で導入された `lib/engine-v2/tests/dispatcher.test.ts`（4 cases: full/tokyo-full/osaka-full/yokohama-full）に **fukuoka-full ケースを追加** (5 cases):

```ts
it("pack=fukuoka-full → fukuoka builder (中規模防火対象物用 + 第１章 format)", async () => {
  const xml = await dispatch("fukuoka-full");
  expect(xml).toContain("第１章　総則");
  expect(xml).toContain("【中規模防火対象物用】");
});
```

### 4.6 本番疎通テスト観点（5 都市分）

| 都市 | prefecture | 期待 pack | 期待 `<w:tbl>`（standard plan）|
|---|---|---|---:|
| 京都 | 京都府 | full | 13 |
| 東京 | 東京都 | tokyo-full | 16 |
| 大阪 | 大阪府 | osaka-full | 2 |
| 横浜 | 神奈川県 | yokohama-full | 1 |
| **福岡** | **福岡県** | **fukuoka-full** | **2** |
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

osaka 別表2 / 別表3 の値は extend で既に RenderData に流入済（`casualtyEstimate`, `propertyDamageEstimate`, `buildingAddress` 等 14 fields）。fukuoka も同じく Step 2 で `defenseHandler`, `fireHandler`, `inspectionTeam` の placeholder を先取り定義済。Phase 2B の builders 実装は **adapter 編集なしで data.xxx 参照のみ**で完結する設計。

### 5.2 ブランドカラー確定

| dept | 現状 (Phase 2A interim) | Phase 2B での確定対象 |
|---|---|---|
| osaka | osakaTheme = 濃緑 `#1F6E5B` / 淡緑 `#F0F7F4` | 大阪市公式ブランドカラー（緑系？）の確認後に確定 |
| yokohama | kyotoTheme borrow (navy `#2B4C7E` / `#F5F7FA`) | 横浜市ブランドカラー（青系）に置換、独立 yokohamaTheme 定義 |
| **fukuoka** | fukuokaTheme = 紺青系 `#1A4789` / 淡青 `#F0F4FA` (暫定値) | 福岡市公式ブランドカラーの確認後に確定 |

3 dept とも `lib/engine-v2/builders/<dept>/appendices.ts` 内に local 定義のため、shared/table-helpers.ts に集約するリファクタも併せて検討。

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

これら 8 項目は Phase 2A 完了承認時に「Phase 2B で必要に応じて別 PR」と SHUN 確定済。

### 5.4 toRenderData リファクタ機会

3 dept で個別に `extendFor{Dept}` を持っているが、共通 placeholder は toRenderData 本体に上げる方が cleaner:
- `tsunamiEvac` (osaka + yokohama 共通)
- `leaderName` / `tsuhouMember` / `shokaMember` / `hinanMember` / `kyugoMember` / `anzenMember` (osaka 別表9 + fukuoka 別表3 完全共通命名)
- `defenseSubLeader` (fukuoka 独自、osaka が将来追加した場合の共通化候補)

Phase 2B 中盤での整理候補。adapter 行数を osaka 268 → ~230、fukuoka 237 → ~200 程度に削減見込み。

### 5.5 osaka 別表9 / fukuoka 別表3 と shared buildFireBrigade の溝

osaka 別表9 + fukuoka 別表3 はともに **shared `buildFireBrigade` を再利用せず custom 実装**:
- osaka: v1 仕様の班 naming（通報連絡班 等）と任務テキストが kyoto 流 `COMMON_BRIGADE_ROWS` と異なる
- fukuoka: 公式 chukibo の係 naming（消火係 等）+ 副隊長行（osaka にない、第25条2項由来）+ 任務テキストが福岡固有

Phase 2B で名古屋の自衛消防隊表（Phase 2A 着手保留中）を実装する際、shared 側に **班/係 rows を opt 経由で完全置換可能にする extension** を追加すれば osaka + fukuoka custom も shared に巻き取れる。3 dept (osaka/fukuoka/nagoya) の共通化が見えれば Phase 2B での shared refactor 価値が確定する。

## 6. Phase 2A 完了の正式宣言

| dept | Phase 2A 状態 | 最終 commit | main 反映 | 確認 |
|---|---|---|---|---|
| **yokohama** | **完了** | `10a5760` | ✅ `ec26c0e`（Tier 1 第1弾）| Step 4 完了時に Step 5 = 最終 lint 吸収済み |
| **osaka** | **完了** | `c0e507e` | ✅ `ec26c0e`（Tier 1 第1弾）| v1.0 本文書で最終確認、Tier 1 第1弾で本番反映済 |
| **fukuoka** | **完了** | `6464498` | ⏸ Tier 1 第2弾（Phase 2C パターン A）で予定 | v1.2 本文書で最終確認 |

3 dept とも:
- Step 1〜4 全完走
- 全テスト **81/81 PASS**（v1.2 累計、kyoto/tokyo + osaka 11 + yokohama 10 + fukuoka 10 + dispatcher 4）
- lint baseline 58 維持
- 型チェック PASS
- 設計判断 7 項目すべて整合
- osaka/yokohama は main 反映済、fukuoka は Phase 2C 第2弾で main マージ予定

## 7. Phase 2C 着手準備完了の確認

- [x] **3 ブランチが独立 push 済**: 横浜 `10a5760`, 大阪 `c0e507e`（+ Tier 1 第1弾マージ済）, 福岡 `6464498`
- [x] **整合性総括完了**: 本文書 v1.2
- [x] **Phase 2C スコープ明確化**: §4.1〜4.6 に列挙、第2弾は fukuoka 単独 PR
- [x] **回帰リスク評価**: kyoto/tokyo/osaka/yokohama 既存テストはすべて pass、Tier 1 第2弾で route.ts を 1 分岐追加するのみで影響範囲は限定的
- [x] **TS table override の競合なし**: 3 dept とも `overrides: Record<string, SectionOverride> = {}` で空、kyoto/tokyo の override セットと干渉なし
- [x] **dispatcher テストの拡張容易性**: 第1弾で `dispatcher.test.ts` 整備済、福岡分は 1 ケース追加で済む

### Phase 2C 第2弾（パターン A: 福岡単独 PR）の最小構成:

1. main から `feat/tier1-fukuoka-integration` を派生
2. `git merge feat/fukuoka-full-engine-v2 --no-ff`
3. `lib/engine-v2/adapters/generate-plan.ts` の `V2Pack` 型 + dispatcher 拡張（1 行追加 + 1 分岐追加）
4. `app/api/generate-plan/route.ts` の `packParam` 検証 5 値 → 6 値、auto-select 4-way → 5-way
5. `app/page.tsx` の FAQ + deptName 派生に福岡追加
6. `lib/engine-v2/tests/dispatcher.test.ts` に fukuoka-full ケース追加（4 → 5 cases）
7. PR 作成 → Vercel preview 5 都市疎通テスト → SHUN 本番 push → 本番疎通

ec26c0e（Tier 1 第1弾）と同じ流れ、本日中の本番反映を狙う。

## 付録 A: テスト集計（v1.2 全体）

```
Test Files  11 passed (11)
Tests       81 passed (81)
  - kyoto-full-smoke.test.ts        (Phase 1+ 既存)
  - tokyo-full-smoke.test.ts        (Phase 1+ 既存)
  - yokohama-full-smoke.test.ts     (Phase 2A、10 tests)
  - osaka-full-smoke.test.ts        (Phase 2A、11 tests)
  - fukuoka-full-smoke.test.ts      (Phase 2A、10 tests) ← v1.2 で追加
  - dispatcher.test.ts              (Tier 1 第1弾、4 tests)
  - generate-plan-adapter.test.ts   (既存)
  - render-pack.test.ts             (既存)
  - placeholder.test.ts             (既存)
  - indent-heuristic.test.ts        (既存)
  - template-pack.test.ts (types/)  (既存)
Duration  1.88 s
```

## 付録 B: 関連ドキュメント

- [docs/research/osaka-full-recon-v0.1.md](osaka-full-recon-v0.1.md) — 大阪 Phase 1 recon
- [docs/research/yokohama-full-recon-v0.1.md](yokohama-full-recon-v0.1.md) — 横浜 Phase 1 recon
- [docs/research/fukuoka-full-recon-v0.1.md](fukuoka-full-recon-v0.1.md) — 福岡 Phase 1 recon（v1.2 で追加）
- [docs/research/nagoya-full-recon-v0.1.md](nagoya-full-recon-v0.1.md) — 名古屋 Phase 1 recon（Phase 2A 着手保留中）
