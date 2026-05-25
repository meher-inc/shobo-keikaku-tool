import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// supabaseAdmin をテストごとに差し替えられるよう vi.mock でモック化
type Rows = { status: string }[] | null;
let mockRows: Rows = null;
let mockError: { message: string } | null = null;

vi.mock("../supabase", () => {
  return {
    supabaseAdmin: {
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: mockRows, error: mockError }),
        }),
      }),
    },
  };
});

// dynamic import (after vi.mock 設定後)
const { checkAccess, normalizeEmail, redirectPathForDecision } = await import(
  "../national-access"
);

beforeEach(() => {
  mockRows = null;
  mockError = null;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Foo@Bar.CO  ")).toBe("foo@bar.co");
  });
});

describe("checkAccess", () => {
  it("returns no_subscription when 0 rows", async () => {
    mockRows = [];
    const d = await checkAccess("a@b.co");
    expect(d).toEqual({ allowed: false, reason: "no_subscription" });
  });

  it("allows when at least one row is active", async () => {
    mockRows = [{ status: "canceled" }, { status: "active" }];
    const d = await checkAccess("a@b.co");
    expect(d.allowed).toBe(true);
    if (d.allowed) expect(d.email).toBe("a@b.co");
  });

  it("allows when only trialing", async () => {
    mockRows = [{ status: "trialing" }];
    const d = await checkAccess("a@b.co");
    expect(d.allowed).toBe(true);
  });

  it("returns past_due_or_unpaid when past_due exists and no active/trialing", async () => {
    mockRows = [{ status: "past_due" }];
    const d = await checkAccess("a@b.co");
    expect(d).toEqual({ allowed: false, reason: "past_due_or_unpaid" });
  });

  it("returns past_due_or_unpaid for unpaid", async () => {
    mockRows = [{ status: "unpaid" }];
    const d = await checkAccess("a@b.co");
    expect(d).toEqual({ allowed: false, reason: "past_due_or_unpaid" });
  });

  it("returns canceled when only canceled rows", async () => {
    mockRows = [{ status: "canceled" }, { status: "incomplete_expired" }];
    const d = await checkAccess("a@b.co");
    expect(d).toEqual({ allowed: false, reason: "canceled" });
  });

  it("returns db_error when supabase fails (fail-closed)", async () => {
    mockError = { message: "connection refused" };
    const d = await checkAccess("a@b.co");
    expect(d).toEqual({ allowed: false, reason: "db_error" });
  });

  it("prefers active over past_due in mixed rows", async () => {
    mockRows = [{ status: "past_due" }, { status: "active" }];
    const d = await checkAccess("a@b.co");
    expect(d.allowed).toBe(true);
  });
});

describe("redirectPathForDecision", () => {
  it("returns /national when allowed", () => {
    expect(
      redirectPathForDecision({ allowed: true, email: "a@b.co" })
    ).toBe("/national");
  });

  it("returns /pricing for all denial reasons", () => {
    for (const reason of [
      "no_subscription",
      "past_due_or_unpaid",
      "canceled",
      "db_error",
    ] as const) {
      expect(redirectPathForDecision({ allowed: false, reason })).toBe(
        "/pricing"
      );
    }
  });
});
