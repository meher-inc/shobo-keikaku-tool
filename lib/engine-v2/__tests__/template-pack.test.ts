import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { loadPack } from "../engine";
import samplePack from "../packs/kyoto-city.sample.json";

describe("loadPack", () => {
  it("parses the kyoto-city sample pack", () => {
    const pack = loadPack(samplePack);
    expect(pack.deptId).toBe("kyoto-city");
    expect(pack.deptName).toBe("京都市消防局");
    expect(pack.version).toBe("2.0.0-sample");
    expect(pack.chapters).toHaveLength(1);
    expect(pack.chapters[0]?.id).toBe("ch1");
  });

  it("rejects a pack with a missing version field", () => {
    // Strip `version` from the sample.
    const { version, ...broken } = samplePack as { version: string } & Record<string, unknown>;
    void version;

    expect(() => loadPack(broken)).toThrowError(ZodError);
  });

  it("surfaces the placeholder node inside the first section body", () => {
    const pack = loadPack(samplePack);
    const body = pack.chapters[0]?.sections[0]?.body ?? [];
    const placeholders = body.filter((n) => n.type === "placeholder");

    expect(placeholders).toHaveLength(1);
    // discriminated union narrows `placeholders[0]` to PlaceholderNode.
    expect(placeholders[0]?.key).toBe("buildingName");
    expect(placeholders[0]?.fallback).toBe("当該防火対象物");
  });
});
