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

- **状況**: Step 4b / Step 5 では常に全別表出力。v1 は `has_outsourced_management` で別表1(+東京の別表2)を gate し、`include_appendix` (plan=light) で全別表を gate する。
- **必要な入力**: SHUN の消防実務レビュー（gating ルールの正確な仕様確認、plan 別の出力制御設計）
- **影響範囲**: adapter の appendix dispatcher に filter 追加。JSON / builder の変更は不要（gating は adapter-level）。
- **備考**: Step 4d として独立設計予定。

---

最終更新: 2026-04-12 (Step 5 Task 7)
