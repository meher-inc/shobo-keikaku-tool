/**
 * HMAC-SHA256 署名トークン (national セッション専用)
 *
 * 形式: <base64url(payload)>.<base64url(signature)>
 * payload: JSON { email, exp, iat, purpose }
 *
 * Edge Runtime と Node.js Runtime の両方で動作するよう Web Crypto API
 * (globalThis.crypto.subtle) のみを使用する。middleware から呼び出し可能。
 *
 * 用途は2系統:
 *   - purpose: "login"   メール内マジックリンクに埋め込む短命トークン (15分)
 *   - purpose: "session" cookie に保存する長寿命セッショントークン (30日)
 *
 * SECRET は環境変数 NATIONAL_SESSION_SECRET から取得。未設定時は明示的に
 * throw して fail-fast (本番で「全員ログイン成功」となる事故を防ぐ)。
 */

export type TokenPurpose = "login" | "session";

export interface TokenPayload {
  email: string;
  exp: number; // unix sec
  iat: number; // unix sec
  purpose: TokenPurpose;
}

export const LOGIN_TOKEN_TTL_SEC = 15 * 60; // 15 min
export const SESSION_TOKEN_TTL_SEC = 30 * 24 * 60 * 60; // 30 days
export const SESSION_COOKIE_NAME = "national_session";

function getSecret(): string {
  const s = process.env.NATIONAL_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "[session-token] NATIONAL_SESSION_SECRET is not set or too short (require >= 32 chars)"
    );
  }
  return s;
}

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = (4 - (s.length % 4)) % 4;
  const b64 = (s.replace(/-/g, "+").replace(/_/g, "/")) + "=".repeat(pad);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(payload: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return new Uint8Array(sig);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function signToken(
  payload: Omit<TokenPayload, "iat" | "exp"> & { ttlSec: number }
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const body: TokenPayload = {
    email: payload.email,
    purpose: payload.purpose,
    iat,
    exp: iat + payload.ttlSec,
  };
  const headerB64 = b64urlEncode(new TextEncoder().encode(JSON.stringify(body)));
  const sig = await hmac(headerB64);
  return `${headerB64}.${b64urlEncode(sig)}`;
}

export type VerifyResult =
  | { ok: true; payload: TokenPayload }
  | { ok: false; reason: "malformed" | "bad_signature" | "expired" | "wrong_purpose" };

export async function verifyToken(
  token: string,
  expectedPurpose: TokenPurpose
): Promise<VerifyResult> {
  if (typeof token !== "string" || !token.includes(".")) {
    return { ok: false, reason: "malformed" };
  }
  const [bodyB64, sigB64] = token.split(".");
  if (!bodyB64 || !sigB64) return { ok: false, reason: "malformed" };

  let payload: TokenPayload;
  try {
    const json = new TextDecoder().decode(b64urlDecode(bodyB64));
    payload = JSON.parse(json) as TokenPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (
    typeof payload.email !== "string" ||
    typeof payload.exp !== "number" ||
    typeof payload.iat !== "number" ||
    typeof payload.purpose !== "string"
  ) {
    return { ok: false, reason: "malformed" };
  }

  let expectedSig: Uint8Array;
  let givenSig: Uint8Array;
  try {
    expectedSig = await hmac(bodyB64);
    givenSig = b64urlDecode(sigB64);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (!constantTimeEqual(expectedSig, givenSig)) {
    return { ok: false, reason: "bad_signature" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return { ok: false, reason: "expired" };

  if (payload.purpose !== expectedPurpose) {
    return { ok: false, reason: "wrong_purpose" };
  }

  return { ok: true, payload };
}
