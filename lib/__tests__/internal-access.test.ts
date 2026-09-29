import { afterEach, describe, expect, it } from "vitest";
import {
  getInternalFreeAccessEmails,
  isInternalFreeAccessEmail,
  normalizeAccessEmail,
} from "../internal-access";

const originalExplicit = process.env.INTERNAL_FREE_ACCESS_EMAILS;
const originalReviewTo = process.env.REVIEW_TO_EMAIL;

afterEach(() => {
  if (originalExplicit === undefined) delete process.env.INTERNAL_FREE_ACCESS_EMAILS;
  else process.env.INTERNAL_FREE_ACCESS_EMAILS = originalExplicit;

  if (originalReviewTo === undefined) delete process.env.REVIEW_TO_EMAIL;
  else process.env.REVIEW_TO_EMAIL = originalReviewTo;
});

describe("internal-access", () => {
  it("normalizes email casing and whitespace", () => {
    expect(normalizeAccessEmail("  Owner@Example.COM ")).toBe("owner@example.com");
  });

  it("uses explicit comma-separated allowlist first", () => {
    process.env.INTERNAL_FREE_ACCESS_EMAILS =
      "owner@example.com, Staff@Example.com";
    process.env.REVIEW_TO_EMAIL = "review@example.com";

    expect(getInternalFreeAccessEmails()).toEqual([
      "owner@example.com",
      "staff@example.com",
    ]);
    expect(isInternalFreeAccessEmail("OWNER@example.com")).toBe(true);
    expect(isInternalFreeAccessEmail("review@example.com")).toBe(false);
  });

  it("falls back to REVIEW_TO_EMAIL when explicit allowlist is absent", () => {
    delete process.env.INTERNAL_FREE_ACCESS_EMAILS;
    process.env.REVIEW_TO_EMAIL = "owner@example.com";

    expect(isInternalFreeAccessEmail("owner@example.com")).toBe(true);
  });

  it("falls back to the existing operator mailbox when no env is configured", () => {
    delete process.env.INTERNAL_FREE_ACCESS_EMAILS;
    delete process.env.REVIEW_TO_EMAIL;

    expect(getInternalFreeAccessEmails()).toEqual(["plan@todokede.jp"]);
    expect(isInternalFreeAccessEmail("plan@todokede.jp")).toBe(true);
  });
});
