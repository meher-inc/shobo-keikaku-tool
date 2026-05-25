import { describe, expect, it } from "vitest";
import { applyPackNormalizers } from "../normalizers";

describe("applyPackNormalizers - fire-manager-appointment kindManagers", () => {
  const normalize = (input: Record<string, unknown>) =>
    applyPackNormalizers("fire-manager-appointment", input as Parameters<typeof applyPackNormalizers>[1]);

  it("single 防火", () => {
    expect(normalize({ kind: ["防火"] }).kindManagers).toBe("防火管理者");
  });

  it("single 防災", () => {
    expect(normalize({ kind: ["防災"] }).kindManagers).toBe("防災管理者");
  });

  it("both (兼任)", () => {
    expect(normalize({ kind: ["防火", "防災"] }).kindManagers).toBe(
      "防火管理者及び防災管理者"
    );
  });

  it("reverse order yields the same ordering as input", () => {
    expect(normalize({ kind: ["防災", "防火"] }).kindManagers).toBe(
      "防災管理者及び防火管理者"
    );
  });

  it("empty array → empty string", () => {
    expect(normalize({ kind: [] }).kindManagers).toBe("");
  });

  it("undefined → empty string", () => {
    expect(normalize({}).kindManagers).toBe("");
  });

  it("backward compat: radio-shaped string", () => {
    expect(normalize({ kind: "防火" }).kindManagers).toBe("防火管理者");
  });

  it("filters unknown values silently", () => {
    expect(normalize({ kind: ["防火", "BAD"] }).kindManagers).toBe("防火管理者");
  });

  it("preserves other fields untouched", () => {
    const out = normalize({ kind: ["防火"], buildingName: "東消ビル" });
    expect(out.buildingName).toBe("東消ビル");
  });
});

describe("applyPackNormalizers - non-target pack", () => {
  it("returns input unchanged for unknown pack", () => {
    const input = { foo: "bar" };
    const out = applyPackNormalizers(
      "fire-plan-notification",
      input as Parameters<typeof applyPackNormalizers>[1]
    );
    expect(out).toEqual(input);
  });
});
