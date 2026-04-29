# Phase 2A — Tier 1 Symmetry Report (osaka / yokohama)

Phase 2A の Tier 1 展開対象である **大阪市消防局 (osaka-city)** と
**横浜市消防局 (yokohama-city)** の v2 engine 実装が完了したことを記録し、
両ブランチで採用した設計判断の整合性、テスト結果、Phase 2B / 2C への
申し送り事項を一元化したリリースゲート文書。

## 1. 基本メタ情報

### 1.1 ブランチと最新 commit

| ブランチ | 最新 commit | Phase 2A 状態 |
|---|---|---|
| `feat/yokohama-full-engine-v2` | `10a5760` | **Phase 2A 完了**（Step 1〜4 完走、Step 5 = Step 4 内に吸収済） |
| `feat/osaka-full-engine-v2` | `c0e507e` | **Phase 2A 完了**（Step 1〜4 完走、Step 5 = 本文書を以て確定） |

### 1.2 commit 系譜（main 起点）

```
main (2ac5a87)
├── feat/yokohama-full-engine-v2
│   ├── 10d77e6  docs(yokohama): Phase 1 recon
│   ├── 02ea3b4  feat(engine-v2): yokohama-city.full.json — Step 1
│   ├── 76ca96f  feat(engine-v2): yokohama-full adapter — Step 2
│   ├── 6454d08  feat(engine-v2): yokohama builders + appendix wiring — Step 3
│   └── 10a5760  test(engine-v2): yokohama smoke (Y1–Y6 + 補助4) — Step 4
└── feat/osaka-full-engine-v2
    ├── ae8ffb8  docs(osaka): Phase 1 recon
    ├── 6e6a925  feat(engine-v2): osaka-city.full.json — Step 1
    ├── 6189903  feat(engine-v2): osaka-full adapter — Step 2
    ├── a57a61e  chore(tsconfig): exclude tmp/ from type-check scope
    ├── 30794fb  feat(engine-v2): osaka builders + appendix wiring — Step 3
    └── c0e507e  test(engine-v2): osaka smoke (O1–O4 + 補助7) — Step 4
```

### 1.3 作業期間と意思決定タイミング

- 作業期間: 2026-04-29（同日完走）
- SHUN 設計判断確定日: 2026-04-29（Step 1 完了時の 7 項目を承認）
- 整合性総括承認日: 2026-04-29（本文書）

## 2. 採用した 7 設計判断（最終一覧）

両ブランチとも **7 項目すべて同方式 (B 方式) を採用**しており完全整合。

### 2.1 比較表

| # | 項目 | 採用 (osaka) | 採用 (yokohama) | 既存実装との整合 | 判定区分 |
|:-:|---|---|---|---|---|
| 1 | `version` | `"2.0.0-osaka-full"` | `"2.0.0-yokohama-full"` | kyoto/tokyo と同 semver パターン | **強制** (zod schema) |
| 2 | `scale` | `"medium"` | `"medium"` | kyoto/tokyo も `"medium"` | **強制** (enum 制約) |
| 3 | `deptId` | `"osaka-city"` | `"yokohama-city"` | kyoto = `"kyoto-city"`, tokyo = `"tokyo-tfd"` | 慣例 |
| 4 | `license` フィールド | 省略 | 省略 | kyoto/tokyo にもなし、schema 未定義 | **強制** (schema strict) |
| 5 | placeholder 命名 | camelCase 8 keys（`buildingName`, `tsunamiEvac` 等）| camelCase 8 keys（`companyName`, `tsunamiEvac` 等）| kyoto/tokyo 全 camelCase | 強い慣例 |
| 6 | 章を v2 2 層に圧縮 | flat 化（v1 1-1 + 1-2 統合）| 節 heading 落とし | v2 schema 制約 (章→節 のみ) | **判断** (中) |
| 7 | 委託 gating | 単一 section + skip-list（番号 gap 許容）| 3 sections 一括 skip + 章タイトル残置 | tokyo 流 B 方式と一致、kyoto は A 方式 | **判断** (中) |

### 2.2 placeholder 共通化の効果

