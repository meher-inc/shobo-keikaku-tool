import { parseArgs } from "node:util";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const { values } = parseArgs({
    options: {
      "order-id": { type: "string" },
      "sent-at": { type: "string" },
      help: { type: "boolean" },
    },
    strict: true,
  });
  if (values.help) {
    console.log('Usage: node --env-file=.env.local --import tsx scripts/record-premium-comments.ts --order-id <UUID> --sent-at "2026-09-30T15:00:00+09:00"');
    return;
  }

  const orderId = values["order-id"];
  const sentAt = values["sent-at"];
  if (!orderId || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(orderId)) {
    throw new Error("--order-id に注文のUUIDを指定してください");
  }
  if (!sentAt || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(sentAt) || !Number.isFinite(Date.parse(sentAt))) {
    throw new Error("--sent-at にタイムゾーン付きの実送付日時を指定してください");
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabaseの接続設定がありません");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.rpc("record_premium_comments_sent", {
    p_order_id: orderId,
    p_sent_at: sentAt,
  });
  if (error) {
    // The SQL function returns these operational errors without customer data.
    if (error.code === "P0001") throw new Error(error.message);
    throw new Error("送付日時を記録できませんでした。接続先・権限・migration適用状況を確認してください");
  }
  console.log(JSON.stringify({ order_id: orderId, premium_comments_sent_at: data }));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "記録に失敗しました");
  process.exitCode = 1;
});
