import { describe, it, expect } from "vitest";
// v1 is plain JS with CJS exports. We lean on tsconfig.allowJs to
// import it directly; the build() return is loosely-typed Promise<any>,
// which is fine because we assert shape at runtime.
import v1Kyoto from "../../generate_kyoto_full.js";
import v1Tokyo from "../../generate_tokyo_full.js";

type V1Build = (input: Record<string, unknown>) => Promise<Buffer>;
const { build: buildKyoto } = v1Kyoto as { build: V1Build };
const { build: buildTokyo } = v1Tokyo as { build: V1Build };

/**
 * v1 regression smoke.
 *
 * Step 4b will extend engine-v2 aggressively (builders, computed
 * fns, new packs, etc.). This test exists to catch the scenario
 * where an engine-v2 change accidentally affects the v1 path —
 * e.g. by editing a shared helper, breaking an import, or mutating
 * a file that v1 transitively pulls in. If that ever happens,
 * these assertions are the fast signal.
 *
 * NOTE on coverage: v1 Kyoto ships as a single file
 * (lib/generate_kyoto_full.js) for the 中規模用 template only —
 * there is NO v1 小規模 (tenant-scale) implementation to regress
 * against. Task 0 therefore covers two medium-scale variants that
 * exercise different v1 conditional branches (unified, outsourced,
 * is_specific_use). Task 1 will settle the 小規模 version story
 * before Step 4b's small-pack work begins.
 */

function baseMediumForm(): Record<string, unknown> {
  return {
    building_name: "v1回帰テスト中規模ビル",
    company_name: "v1テスト株式会社",
    building_address: "京都市中京区テスト町1-2-3",
    building_use: "飲食店",
    use_category: "3項ロ",
    is_specific_use: true,
    total_area: 350,
    num_floors: 3,
    capacity: 80,
    management_scope: "建物全体",
    is_unified_management: false,
    has_outsourced_management: false,
    outsource_company: "",
    owner_name: "京都 太郎",
    manager_name: "消防 花子",
    manager_qualification: "甲種",
    manager_appointment_date: "令和6年4月1日",
    manager_contact: "075-000-0000",
    fire_equipment: ["消火器", "自動火災報知設備", "誘導灯"],
    inspection_company: "テスト防災",
    security_company: "",
    daily_checker: "防火管理者",
    daily_check_timing: "毎日終業時",
    periodic_check_months: "4月と10月",
    self_check_months: "1月と7月",
    emergency_contact_name: "京都 太郎",
    emergency_contact_phone: "090-0000-0000",
    wide_area_evacuation_site: "○○公園",
    temporary_assembly_point: "駐車場",
    drill_months: "4月・10月",
    education_months: "4月・10月",
    creation_date: "令和8年4月11日",
    include_appendix: true,
  };
}

function assertValidDocxBuffer(buf: unknown): void {
  expect(Buffer.isBuffer(buf)).toBe(true);
  const b = buf as Buffer;
  // docx files are zip archives; first 4 bytes must be 50 4B 03 04.
  expect(b[0]).toBe(0x50);
  expect(b[1]).toBe(0x4b);
  expect(b[2]).toBe(0x03);
  expect(b[3]).toBe(0x04);
  // Reasonable floor for the full medium kyoto pack (cover page +
  // 10 chapters + appendices). Well under the real output so a
  // legitimate content trim won't flake, but high enough that a
  // structural break (empty doc, serialization failure) trips it.
  expect(b.length).toBeGreaterThan(5_000);
}

function baseTokyoForm(): Record<string, unknown> {
  return {
    building_name: "v1回帰テスト東京ビル",
    building_address: "東京都千代田区テスト町1-2-3",
    building_use: "事務所",
    use_category: "3項ロ",
    is_specific_use: true,
    total_area: 800,
    num_floors: 5,
    capacity: 120,
    management_scope: "建物全体",
    is_unified_management: false,
    has_outsourced_management: false,
    outsource_company: "",
    owner_name: "東京 太郎",
    manager_name: "防火 花子",
    manager_qualification: "甲種",
    fire_equipment: ["消火器", "屋内消火栓", "自動火災報知設備", "誘導灯"],
    inspection_company: "テスト防災",
    security_company: "",
    daily_checker: "防火管理者",
    periodic_check_months: "5月と11月",
    emergency_contact_name: "東京 太郎",
    emergency_contact_phone: "03-0000-0000",
    wide_area_evacuation_site: "テスト公園",
    temporary_assembly_point: "駐車場",
    drill_months: "5月・11月",
    education_months: "4月・10月",
    creation_date: "令和8年4月12日",
    include_appendix: true,
  };
}

describe("v1 generate_kyoto_full regression smoke", () => {
  it("builds a docx for specific-use / non-unified / non-outsourced medium", async () => {
    const buf = await buildKyoto(baseMediumForm());
    assertValidDocxBuffer(buf);
  });

  it("builds a docx for non-specific / unified / outsourced medium", async () => {
    const buf = await buildKyoto({
      ...baseMediumForm(),
      building_name: "v1回帰テスト統括管理ビル",
      use_category: "15", // non-specific
      is_specific_use: false,
      is_unified_management: true,
      has_outsourced_management: true,
      outsource_company: "テスト管理サービス株式会社",
    });
    assertValidDocxBuffer(buf);
  });
});

describe("v1 generate_tokyo_full regression smoke", () => {
  it("C: builds a docx for specific-use / non-unified / non-outsourced", async () => {
    const buf = await buildTokyo(baseTokyoForm());
    assertValidDocxBuffer(buf);
  });

  it("D: builds a docx for non-specific / unified / outsourced", async () => {
    const buf = await buildTokyo({
      ...baseTokyoForm(),
      building_name: "v1回帰テスト統括管理東京ビル",
      use_category: "15",
      is_specific_use: false,
      is_unified_management: true,
      has_outsourced_management: true,
      outsource_company: "テスト管理サービス株式会社",
      security_company: "テスト警備株式会社",
    });
    assertValidDocxBuffer(buf);
  });
});
