import { NextRequest, NextResponse } from "next/server";
import {
  signToken,
  verifyToken,
  SESSION_COOKIE_NAME,
  SESSION_TOKEN_TTL_SEC,
} from "@/lib/session-token";
import { checkAccess, redirectPathForDecision } from "@/lib/national-access";

export const runtime = "nodejs";

/**
 * GET /api/national-session/verify?token=<login-token>
 *
 * メール内マジックリンクから呼ばれる。フロー:
 *   1. login token (HMAC, 15min TTL) を検証
 *   2. 契約状態を再確認 (リンク発行後に解約されている可能性)
 *   3. session token (HMAC, 30day TTL) を発行して cookie に set
 *   4. /national へリダイレクト
 *
 * 失敗時はクエリパラメータ付きで login ページに戻す。
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";

  const verified = await verifyToken(token, "login");
  if (!verified.ok) {
    return redirectToLogin(request, `error=${verified.reason}`);
  }

  const decision = await checkAccess(verified.payload.email);
  if (!decision.allowed) {
    const target = request.nextUrl.clone();
    target.pathname = redirectPathForDecision(decision);
    target.search = `?from=national&reason=${decision.reason}`;
    return NextResponse.redirect(target);
  }

  const sessionToken = await signToken({
    email: decision.email,
    purpose: "session",
    ttlSec: SESSION_TOKEN_TTL_SEC,
  });

  const target = request.nextUrl.clone();
  target.pathname = "/national";
  target.search = "";
  const res = NextResponse.redirect(target);
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TOKEN_TTL_SEC,
  });
  return res;
}

function redirectToLogin(request: NextRequest, qs: string): NextResponse {
  const target = request.nextUrl.clone();
  target.pathname = "/national/login";
  target.search = `?${qs}`;
  return NextResponse.redirect(target);
}
