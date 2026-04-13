# v1 Retirement 事前調査レポート

調査日: 2026-04-13
前提: Step 6b 完了 (commit 7f7adc9), v2 が visual parity 達成済み

---

## A. v1 ファイルと依存関係の棚卸し

### A1. 削除候補ファイル (8 本)

| ファイル | サイズ | 役割 | 削除可? |
|---|---|---|---|
| `lib/generate_kyoto_full.js` | 34KB | v1 京都 generator | ✅ v2 で完全置換済み |
| `lib/generate_tokyo_full.js` | 34KB | v1 東京 generator | ✅ v2 で完全置換済み |
| `lib/sample_data_kyoto.js` | 2KB | サンプル PDF 生成用データ | ✅ `scripts/build_sample.js` 専用 |
| `lib/templates/kyoto_city_template_db.json` | 31KB | v1 テンプレート DB (dead data) | ✅ どこからも import されていない |
| `lib/templates/tokyo_tfd_template_db.json` | 11KB | v1 テンプレート DB (dead data) | ✅ どこからも import されていない |
| `kyoto_shobo_keikaku_full.docx` | 21KB | v1 出力サンプル (root) | ✅ 開発用出力、顧客無関係 |
| `tokyo_shobo_keikaku_full.docx` | 24KB | v1 出力サンプル (root) | ✅ 同上 |
| `lib/generate_kyoto_full.js.bak` | (存在確認要) | バックアップ | ✅ 存在すれば削除 |

合計 ~157KB のコード削減。

### A2. 実コード依存 (import/require) — **3 ファイルのみ**

| ファイル | 依存行 | 種別 |
|---|---|---|
| `app/api/generate-plan/route.ts` | L104, L107, L111 (3x require) | **本番コード** — v1 分岐全体 |
| `scripts/build_sample.js` | L3 (require kyoto + sample_data) | **開発スクリプト** — v2 版に書き換えるか削除 |
| `lib/engine-v2/tests/v1-regression.test.ts` | L5-6 (import kyoto + tokyo) | **テスト** — v1 削除と同時に削除 |

v2 builders 内のコメント参照 (約 20 箇所) は docstring のみ — ファイル削除に影響なし。

### A3. `lib/templates/` ディレクトリ統合

| パス | 内容 | 判定 |
|---|---|---|
| `lib/templates/kyoto_city_template_db.json` | dead data (zero imports) | **削除** |
| `lib/templates/tokyo_tfd_template_db.json` | dead data (zero imports) | **削除** |
| `lib/engine-v2/templates/kyoto-city.full.json` | v2 pack (active) | 残す |
| `lib/engine-v2/templates/tokyo-tfd.full.json` | v2 pack (active) | 残す |
| `lib/engine-v2/packs/kyoto-city.sample.json` | v2 sample (Step 1) | 判断保留(下記 B4) |

**推奨**: `lib/templates/` ディレクトリを丸ごと削除。v2 packs は `lib/engine-v2/templates/` に既存のまま。ディレクトリ統合(packs/ → templates/ 等)は別スプリント。

---

## B. API route の仕様変更設計

### B1. 現行 route 動作マトリクス

| engine | pack | 動作 | 呼び出し元 |
|---|---|---|---|
| (なし) | (無視) | **v1**: city/prefecture で kyoto/tokyo 自動選択 | `/api/download`, `/api/webhook/stripe`, 旧テスト |
| `v2` | (なし) | v2 sample (ch1 のみ) | 開発確認 |
| `v2` | `full` | v2 kyoto full | 本番疎通 curl |
| `v2` | `tokyo-full` | v2 tokyo full | 本番疎通 curl |

### B2. **★重大発見★**: 本番 DL パスは v1 経由

```
顧客 → Stripe 決済 → /success → /api/download
  → fetch("/api/generate-plan", { body: formData })  ← engine 指定なし → v1 path!

Stripe Webhook → /api/webhook/stripe
  → fetch("/api/generate-plan", { body: order.form_data })  ← 同上
```

**本番で顧客に届く Word ファイルは現在 v1 で生成されている**。v2 は curl テスト経由でのみ到達。

### B3. v1 retirement 後の route 設計案

| 案 | 概要 | フロント影響 | テスト影響 | 後方互換 | 複雑度 |
|---|---|---|---|---|---|
| **案 A: デフォルト v2 化** | engine param なし → v2。city/prefecture からパック自動選択 | ゼロ(URL 不変) | v1-regression 削除 | ✅ 完全(既存 URL そのまま) | 低 |
| 案 B: パラメータ全廃止 | engine/pack 廃止、city/prefecture で自動 | ゼロ | 上に同じ | ✅ | 最低 |
| 案 C: full 固定 | パラメータ廃止 + city/prefecture 自動 + pack 概念廃止 | ゼロ | 上に同じ | ✅ | 最低 |

**推奨: 案 A**。理由:
- download/webhook の URL 変更不要(最大のリスク削減)
- `?pack=` は手動テスト/QA で有用(残しておく)
- `?engine=v2` は廃止(v2 がデフォルト)

### B4. sample パックの扱い

