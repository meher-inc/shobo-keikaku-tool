import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/session-token";

/**
 * 1st of 3 access guards for /national.
 *
 * Edge Runtime で動くため、ここでは cookie の HMAC 検証のみ実施。
 * Supabase への subscription status チェックは server component と API route
 * 側 (Node.js Runtime) で行う ([lib/national-access.ts]).
 *
 * 判定:
 *   - cookie に有効な session token があれば pass-through
 *   - 無い / 不正 / 期限切れ → /mypage へリダイレクト (ユーザ指示)
 *
 * API route /api/generate-national については、middleware では同じく
 * cookie 検証のみ。失敗時はリダイレクトせず 401 JSON を返す。
 */

export const config = {
  matcher: ["/national/:path*", "/api/generate-national/:path*"],
};

const PUBLIC_NATIONAL_PATHS = new Set(["/national/login"]);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /national/login は未認証でもアクセスできるようにする
  if (PUBLIC_NATIONAL_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const isApi = pathname.startsWith("/api/");
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return unauthorized(req, isApi);
  }

  const result = await verifyToken(token, "session");
  if (!result.ok) {
    const res = unauthorized(req, isApi);
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  // pass-through. forward the verified email to downstream handlers
  // via a request header so server components / API don't need to
  // re-verify the cookie (defense-in-depth: they will re-verify anyway).
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-national-email", result.payload.email);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

function unauthorized(req: NextRequest, isApi: boolean): NextResponse {
  if (isApi) {
    return NextResponse.json(
      { error: "ログインが必要です。", code: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }
  const url = req.nextUrl.clone();
  url.pathname = "/mypage";
  url.searchParams.set("from", "national");
  return NextResponse.redirect(url);
}
