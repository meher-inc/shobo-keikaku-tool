import { describe, expect, it } from "vitest";
import {
  getNationalPack,
  listNationalPacks,
  NATIONAL_PACK_NAMES,
} from "../registry";
import { isRowTableSection } from "../../types/national-form-pack";

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
      const keys: string[] = [
        ...(pack.headerFields ?? []).map((f) => f.key),
        ...pack.submitterFields.map((f) => f.key),
      ];
      for (const section of pack.sections) {
        if (isRowTableSection(section)) {
          // row-table のセルキーは ${row.key}${col.key} で組み立てる
          for (const row of section.rows) {
            for (const col of section.columns) {
              keys.push(`${row.key}${col.key}`);
            }
          }
        } else {
          for (const f of section.fields) {
            keys.push(f.key);
          }
        }
      }
      const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
      expect(dupes, `duplicates in ${pack.packName}: ${dupes.join(",")}`).toEqual([]);
    }
  });

  it("row-table sections have non-empty rows and columns", () => {
    for (const pack of listNationalPacks()) {
      for (const section of pack.sections) {
        if (isRowTableSection(section)) {
          expect(section.rows.length).toBeGreaterThan(0);
          expect(section.columns.length).toBeGreaterThan(0);
          // row.key + col.key で組み立てたキーが空文字でないこと
          for (const row of section.rows) {
            for (const col of section.columns) {
              const k = `${row.key}${col.key}`;
              expect(k.length).toBeGreaterThan(0);
            }
          }
        }
      }
    }
  });

  it("fire-manager-appointment includes the rule-application row-table", () => {
    const pack = getNationalPack("fire-manager-appointment");
    expect(pack).toBeDefined();
    const ruleSection = pack!.sections.find((s) => s.id === "rule-application");
    expect(ruleSection).toBeDefined();
    expect(isRowTableSection(ruleSection!)).toBe(true);
    if (isRowTableSection(ruleSection!)) {
      // 4 行 (令第2条適用 2 + 令第3条第3項適用 2)、3 列 (名称・令別表第1・収容人員)
      expect(ruleSection.rows).toHaveLength(4);
      expect(ruleSection.columns).toHaveLength(3);
      const rowKeys = ruleSection.rows.map((r) => r.key);
      expect(rowKeys).toEqual([
        "rule2Building1",
        "rule2Building2",
        "rule3p3Part1",
        "rule3p3Part2",
      ]);
      expect(ruleSection.columns.map((c) => c.key)).toEqual(["Name", "Category", "Capacity"]);
    }
  });
});
