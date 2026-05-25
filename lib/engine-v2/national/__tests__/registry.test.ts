import { describe, expect, it } from "vitest";
import {
  getNationalPack,
  listNationalPacks,
  NATIONAL_PACK_NAMES,
} from "../registry";

const EXPECTED_PACKS = [
  "fire-manager-appointment",
  "fire-plan-notification",
  "self-defense-org-establishment",
  "building-use-start",
  "building-construction-plan",
  "equipment-construction-start",
  "equipment-installation",
] as const;

describe("national pack registry", () => {
  it("registers all 7 Phase-1 packs", () => {
    expect(NATIONAL_PACK_NAMES).toHaveLength(7);
    for (const name of EXPECTED_PACKS) {
      expect(NATIONAL_PACK_NAMES).toContain(name);
    }
  });

  it("each pack has required metadata and at least one section", () => {
    for (const pack of listNationalPacks()) {
      expect(pack.version).toBe("1.0");
      expect(pack.packName).toBeTruthy();
      expect(pack.title).toBeTruthy();
      expect(pack.legalRef).toBeTruthy();
      expect(pack.preamble).toBeTruthy();
      expect(pack.submitToTemplate).toBeTruthy();
      expect(pack.submitterFields.length).toBeGreaterThan(0);
      expect(pack.sections.length).toBeGreaterThan(0);
    }
  });

  it("getNationalPack returns undefined for unknown name", () => {
    expect(getNationalPack("unknown-pack")).toBeUndefined();
  });

  it("all field keys are unique within a pack", () => {
    for (const pack of listNationalPacks()) {
      const keys = [
        ...(pack.headerFields ?? []).map((f) => f.key),
        ...pack.submitterFields.map((f) => f.key),
        ...pack.sections.flatMap((s) => s.fields.map((f) => f.key)),
      ];
      const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
      expect(dupes, `duplicates in ${pack.packName}: ${dupes.join(",")}`).toEqual([]);
    }
  });
});
