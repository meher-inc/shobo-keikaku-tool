import { beforeAll, describe, expect, it } from "vitest";
import {
  signToken,
  verifyToken,
  LOGIN_TOKEN_TTL_SEC,
  SESSION_TOKEN_TTL_SEC,
} from "../session-token";

beforeAll(() => {
  process.env.NATIONAL_SESSION_SECRET = "x".repeat(48); // テスト用ダミー秘密鍵
});

describe("session-token", () => {
  it("round-trips a login token", async () => {
    const token = await signToken({
      email: "user@example.com",
      purpose: "login",
      ttlSec: LOGIN_TOKEN_TTL_SEC,
    });
    const result = await verifyToken(token, "login");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.email).toBe("user@example.com");
      expect(result.payload.purpose).toBe("login");
      expect(result.payload.exp - result.payload.iat).toBe(LOGIN_TOKEN_TTL_SEC);
    }
  });

  it("round-trips a session token", async () => {
    const token = await signToken({
      email: "a@b.co",
      purpose: "session",
      ttlSec: SESSION_TOKEN_TTL_SEC,
    });
    const result = await verifyToken(token, "session");
    expect(result.ok).toBe(true);
  });

  it("rejects malformed tokens", async () => {
    const r1 = await verifyToken("", "session");
    const r2 = await verifyToken("nodot", "session");
    const r3 = await verifyToken("only.one.dot", "session");
    expect(r1.ok).toBe(false);
    expect(r2.ok).toBe(false);
    expect(r3.ok).toBe(false);
  });

  it("rejects tokens with a tampered payload", async () => {
    const token = await signToken({
      email: "user@example.com",
      purpose: "session",
      ttlSec: 60,
    });
    const [, sig] = token.split(".");
    // Insert a different but well-formed payload alongside the original signature
    const fakePayload = Buffer.from(
      JSON.stringify({ email: "attacker@example.com", iat: 1, exp: 9999999999, purpose: "session" })
    )
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const tampered = `${fakePayload}.${sig}`;
    const result = await verifyToken(tampered, "session");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("bad_signature");
  });

  it("rejects expired tokens", async () => {
    const token = await signToken({
      email: "user@example.com",
      purpose: "session",
      ttlSec: -10, // 既に過去
    });
    const result = await verifyToken(token, "session");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("expired");
  });

  it("rejects a token whose purpose does not match", async () => {
    const loginToken = await signToken({
      email: "user@example.com",
      purpose: "login",
      ttlSec: LOGIN_TOKEN_TTL_SEC,
    });
    const result = await verifyToken(loginToken, "session");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("wrong_purpose");
  });

  it("rejects tokens signed by a different secret", async () => {
    const token = await signToken({
      email: "user@example.com",
      purpose: "session",
      ttlSec: 60,
    });
    process.env.NATIONAL_SESSION_SECRET = "y".repeat(48);
    const result = await verifyToken(token, "session");
    // restore
    process.env.NATIONAL_SESSION_SECRET = "x".repeat(48);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("bad_signature");
  });
});