- **顧客露出: ゼロ**。frontend / download / webhook / checkout のいずれも `?pack=sample` を参照していない
- **用途**: Step 3 での v2 最初のワイヤリングテスト。既に full pack が動くため不要
- **推奨**: **残す**(テスト `generate-plan-adapter.test.ts` が依存。削除するとテスト 1 件減る。害はないので放置が最小コスト)

### B5. ★要判断★ `plan=light` の別表 gating

**v1 の挙動**: `include_appendix: plan !== "light"` → light プランは別表なし
**v2 の現状**: `include_appendix` 未実装 → 全プランで別表あり

v1 を retire すると、**light プラン(¥4,980)の顧客が別表付き Word を受け取る**(v1 では別表なし)。

| 対応 | 工数 | リスク |
|---|---|---|
| **(X) 先に v2 に plan gating 実装** | adapter に ~5 行追加 × 2 | 低。route から `plan` を渡すだけ |
| (Y) light にも別表出す(値上げ的) | 0 | ビジネス判断が必要 |
| (Z) light プラン廃止 | UI/Stripe 変更 | scope 大 |

**推奨: (X)** — 5 行追加で v1 と同等の挙動を再現してから retire。

---

## C. テスト影響

### C1. 削除候補テスト

| テスト | 件数 | 判定 |
|---|---|---|
| `v1-regression.test.ts` | 4 | **削除**(v1 消滅で存在意義なし) |
| `generate-plan-adapter.test.ts` | 1 | **残す**(sample path テスト、v1 無関係) |

### C2. 既存テストへの影響

| テスト | route 変更の影響 | 判定 |
|---|---|---|
| kyoto-full-smoke (14件) | なし(adapter 直呼び) | ✅ green |
| tokyo-full-smoke (14件) | なし(adapter 直呼び) | ✅ green |
| indent-heuristic (5件) | なし(pure function) | ✅ green |
| template-pack / placeholder / render-pack (8件) | なし | ✅ green |
| generate-plan-adapter (1件) | なし(sample path) | ✅ green |

**v1-regression 4 件を削除後**: 46 - 4 = **42 件** green。

---

## D. Stripe / 決済フロー影響

### D1. Stripe metadata

```
metadata = {
  order_id, plan, building_name, prefecture, city, ward, ...
  // engine/pack フィールドは存在しない
}
```

**engine/pack は Stripe に保存されていない** → 過去の決済セッションへの影響ゼロ。

### D2. 既存の未完了決済

`/api/download` は Stripe session.metadata から formData を再構築して `/api/generate-plan` を呼ぶ。engine/pack は URL に含まれないため:
- v1 retire 前: v1 path で生成
- v1 retire 後: v2 path で生成(route デフォルト変更により)

**migration gap**: 決済途中の顧客が success 画面で DL → v2 で生成される。v2 は v1 と視覚同等なので実害なし。

**ただし**: `plan` フィールドが Stripe metadata に含まれている。download route は `formData.plan = meta.plan` を持っている(L25: `plan: meta.plan`)。この `plan` を v2 adapter に渡して `include_appendix` gating を実装すれば、light プランの挙動も v1 と同等になる。

---

## 推奨実装方針

### 前提作業: plan gating 実装(B5 の案 X)

v1 retire の前提条件として、v2 adapter に `plan` → `include_appendix` の 5 行 shim を追加:

```ts
// adapters/kyoto-full.ts + tokyo-full.ts
const plan = (form?.plan as string) || "standard";
const includeAppendix = plan !== "light";
// ...
if (includeAppendix) {
  allChildren.push(...appendixListChildren, ...appendixChildren);
}
```

### Task 分割案

| Task | 内容 | コミット数 |
|---|---|---|
| Task 1 | v2 adapter に plan-based appendix gating 追加 | 1 |
| Task 2 | route.ts の v1 分岐を v2 デフォルトに置換(city/prefecture → pack 自動選択) | 1 |
| Task 3 | v1 ファイル群 8 本 + v1-regression テストを削除 | 1 |
| Task 4 | scripts/build_sample.js を v2 ベースに書き換え(or 削除) | 1 |
| Task 5 | 本番疎通(download path + webhook path の動作確認) | 1 |
| **合計** | | **5** |

### コミット数予測: **5**

### 停止基準の判定

| 基準 | 結果 |
|---|---|
| v1 import 箇所が 5 箇所以上 | **非該当**(3 ファイルのみ) |
| lib/templates/ に重要ファイル | **非該当**(dead data のみ) |
| Stripe metadata に engine/pack | **非該当**(含まれない) |
| sample パックに顧客露出 | **非該当**(ゼロ) |
| Task 総数 > 8 | **非該当**(5 tasks) |

---

## 想定リスク

| リスク | 確率 | 対策 |
|---|---|---|
| plan=light の別表 gating 漏れ | 中 | Task 1 で先に実装、テスト追加 |
| download route の plan フィールド不足 | 低 | 既に `meta.plan` が渡されている(L25 確認済み) |
| 未テストの city/prefecture パターン(大阪等) | 中 | fallback は京都(v1 と同じ)。v2 route でも同じ fallback を維持 |
| Vercel deploy 直後に download 叩かれるタイミング | 低 | v2 は v1 と視覚同等なので、遷移タイミングの影響は外見上ゼロ |

---

最終更新: 2026-04-13
