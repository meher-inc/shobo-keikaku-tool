// dead-man's switch ping（healthchecks.io）。env 未設定時は完全 no-op。
// 設計: ~/Documents/00_master/30_開発室/02_自動化/cron-monitoring-design.md
export async function pingHealthcheck(ok = true) {
  const url = process.env.HEALTHCHECK_PING_URL;
  if (!url) return;
  try {
    await fetch(ok ? url : `${url}/fail`, { method: "POST", cache: "no-store" });
  } catch {}
}
