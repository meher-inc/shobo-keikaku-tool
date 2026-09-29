import { describe, expect, it } from "vitest";
import { normalizeInternalReturnTo } from "../internal-return-to";

describe("normalizeInternalReturnTo", () => {
  it("preserves root query params and form hash", () => {
    expect(
      normalizeInternalReturnTo(
        "/?utm_source=ai_concierge&site=plan&owner_login=1#form"
      )
    ).toBe("/?utm_source=ai_concierge&site=plan&owner_login=1#form");
  });

  it("adds #form when root has no hash", () => {
    expect(normalizeInternalReturnTo("/?site=plan")).toBe("/?site=plan#form");
  });

  it("rejects other paths", () => {
    expect(normalizeInternalReturnTo("/admin")).toBe("/#form");
    expect(normalizeInternalReturnTo("/national")).toBe("/#form");
  });

  it("rejects protocol-relative and invalid values", () => {
    expect(normalizeInternalReturnTo("//evil.example")).toBe("/#form");
    expect(normalizeInternalReturnTo("https://evil.example")).toBe("/#form");
    expect(normalizeInternalReturnTo(null)).toBe("/#form");
  });
});
