import { NextRequest, NextResponse } from "next/server";
import {
  isInternalFreeAccessEmail,
  normalizeAccessEmail,
} from "@/lib/internal-access";
import { normalizeInternalReturnTo } from "@/lib/internal-return-to";
import {
  signToken,
  verifyToken,
  SESSION_COOKIE_NAME,
  SESSION_TOKEN_TTL_SEC,
} from "@/lib/session-token";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const returnTo = normalizeInternalReturnTo(
    request.nextUrl.searchParams.get("return_to")
  );

  const verified = await verifyToken(token, "login");
  if (!verified.ok) {
    return redirectToInternalLogin(
      request,
      returnTo,
      `error=${verified.reason}`
    );
  }

  const email = normalizeAccessEmail(verified.payload.email);
  if (!isInternalFreeAccessEmail(email)) {
    return redirectToInternalLogin(
      request,
      returnTo,
      "error=not_allowed"
    );
  }

  const sessionToken = await signToken({
    email,
    purpose: "session",
    ttlSec: SESSION_TOKEN_TTL_SEC,
  });

  const target = new URL(returnTo, request.nextUrl.origin);
  const response = NextResponse.redirect(target);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TOKEN_TTL_SEC,
  });
  return response;
}

function redirectToInternalLogin(
  request: NextRequest,
  returnTo: string,
  errorQuery: string
): NextResponse {
  const target = request.nextUrl.clone();
  target.pathname = "/internal/login";
  target.search =
    `?${errorQuery}&return_to=${encodeURIComponent(returnTo)}`;
  target.hash = "";
  return NextResponse.redirect(target);
}