両 dept で **`tsunamiEvac` placeholder が完全一致命名**。kyoto/tokyo にはない placeholder のため、Phase 2C の `toRenderData` 拡張時に **snake `tsunami_evac` の単一マッピングで両 dept カバー可能**。

### 2.3 dept ごとの圧縮手段の差（項目 6）

両 dept とも v2 schema 制約により章→節の 2 層に圧縮しているが、手段は異なる:

- **osaka**: v1 chapter 1-1（目的及び適用範囲等）+ 1-2（管理権原者の業務）の 2 グループを **flat 化**（1〜8 連番 section）。outsource 非該当時は番号 4 が gap になる
- **yokohama**: v1 章→節→条 の 3 層構造の **節を heading として落とし**、章→条 の 2 層化。条は元々グローバル連番のため番号 gap なし。ch7 委託全章は 3 sections 一括 skip で章タイトルのみ残す

両者とも v2 engine の制約に沿った妥当な対応。Phase 2B で UX 改善（osaka 章分離 / yokohama `（該当なし）` placeholder）の余地あり。

### 2.4 委託 gating 方式の差（項目 7）

| dept | 方式 | 説明 |
|---|---|---|
| **osaka** | B (skip-list 単一) | `ch1-outsource` 1 section、outsource 非該当で skip。番号 4 が gap |
| **yokohama** | B (skip-list 複数) | `ch7-art56-outsource` / `ch7-art57-command` / `ch7-art58-report` の 3 sections を一括 skip。章 7 タイトル「第７章　防火管理業務の一部委託」のみ残置 |
| kyoto | A (ペア) | `ch1-outsource-applicable`〔該当〕 / `ch1-outsource-not-applicable`〔非該当〕 の 2 sections のいずれかを emit |
| tokyo | B (skip-list 単一) | osaka と同方式 |

両 dept の B 方式採用は v1 互換 + tokyo 整合の判断。Phase 2B で kyoto 流 A 方式への切替可能性あり（ペア追加で番号 gap 解消）。

## 3. テスト結果サマリ

### 3.1 全体スイート（リグレッション最終確認）

| 観点 | 数値 |
|---|---:|
| Test files | **8 passed (8)** |
| Tests | **57 passed (57)** |
| Duration | 679 ms（最終実行）|
| Type-check (`npx tsc --noEmit`) | **PASS**（exit 0、出力なし）|
| Lint (`npm run lint`) | **58 errors + 1 warning**（baseline 維持、Phase 2A の追加コードで +0）|

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

### 3.4 false positive 対応設計

osaka Step 3 で発見した「`地区隊の編成と任務` 文字列が body と appendix の両方に出る」問題に対し、**正規表現 `/別表９　（[^）]+）地区隊の編成と任務/` で全角スペース prefix 識別**を採用（Step 4 smoke test の `APPENDIX9_HEADING_RE`）。`<w:tbl>` カウントによる構造的検証と併用し、文字列レベルの誤判定を排除。

### 3.5 ブランド差異の検証

各 dept で以下を回帰テストとして組み込み済:

| 検証項目 | 横浜 | 大阪 |
|---|:-:|:-:|
| 章タイトル順序 | ✅ 第1〜第7 + 附則 | ✅ 第1〜第8 |
| cover subtitle | ✅ 「【一般用】」 | ✅ 「【中・小規模事業所・テナント用】」 |
| 帰宅困難者条文 | ✅ 第36条 / 第45条 unconditional emit | ✅ 非存在を確認（大阪に欠ける差分の保証） |
| 南海トラフ | ✅ 第5章2節（第43条） tsunami body emit | ✅ 第6章 + 5節 全節 emit |
| 防災管理 | 防火管理のみ（一体化なし） | 防火・防災一体（タイトル「防火・防災管理に係る消防計画」） |

## 4. Phase 2C への申し送り（route 統合 + UI + 本番疎通）

### 4.1 route.ts 拡張

現状 `lib/engine-v2/adapters/generate-plan.ts` の `V2Pack` 型は `"sample" | "full" | "tokyo-full"`。以下を追加:

```ts
export type V2Pack = "sample" | "full" | "tokyo-full" | "osaka-full" | "yokohama-full";
```

