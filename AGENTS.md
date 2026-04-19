<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 触らないファイル例外ルール(2026-04-20 追加)

原則として `app/legal/**`、`app/subscribe/success/**`、`app/api/webhook/stripe/**`、
`app/mypage/**`、`app/api/**`、`lib/supabase.ts`、`lib/subscriptions.ts`、
`supabase/migrations/**` は触らない。

### 例外が認められる条件
- 表示されるテキスト(日本語文言)の修正のみに限定
- 構造変更・ロジック変更・フィールド追加削除は一切しない
- 丸岡さんの明示的な合意を事前に得る
- recon(読取調査 → 報告 → 合意 → 実装)の手順を必ず踏む

### 過去の例外事例
- 2026-04-20: W3 ブランド整合性スイープ(feat/W3-brand-sweep)
  - サブスクフルリリース済に伴う「先行予約」「2026年5月」等の旧表記一掃
  - ブランド表記(件名・フッター)を「トドケデ」に統一
  - FROM アドレスを検証済み todokede.jp に統一
  - 対象: legal/terms, legal/tokusho, subscribe/success, webhook/stripe, lib/email.ts 等
  - commits: c1559de..0a98ab8(8 commits)
