/**
 * National (届出書) アクセス制御 — 契約状態判定ヘルパー
 *
 * AGENTS.md 聖域順守:
 *   - lib/subscriptions.ts には触らない
 *   - lib/supabase.ts からは supabaseAdmin の import のみ
 *
 * 契約状態の意味:
 *   active / trialing   → 通行可
 *   past_due / unpaid   → /pricing リダイレクト (ユーザ指示)
 *   canceled / paused / incomplete / incomplete_expired → /pricing
 *   行が存在しない      → /pricing
 *
 * 本モジュールは Node.js Runtime 専用 (supabase-js client を使用するため)。
 * Edge Runtime の middleware から呼び出してはならない。middleware では
 * cookie の HMAC 検証のみ実施し、契約チェックは server component / API で行う。
 */

import { supabaseAdmin } from "./supabase";

export type AccessDecision =
  | { allowed: true; email: string }
  | { allowed: false; reason: "no_subscription" | "past_due_or_unpaid" | "canceled" | "db_error" };

const ALLOW_STATUSES = new Set(["active", "trialing"]);
const PAY_REQUIRED_STATUSES = new Set(["past_due", "unpaid"]);

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Look up the highest-priority subscription row for an email and return
 * an access decision. The highest-priority row is whichever status comes
 * first in this preference order: active > trialing > past_due > unpaid
 * > the rest. This matters when the same email has multiple historical
 * rows (e.g. a canceled old plan plus a new active one).
 */
export async function checkAccess(email: string): Promise<AccessDecision> {
  const normalized = normalizeEmail(email);

  let rows: { status: string }[];
  try {
    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .select("status")
      .eq("customer_email", normalized);
    if (error) {
      console.error("[national-access] supabase error:", error.message);
      return { allowed: false, reason: "db_error" };
    }
    rows = (data ?? []) as { status: string }[];
  } catch (err) {
    console.error("[national-access] unexpected error:", err);
    return { allowed: false, reason: "db_error" };
  }

  if (rows.length === 0) {
    return { allowed: false, reason: "no_subscription" };
  }

  if (rows.some((r) => ALLOW_STATUSES.has(r.status))) {
    return { allowed: true, email: normalized };
  }
  if (rows.some((r) => PAY_REQUIRED_STATUSES.has(r.status))) {
    return { allowed: false, reason: "past_due_or_unpaid" };
  }
  return { allowed: false, reason: "canceled" };
}

/**
 * Build the redirect target path for a non-allowed access decision.
 *   no_subscription           → /pricing
 *   past_due_or_unpaid        → /pricing
 *   canceled                  → /pricing
 *   db_error                  → /pricing (fail-closed; avoid leaking access on DB outage)
 */
export function redirectPathForDecision(decision: AccessDecision): string {
  if (decision.allowed) return "/national";
  return "/pricing";
}