`runV2Adapter` の dispatcher に 2 分岐追加:

```ts
if (packName === "osaka-full") return buildOsakaFull(form);
if (packName === "yokohama-full") return buildYokohamaFull(form);
```

### 4.2 app/api/generate-plan/route.ts auto-select

現状 [app/api/generate-plan/route.ts](../../app/api/generate-plan/route.ts) の auto-select は東京都 → tokyo-full、それ以外 → full（kyoto）。以下に拡張:

```ts
pack = prefecture === "東京都" ? "tokyo-full"
     : prefecture === "大阪府" ? "osaka-full"
     : prefecture === "神奈川県" ? "yokohama-full"   // 短期は県全域 → 横浜にマップ、中期で市選択 UI 追加
     : "full";
```

`packParam` の値判定にも `"osaka-full"` / `"yokohama-full"` を追加。

### 4.3 UI prefecture 選択肢

フォーム側で prefecture 選択肢に「大阪府」「神奈川県」を追加（既存があれば確認のみ）。横浜は神奈川県全域→ yokohama マッピングのため、川崎・相模原など他市の対応は中期課題。

### 4.4 toRenderData 拡張

`tsunamiEvac` placeholder（osaka/yokohama 共通）を `lib/engine-v2/adapters/to-render-data.ts` に追加:

```ts
tsunamiEvac: str(form.tsunami_evac),
```

両 dept adapter の `extendForOsaka` / `extendForYokohama` で個別に設定済のため、toRenderData 側に追加すれば extend 側から外せる（将来的なリファクタ）。Phase 2C スコープでは optional。

### 4.5 本番疎通テスト観点

- prefecture=大阪府 → osaka-full pack で docx 生成、所轄消防署提出形式の目視確認
- prefecture=神奈川県 → yokohama-full pack で docx 生成、目視確認
- prefecture=その他 → full（kyoto fallback）で動作継続を確認（リグレッション）
- prefecture=東京都 → tokyo-full（既存）で動作継続を確認
- light プラン × 各 dept で別表 skip 動作

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

osaka 別表2 / 別表3 の値は extend で既に RenderData に流入済（`casualtyEstimate`, `propertyDamageEstimate`, `buildingAddress` 等 14 fields）。Phase 2B の builders 実装は **adapter 編集なしで data.xxx 参照のみ**で完結する設計。

### 5.2 ブランドカラー確定

| dept | 現状 (Phase 2A interim) | Phase 2B での確定対象 |
|---|---|---|
| osaka | osakaTheme = 濃緑 `#1F6E5B` / 淡緑 `#F0F7F4` | 大阪市公式ブランドカラー（緑系？）の確認後に確定 |
| yokohama | kyotoTheme borrow (navy `#2B4C7E` / `#F5F7FA`) | 横浜市ブランドカラー（青系）に置換、独立 yokohamaTheme 定義 |

両者とも `lib/engine-v2/builders/<dept>/appendices.ts` 内に local 定義のため、shared/table-helpers.ts に集約するリファクタも併せて検討。

### 5.3 設計の再評価候補

| dept | 項目 | 内容 | 影響範囲 |
|---|---|---|---|
| yokohama | ch7 全章 gating 時の章タイトル emit | outsourced=false 時に「第７章　防火管理業務の一部委託」のみ残る冗長性。`（該当なし）　防火管理業務の一部委託は行わない。` placeholder section の追加で UX 改善 | yokohama-city.full.json + adapter |
| yokohama | ch1-art3-unified-clause / ch1-art4-unified-clause の節分離 | 統括 inline 節を独立 section にしている現状が読みやすさを損なう。テキスト合成（条本体 + 第5項を文字列結合）方式への切替検討 | yokohama-city.full.json + adapter |
| osaka | ch1 flat 化の章分離 C 案 | v1 1-1 と 1-2 をそれぞれ独立章 (ch1, ch2) に分離して章数 8→9 に。所轄消防署提出時の慣例次第 | osaka-city.full.json 構造再設計 |
| osaka | 委託 ペア方式 (kyoto 流 A 案) | `〔該当〕`/`〔非該当〕` ペアで番号 gap 解消。所轄消防署提出時の慣例次第 | osaka-city.full.json + adapter（5 行程度の修正） |

