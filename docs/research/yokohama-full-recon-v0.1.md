# Yokohama Full Engine v2 — Phase 1 Recon

## 1. ブランチ・前提
- ブランチ: `feat/yokohama-full-engine-v2`（main @ `2ac5a87` から派生）
- 作業日時: 2026-04-29
- ターゲット: 横浜市消防局「一般用作成例」消防計画（小規模用は副次ターゲット）
- 前提:
  - Tier 1 展開の 2 番手として横浜市消防局を v2 構造で実装
  - 京都／東京と類似の中規模単一構造のため、実装難度は低い見込み
  - v1 の `generate_yokohama_full.js` は **存在しない**（完全新規・JS／JSON 雛形なし）
  - 横浜は南海トラフ地震防災対策推進地域内（神奈川県指定）→ 京都の「免除」と逆方向

## 2. 入手した一次資料

DL 元: [横浜市消防局 各種届出様式DLページ](https://www.city.yokohama.lg.jp/bousai-kyukyu-bohan/shobo/download.html)

| ファイル | サイズ | 形式 | 備考 |
|---|---:|---|---|
| [yokohama-ippan.docx](../../tmp/yokohama-recon/yokohama-ippan.docx) | 116.1 KB | docx | **一般用作成例**（主要ターゲット）|
| [yokohama-shokibo.docx](../../tmp/yokohama-recon/yokohama-shokibo.docx) | 60.4 KB | docx | 小規模用作成例（副次） |
| [yokohama-bessatsu.doc](../../tmp/yokohama-recon/yokohama-bessatsu.doc) | 35.3 KB | doc (2014年版) | 消防計画別冊：南海トラフ地震防災対策計画・防災規程作成例 |
| [yokohama-zentai.docx](../../tmp/yokohama-recon/yokohama-zentai.docx) | 89.9 KB | docx | 全体についての消防計画作成例（参考） |

textutil で plain text 抽出済（[tmp/yokohama-recon/](../../tmp/yokohama-recon/)）。

## 3. 一般用ひな形の構造

### 章数: 7（+ 附則 = 実質 8）

| No | タイトル | 節数 | 主要条文 |
|---:|---|---:|---|
| 1 | 総則 | 3 | 目的等 / 管理権原者と防火管理者の権限と業務 / 消防機関への連絡等 |
| 2 | 火災予防対策 | 5 | 自主点検 / 不備欠陥報告 / 火災予防措置 / 工事中の防火管理 / 放火防止 |
| 3 | 自衛消防活動対策 | 1 | 自衛消防隊の編成・任務 |
| 4 | 夜間、休日の防火管理体制 | 1 | — |
| 5 | **震災対策** | 3 | 第1節 震災予防措置 / **第2節 南海トラフ地震等大規模地震発生時の活動** / 第3節 地震後の復旧活動等 |
| 6 | 防災教育及び自衛消防訓練 | 2 | 防災教育等 / 自衛消防訓練 |
| 7 | 防火管理業務の一部委託 | 1 | — |
| — | 附則 | 1 | — |

### 別表数: 4 / 別図数: 2

| 種別 | No | タイトル |
|---|---:|---|
| 別表 | 1 | 自主点検チェックリスト |
| 別表 | 2 | 自衛消防隊の組織及び任務分担 |
| 別表 | 3 | 防災センター従事者一覧表 |
| 別表 | 4 | 防火管理業務の委託状況表 |
| 別図 | 1 | 各階平面図 |
| 別図 | 2 | 避難経路図 |

### プレースホルダ・フィールド候補（公式テキストから推定）

事業所名（`building_name` / `company_name`）、所在地、各階平面図参照、管理権原者氏名、防火管理者氏名、自衛消防隊長、各班員（通報連絡班・初期消火班・避難誘導班・応急救護班）、火気使用設備一覧、点検実施月、訓練実施月、避難場所（第39条 周辺大火災用 + 第43条 津波用）、防災センター従事者一覧、委託先、委託業務範囲。

統括防火管理者は「該当時のみ記載」（高層建築物・地下街・複合ビル等）→ 別フラグ `requires_unified_fpm` 推奨。

## 4. 小規模用ひな形の構造（差分のみ）

**条文フラット構造**（章立てなし）。第1条〜第18条 + 附則。

| 条 | タイトル | 備考 |
|---:|---|---|
| 1 | 目的 | — |
| 2 | 適用範囲 | — |
| 3-4 | 管理権原者 / 防火管理者 | — |
| 5 | 消防機関への届出等 | — |
| 6 | 防火管理資料の保管等 | — |
| 7-9 | 自主点検 / 法定点検 / 報告・改修 | — |
| 10 | 従業員等の守るべき事項 | — |
| 11 | 工事中の防火管理 | — |
| 12 | 放火防止対策 | — |
| 13 | 自衛消防の編成及び任務等 | — |
| 14 | 地震対策 | **南海トラフ独立条なし**（地震対策に簡潔統合） |
| 15-16 | 防災教育 / 自衛消防訓練 | — |
| 17 | 防火管理業務の一部委託 | — |
| 18 | その他 | — |

別表 1, 2, 3（**4は無し**：委託は別表3）/ 別図 1, 2。
**帰宅困難者条文なし。南海トラフ独立条なし。** 一般用に比べ大幅に簡素化。

## 5. 特記事項

| 項目 | Yokohama 一般用 | Yokohama 小規模用 | 備考 |
|---|---|---|---|
| 南海トラフ対応 | **第5章第2節として常時記載**（第41〜46条） | 第14条「地震対策」に簡潔統合 | gating **不要**（推進地域該当） |
| 帰宅困難者 | **記載あり**（第36条 待機場所確保 / 第45条 帰宅困難者対応） | なし | 横浜独自（東京都条例とは別根拠と推察） |
| テロ対策 | なし | なし | — |
| 防災管理 | **言及なし**（防火管理のみ） | 同左 | 大阪は「防火・防災管理」一体、横浜は防火管理のみ |
| 統括防火管理者 | 該当時のみ（高層・地下街・複合ビル等） | 同左 | gating: `requires_unified_fpm` |
| 委託 | 第7章まるごと + 別表4 | 第17条 + 別表3 | gating: `has_outsourced_management` |
| 緊急地震速報 | 第41条で言及 | 言及なし | 一般用独自 |
| 別冊（南海トラフ防災規程） | 別ファイル `yokohama-bessatsu.doc` | 同左 | 推進地域内の追加文書、章節番号「第○条」テンプレ形式 → 個別事業者が割当 |
| タイトル形式 | 「○○株式会社消防計画（例）」 | 「○○事務所消防計画（例）」 | プレースホルダ命名要検討 |

## 6. 京都・東京 v2 テンプレとの差分

### 章構成比較

| 観点 | Kyoto v2 | Tokyo v2 | **Yokohama 一般** | Yokohama 小規模 | 参考: Osaka v1 |
|---|---|---|---|---|---|
| 章数 | 11 | 13 | **7 + 附則** | 0（条文 18） | 8 |
| 章番号方式 | `第１　…` | `第１　…` | `第１章　…` | 章なし `第１条　…` | 数値 (v1) → `第１　…`(v2) |
| 別表 (JSON 内) | 0（builders で programmatic） | 0（同左） | **4（builders で programmatic 推奨）** | 3 | 6 (v1 JSON) |
| 別図 | なし | なし | **2** | 2 | あり (v1で省略) |
| 南海トラフ | なし | なし | **第5章第2節（常時）** | 第14条 簡潔統合 | 第6章まるごと |
| 帰宅困難者 | なし | 追加章 | **第36条+第45条**（震災対策章内 / 一般用のみ） | なし | なし |
| 防災管理一体 | あり | あり | **なし**（防火のみ） | 同左 | あり |
| 統括防火管理者 gating | — | あり | **あり** | あり | — |

### 共通要素（推定 65〜75%）
総則（目的・適用・管理権原者・防火管理者）、火災予防自主点検、消防用設備等の点検、放火防止、自衛消防組織編成、夜間・休日体制、震災対策（震度想定）、防災教育・訓練、附則、別表（自主点検チェックリスト、自衛消防組織、委託状況）。

### Yokohama 独自要素
- 防災センター従事者一覧表（別表3）— 大規模建物前提
- 帰宅困難者対応条文（一般用のみ）
- 緊急地震速報の活用（第41条）
- 別冊：南海トラフ地震防災規程（推進地域内事業者向けの追加文書）

### Yokohama に欠ける要素
- 防火・防災管理の一体記述（kyoto/tokyo/osaka はすべて一体、yokohama は防火管理のみ）
- 厳守事項章（kyoto 第5章相当）
- 訓練の独立章（yokohama では「防災教育及び自衛消防訓練」として 1 章に統合）

## 7. 設計提案

### 7.1 ファイル構成案（kyoto/tokyo 踏襲）

```
lib/engine-v2/
├── templates/
│   └── yokohama-city.full.json       # 7章構成、節/items のテキスト + placeholder
├── adapters/
│   └── yokohama-full.ts              # kyoto-full.ts / tokyo-full.ts 模倣
├── builders/
│   └── yokohama/
│       ├── logic.ts                  # 章配列の dispatcher（gating 含む）
│       ├── appendices.ts             # 別表 1, 2, 3, 4 + 別図1, 2 emitter
│       └── tables/
│           ├── ch3-jieishobo.ts      # 別表2 自衛消防隊組織
│           ├── ch5-quake.ts          # 第5章 関連テーブル（必要なら）
│           └── ch7-itaku.ts          # 別表4 委託状況表
└── tests/
    └── yokohama-full-smoke.test.ts   # kyoto/tokyo 模倣
```

### 7.2 template pack JSON 構成案

`lib/engine-v2/templates/yokohama-city.full.json`:

```jsonc
{
  "version": "2026.04",
  "deptId": "yokohama",
  "deptName": "横浜市消防局",
  "scale": "general",  // 一般用。小規模用は将来 yokohama-city.small.json 別建て案
  "chapters": [
    { "no": "第１章", "title": "総則", "sections": [...] },
    { "no": "第２章", "title": "火災予防対策", "sections": [...] },
    { "no": "第３章", "title": "自衛消防活動対策", "sections": [...] },
    { "no": "第４章", "title": "夜間、休日の防火管理体制", "sections": [...] },
    {
      "no": "第５章",
      "title": "震災対策",
      "sections": [
        { "no": "第１節", "heading": "震災予防措置", ... },
        { "no": "第２節", "heading": "南海トラフ地震等大規模地震発生時の活動", ... },
        { "no": "第３節", "heading": "地震後の復旧活動等", ... }
      ]
    },
    { "no": "第６章", "title": "防災教育及び自衛消防訓練", "sections": [...] },
    { "no": "第７章", "title": "防火管理業務の一部委託", "sections": [...] },
    { "no": "附則", "title": "附則", "sections": [...] }
  ],
  "appendices": []  // 別表は builders/yokohama/tables/*.ts で programmatic emit
}
```

### 7.3 南海トラフの扱い（横浜版） ← 重要

**京都の `tsunami_exempt: true` パターンを反転して常時組み込み**：

| 都市 | 推進地域該当 | 実装 |
|---|---|---|
| 京都 | 不該当 | `tsunami_exempt: true` → 第8章内の津波関連 SectionOverride で除外 |
| **横浜** | **該当** | **常時組み込み**（第5章第2節として無条件 emit）。フラグ不要、または `tsunami_required: true` を明示 |
| 大阪 | 該当 | 第6章まるごと常時組み込み（v1 JSON も gating なし） |

横浜版の推奨：
1. **template pack JSON に第5章第2節を最初から含める**（推進地域内なので gating 不要）
2. SectionOverride は使わず、章定義で完結させる（kyoto の override パターンとは別アプローチ）
3. 万一、将来「推進地域非該当の事業者向けに省略」要件が出た場合の保険として `tsunami_exempt` フラグだけ実装側に予約しておく（初期値 `false`、`true` で第5章第2節をスキップ）
4. 別冊（南海トラフ地震防災規程）は **本 Phase スコープ外** とし、Phase 2C 以降の追加機能候補（推進地域内事業者向けオプション）

### 7.4 route.ts 拡張

```ts
// app/api/generate-plan/route.ts
const VALID_PACKS = ["full", "tokyo-full", "yokohama-full", "sample"] as const;
// auto-select:
pack = prefecture === "東京都" ? "tokyo-full"
     : prefecture === "神奈川県" ? "yokohama-full"  // 県全体を横浜にマップ
     : "full";
```

注意：神奈川県 ≠ 横浜市。**県全体を yokohama にマップするのは粗い**。短期は許容、中期では川崎・相模原など他市の対応 or 「市選択」UI 追加が必要。

### 7.5 gating 必要箇所

- 第7章 + 別表4: `has_outsourced_management`
- 統括防火管理者関連条文（第3条第5項、第13条の2、第18条 等）: `requires_unified_fpm`（高層・地下街・複合ビル）
- 第5章第2節（南海トラフ）: **gating 不要**（横浜は推進地域該当）
- 別表3（防災センター従事者一覧表）: `has_disaster_center` 推奨（防災センター設置事業者のみ）
- `include_appendix`: 既存 v2 と同様

### 7.6 リスク・難所

1. **小規模用との二重テンプレ問題** — 一般用と小規模用は構造が大きく異なる（章 vs 条文）。両対応するなら `yokohama-city.full.json`（一般用）と `yokohama-city.small.json`（小規模用）を別建て、route で `building_total_area_m2` 等から自動振り分け、というアーキテクチャが必要。Phase 2 では一般用のみに絞り込み、小規模は将来検討が現実的。
2. **神奈川県 → 横浜市マッピングの粗さ** — `prefecture === "神奈川県"` で yokohama に流すと、川崎市や相模原市の事業者にも横浜版が生成される。短期は許容、中期で市選択 UI 追加。
3. **別冊（南海トラフ防災規程）の扱い** — 推進地域内事業者は本則とは別に「別冊」を保持する義務あり（消防計画の付帯文書）。Phase 2 スコープ外で OK だが、ユーザ問い合わせ対応のため UI 上で別冊存在の通知が望ましい。
4. **防災管理一体化の差** — kyoto/tokyo/osaka は防火・防災管理一体、yokohama は防火管理のみ。生成 docx のタイトル・条文・プレースホルダ名で「防災」を混ぜないよう注意。
5. **帰宅困難者条文の挿入位置** — 一般用では第5章第2節（南海トラフ）の中にぶら下がっており、章構造上は震災対策の一部。tokyo の「（追加）帰宅困難者対策」のような独立章扱いではないので、kyoto/tokyo に揃えず yokohama 公式の構造に忠実に従うのが安全。
6. **公式ひな形の更新タイミング不明** — `0193_20211111.docx` のファイル名から 2021-11-11 版。最新版確認のため横浜市公式 RSS／更新通知の有無を SHUN に確認。

### 7.7 Phase 2 ステップ提案

| ステップ | スコープ | 動作確認 |
|---|---|---|
| **2A 最小** | template pack JSON + adapter + smoke、別表は別表2（自衛消防隊）のみ | 第1〜7章本文 + 附則の placeholder fill、`include_appendix=false` で動く |
| **2B builders** | builders/yokohama/tables/*.ts 実装、別表1, 2, 3, 4 + 別図1, 2 完備 | `include_appendix=true` で全別表出力 |
| **2C 仕上げ** | route.ts 分岐拡張、UI prefecture 選択肢追加、`requires_unified_fpm` / `has_disaster_center` フラグ | 本番疎通、神奈川県 → yokohama 自動選択 |

**推奨**: 2A 着地で動作保証 → 2B でテーブル拡充 → 2C で接続。osaka と同様、1 PR にまとめず段階レビュー。osaka が先行リファレンスとなるため、osaka が 2A 完了したタイミングで yokohama 2A も着手し、相互参照しつつ進めるのが効率的。

## 8. 次タスク（Phase 2 着手指示前提）

1. SHUN 確認: 一般用のみで開始でよいか（小規模用は将来）
2. SHUN 確認: 神奈川県全域 → yokohama マッピングの妥当性
3. SHUN 確認: 別表3（防災センター従事者）の gating 要否
4. SHUN 確認: 別冊（南海トラフ防災規程）の Phase 2 対応要否
5. Phase 2A から実装着手（template pack JSON 作成、osaka と並行可）

## 付録：参考ファイルの所在

- 公式ひな形: [tmp/yokohama-recon/](../../tmp/yokohama-recon/)（gitignore 対象、recon 用一時保管）
- 抽出テキスト: [tmp/yokohama-recon/yokohama-ippan.txt](../../tmp/yokohama-recon/yokohama-ippan.txt) ほか
- DL 元: <https://www.city.yokohama.lg.jp/bousai-kyukyu-bohan/shobo/download.html>
