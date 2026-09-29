import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifyToken } from "./session-token";
import {
  isInternalFreeAccessEmail,
  normalizeAccessEmail,
} from "./internal-access";

/**
 * Return the verified internal-access email for this request.
 *
 * Authentication is the existing signed 30-day national_session cookie.
 * Authorization is the server-side internal free-access allowlist.
 */
export async function getInternalSessionEmail(
  request: NextRequest
): Promise<string | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = await verifyToken(token, "session");
  if (!verified.ok) return null;

  const email = normalizeAccessEmail(verified.payload.email);
  if (!isInternalFreeAccessEmail(email)) return null;

  return email;
}
