# Future Tasks (Step 7 候補)

Step 5 完了時点で v1 に未実装のため移植できなかった項目。
いずれも実装には東京消防庁の公式ひな形 or SHUN の消防実務レビューが必要。

## 防災センター要件

- **状況**: `lib/generate_tokyo_full.js` に該当コードなし。`lib/templates/tokyo_tfd_template_db.json` に言及あるが builder 未実装。
- **必要な入力**: 東京消防庁 HP からひな形取得、防災センター要員の配置基準確認
- **影響範囲**: 第7章（自衛消防隊等）に防災センター要員のシフト計画を追加。別表追加の可能性あり。

## 自衛消防隊 B 区分

- **状況**: v1 は「Ａ　事業所自衛消防隊を編成する場合」のみハードコード。B 区分（建物全体の自衛消防組織）のコードは存在しない。
- **必要な入力**: SHUN の消防実務レビュー（B 区分の発動条件、A との切替ロジック、追加別表の要否）
- **影響範囲**: 第7章の A/B 分岐追加。adapter-level gating で対応可能と予想されるが、段落構造が大幅に異なる場合は conditional node の検討が必要。

## 別表 gating（京都・東京共通）

- **フェーズ1 完了** (Step 4d, 2026-04-12): `has_outsourced_management` による
  委託関連別表の gating を実装。京都 別表1、東京 別表1+2 が outsourced=false 時に
  スキップされる。v1 挙動と同等。
- **フェーズ2 残**: `include_appendix` (plan=light) による全別表 gating、
  延床面積・用途・設備有無に基づく新規 gating 条件の設計。
  SHUN の消防実務レビューが必要。

## ~~v2 Tokyo 別表過剰出力~~ (Closed)

Step 4d Phase 1 で解消。commit `6ddc531` にて京都/東京の appendix dispatcher に
outsourced gating を追加。本番疎通で table count の増減を XML レベルで確認済み。

---

最終更新: 2026-04-12 (Step 4d Phase 1)