これら 4 項目は Phase 2A 完了承認時に「Phase 2B で必要に応じて別 PR」と SHUN 確定済（参考: 直前メッセージ）。

### 5.4 toRenderData リファクタ機会

両 dept で個別に `extendFor{Dept}` を持っているが、`tsunamiEvac` のような共通 placeholder は toRenderData 本体に上げる方が cleaner。Phase 2B 中盤での整理候補。

### 5.5 大阪別表9 と shared buildFireBrigade の溝

osaka 別表9 は v1 仕様の班 naming（通報連絡班 等）と任務テキストが kyoto 流 `COMMON_BRIGADE_ROWS` と異なるため、shared `buildFireBrigade` を再利用せず custom 実装した。Phase 2B で他 dept（横浜・名古屋）の自衛消防隊表を実装する際、shared 側に **班 rows を opt 経由で完全置換可能にする extension** を追加すれば osaka custom も shared に巻き取れる。

## 6. Phase 2A 完了の正式宣言

| dept | Phase 2A 状態 | 最終 commit | 確認 |
|---|---|---|---|
| **yokohama** | **完了** | `10a5760` | Step 4 完了時に Step 5 = 最終 lint 吸収済み、main 未マージ |
| **osaka** | **完了** | `c0e507e`（本文書を含めて更新予定）| Step 5 軽量版（本文書）で最終確認 |

両 dept とも:
- Step 1〜4 全完走
- 全テスト 57/57 PASS（既存 kyoto/tokyo 含む全リグレッション含めてグリーン）
- lint baseline 58 維持
- 型チェック PASS
- 設計判断 7 項目すべて整合
- main マージは Phase 2C 統合タスクで実施

## 7. Phase 2C 着手準備完了の確認

- [x] **両ブランチが独立 push 済**: 横浜 `10a5760`, 大阪 `c0e507e`（+ 本文書 commit）
- [x] **整合性総括完了**: 本文書
- [x] **Phase 2C スコープ明確化**: 4.1〜4.5 に列挙
- [x] **回帰リスク評価**: kyoto/tokyo 既存テストはすべて pass、Phase 2C で route.ts を拡張する際の影響範囲は限定的
- [x] **TS table override の競合なし**: 両 dept とも `overrides: Record<string, SectionOverride> = {}` で空、kyoto/tokyo の override セットと干渉なし

Phase 2C 統合タスクの最小構成:

1. main から `feat/phase-2c-tier1-integration` を派生（or osaka/yokohama を順次 main にマージ後に統合ブランチ）
2. `lib/engine-v2/adapters/generate-plan.ts` の `V2Pack` 型 + dispatcher 拡張
3. `app/api/generate-plan/route.ts` の auto-select 拡張
4. UI prefecture 選択肢追加
5. CHANGELOG / docs を 4 都市まとめて 1 エントリで更新
6. 本番疎通テスト

## 付録 A: テスト集計（全体）

```
Test Files  8 passed (8)
Tests       57 passed (57)
  - kyoto-full-smoke.test.ts        (Phase 1+ 既存)
  - tokyo-full-smoke.test.ts        (Phase 1+ 既存)
  - yokohama-full-smoke.test.ts     (Phase 2A、10 tests)
  - osaka-full-smoke.test.ts        (Phase 2A、11 tests)
  - generate-plan-adapter.test.ts   (既存)
  - render-pack.test.ts             (既存)
  - placeholder.test.ts             (既存)
  - indent-heuristic.test.ts        (既存)
Duration  679 ms
```

## 付録 B: 関連ドキュメント

- [docs/research/osaka-full-recon-v0.1.md](osaka-full-recon-v0.1.md) — 大阪 Phase 1 recon
- [docs/research/yokohama-full-recon-v0.1.md](yokohama-full-recon-v0.1.md) — 横浜 Phase 1 recon
- [docs/research/nagoya-full-recon-v0.1.md](nagoya-full-recon-v0.1.md) — 名古屋 Phase 1 recon（Phase 2A 着手保留中）
