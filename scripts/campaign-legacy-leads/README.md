# campaign-legacy-leads — 旧サイトリード一括送信スクリプト

## 実行前提条件

- 5/8 DNS切替完遂確認済み
- `data/leads.csv` 配置済み（列: `区分,お名前,メールアドレス,ドメイン,検討サービス/目的,内容,内容文字数,セグメント,文面パターン,理由,宛名_最終,概要要約`）
- `.env.local` に以下が設定されていること:
  - `RESEND_API_KEY`
  - `ANTHROPIC_API_KEY`（個別送信のみ。Claude API での1行要約に使用）
  - `DRY_RUN_EMAIL`（dry-run時のテスト送信先、SHUN自身のメアド）

## 対象セグメント

`leads.csv` の `セグメント` 列で分岐:

| セグメント値 | 処理 |
|---|---|
| `一斉送信` | `bulk-send.ts` で送信（DL一斉文面・全員同一） |
| `個別対応` | `individual-send.ts` で送信（X/Y/Z 文面別、概要1行はClaude生成） |
| `送信しない` / `除外` / 空欄 | スキップ（処理対象外） |

## 実行手順

### 一斉送信
```bash
# 1. dry-run（DRY_RUN_EMAIL に1件テスト）
npx tsx --env-file=.env.local scripts/campaign-legacy-leads/bulk-send.ts --dry-run

# 2. SHUNが内容確認

# 3. 本番送信（SHUN明示承認後のみ）
npx tsx --env-file=.env.local scripts/campaign-legacy-leads/bulk-send.ts --execute
```

### 個別送信
```bash
# 1. dry-run（Claude APIで概要生成 + DRY_RUN_EMAIL に1件テスト）
npx tsx --env-file=.env.local scripts/campaign-legacy-leads/individual-send.ts --dry-run

# 2. SHUNが内容確認（特に「代行」の混入有無）

# 3. 本番送信（SHUN明示承認後のみ）
npx tsx --env-file=.env.local scripts/campaign-legacy-leads/individual-send.ts --execute
```

## 文面パターン分岐（個別送信）

`文面パターン` 列の先頭文字で分岐:

- `X` で始まる → 福祉医療系（`buildIndividualX*`）
- `Y` で始まる → 飲食店舗系（`buildIndividualY*`）
- `Z` で始まる → 建築・ビル他（`buildIndividualZ*`）
- それ以外 → スキップ（`logs/*.json` に記録）

## 「代行」リスク対策

CLAUDE.md 禁止語ルールに準拠するため、`individual-send.ts` の `summarizeOneLiner()` で2段階のガードを実装:

1. **Claude へのプロンプト制約**: 「代行」「申請代行」「書類代行」を使わせず、「ご相談」等で言い換えるよう明示
2. **後処理 replace**: 出力に万一「代行」が含まれた場合は `ご相談` に強制置換

## 宛名の取り扱い

`宛名_最終` 列（SHUNが手動整形した「○○ 様」）の末尾「 様」を除去してテンプレートの `${name}様` に流し込む。
`宛名_最終` が空欄の行は `お名前` 列にフォールバック。

## ログ出力

`logs/` 配下にタイムスタンプ付き JSON で記録（送信結果・messageId・エラー内容）。
`.gitignore` 済（PII を含むため push しない）。

## 安全装置

- `--dry-run` または `--execute` の明示が必須
- `--dry-run` 時は `DRY_RUN_EMAIL` 必須・先頭1件のみ送信
- 必須環境変数（`RESEND_API_KEY`、個別送信は `ANTHROPIC_API_KEY` も）が無ければ即時 `process.exit(1)`
- `data/leads.csv` は読み取りのみ（書き込み・削除禁止）
