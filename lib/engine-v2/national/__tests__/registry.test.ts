import { describe, expect, it } from "vitest";
import {
  getNationalPack,
  listNationalPacks,
  NATIONAL_PACK_NAMES,
} from "../registry";

const EXPECTED_PACKS = [
  // Phase 1
  "fire-manager-appointment",
  "fire-plan-notification",
  "self-defense-org-establishment",
  "building-use-start",
  "building-construction-plan",
  "equipment-construction-start",
  "equipment-installation",
  // Phase 2
  "fire-object-inspection-report",
  "equipment-inspection-report",
  "inspection-report-special-approval",
  "hazmat-facility-permit",
  "hazmat-facility-abolition",
  "hazmat-safety-supervisor",
  "minor-hazmat-notification",
  "event-hosting-notification",
  // Phase 3 (consultProfessional=true)
  "hazmat-temporary-use",
  "hazmat-temporary-storage",
  "hazmat-name-quantity-change",
  "hazmat-facility-change-permit",
  "hazmat-prevention-rules-approval",
  "hazmat-comprehensive-safety-supervisor",
  "hazmat-facility-safety-officer",
  "hazmat-transfer",
] as const;

const PHASE_3_PACKS = [
  "hazmat-temporary-use",
  "hazmat-temporary-storage",
  "hazmat-name-quantity-change",
  "hazmat-facility-change-permit",
  "hazmat-prevention-rules-approval",
  "hazmat-comprehensive-safety-supervisor",
  "hazmat-facility-safety-officer",
  "hazmat-transfer",
] as const;

describe("national pack registry", () => {
  it("registers all Phase-1 + Phase-2 + Phase-3 packs (23 total)", () => {
    expect(NATIONAL_PACK_NAMES).toHaveLength(23);
    for (const name of EXPECTED_PACKS) {
      expect(NATIONAL_PACK_NAMES).toContain(name);
    }
  });

  it("all Phase-3 packs have consultProfessional=true", () => {
    for (const name of PHASE_3_PACKS) {
      const pack = getNationalPack(name);
      expect(pack, `pack ${name} not found`).toBeDefined();
      expect(pack!.consultProfessional, `${name} missing consultProfessional`).toBe(true);
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
