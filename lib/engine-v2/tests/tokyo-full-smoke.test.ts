import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildTokyoFull } from "../adapters/tokyo-full";

/**
 * Step 5 smoke tests for the Tokyo TFD full-pack v2 rendering.
 *
 * Same pattern as kyoto-full-smoke.test.ts: buildTokyoFull →
 * unzip → document.xml string assertions. We assert presence of
 * key fixed strings, NOT v1 byte-level parity.
 */

async function renderAndExtractXml(
  formOverrides: Record<string, unknown> = {}
): Promise<string> {
  const form = {
    building_name: "テスト東京ビル",
    building_address: "東京都千代田区テスト町1-2-3",
    management_scope: "ビル3階部分",
    owner_name: "東京太郎",
    manager_name: "防火花子",
    is_specific_use: true,
    is_unified_management: false,
    has_outsource: false,
    has_outsourced_management: false,
    capacity: 120,
    fire_equipment: ["消火器", "屋内消火栓", "自動火災報知設備", "誘導灯"],
    inspection_company: "テスト防災",
    security_company: "",
    daily_checker: "防火管理者",
    periodic_check_months: "5月と11月",
    emergency_contact_name: "東京太郎",
    emergency_contact_phone: "03-0000-0000",
    wide_area_evacuation_site: "テスト公園",
    temporary_assembly_point: "駐車場",
    education_months: "4月・10月",
    drill_months: "5月・11月",
    creation_date_iso: "2026-04-12",
    ...formOverrides,
  };

  const buf = await buildTokyoFull(form);
  expect(Buffer.isBuffer(buf)).toBe(true);
  expect(buf.length).toBeGreaterThan(5_000);

  const zip = await JSZip.loadAsync(buf);
  const file = zip.file("word/document.xml");
  if (!file) throw new Error("word/document.xml missing");
  return file.async("string");
}

describe("tokyo full-pack v2 smoke tests", () => {
  it("contains all chapter 1-11 headings, 帰宅困難者対策, and 附則", async () => {
    const xml = await renderAndExtractXml();

    expect(xml).toContain("第１　目的及び適用範囲等");
    expect(xml).toContain("第２　管理権原者の責任及び防火管理者の業務");
    expect(xml).toContain("第３　火災予防のための点検・検査");
    expect(xml).toContain("第４　守らなければならないこと");
    expect(xml).toContain("第５　防火・防災教育");
    expect(xml).toContain("第６　消防機関との連絡等");
    expect(xml).toContain("第７　自衛消防隊等");
    expect(xml).toContain("第８　訓練");
    expect(xml).toContain("第９　震災対策");
    expect(xml).toContain("第10　その他の災害対策");
    expect(xml).toContain("第11　その他");
    expect(xml).toContain("帰宅困難者対策");
    expect(xml).toContain("附　則");
  });

  it("contains all appendix 1-11 headings and the index header", async () => {
    const xml = await renderAndExtractXml();

    expect(xml).toContain("別表等一覧");
    expect(xml).toContain("別表１");
    expect(xml).toContain("別表２");
    expect(xml).toContain("別表３");
    expect(xml).toContain("別表４-１");
    expect(xml).toContain("別表４-２");
    expect(xml).toContain("別表５");
    expect(xml).toContain("別表６");
    expect(xml).toContain("別表７");
    expect(xml).toContain("別表８");
    expect(xml).toContain("別表９");
    expect(xml).toContain("別表10");
    expect(xml).toContain("別表11");
  });

  it("附則 eraDate computed produces a 令和 string", async () => {
    const xml = await renderAndExtractXml();
    expect(xml).toContain("令和");
  });

  it("ch7 joinArray renders fire equipment list with 全角句読点", async () => {
    const xml = await renderAndExtractXml();
    expect(xml).toContain("消火器、屋内消火栓、自動火災報知設備、誘導灯");
  });

  it("placeholder substitution resolves building-related fields", async () => {
    const xml = await renderAndExtractXml();
    expect(xml).toContain("ビル3階部分");
    expect(xml).toContain("テスト公園");
  });

  it("ch2 manager duties table is present", async () => {
    const xml = await renderAndExtractXml();
    expect(xml).toContain("業務区分");
    expect(xml).toContain("点検・監督業務");
  });

  it("ch1-outsource section present when outsourced", async () => {
    const xml = await renderAndExtractXml({
      has_outsource: true,
      has_outsourced_management: true,
    });
    expect(xml).toContain("防火・防災管理業務の一部委託について");
    expect(xml).toContain("受託者");
  });

  it("ch1-outsource section absent when not outsourced", async () => {
    const xml = await renderAndExtractXml({
      has_outsource: false,
      has_outsourced_management: false,
    });
    expect(xml).not.toContain("防火・防災管理業務の一部委託について");
  });

  it("ch6 reports table uses 1年 for specific-use", async () => {
    const xml = await renderAndExtractXml({ is_specific_use: true });
    expect(xml).toContain("1年に1回");
  });

  it("ch6 reports table uses 3年 for non-specific-use", async () => {
    const xml = await renderAndExtractXml({ is_specific_use: false });
    expect(xml).toContain("3年に1回");
  });

  it("ch8 drills table uses 年2回以上 for specific-use", async () => {
    const xml = await renderAndExtractXml({ is_specific_use: true });
    expect(xml).toContain("年2回以上");
  });

  it("tokyo-exclusive content is present (テロ, 帰宅困難者, 復旧計画)", async () => {
    const xml = await renderAndExtractXml();
    expect(xml).toContain("大規模テロ");
    expect(xml).toContain("一斉帰宅の抑制");
    expect(xml).toContain("施設再開までの復旧計画");
  });

  // plan=light → no appendices
  it("excludes all appendices when plan=light", async () => {
    const xml = await renderAndExtractXml({ plan: "light" });
    expect(xml).not.toContain("別表等一覧");
    expect(xml).not.toContain("別表３\u3000日常の火災予防");
  });

  // plan=standard → appendices present
  it("includes appendices when plan=standard", async () => {
    const xml = await renderAndExtractXml({ plan: "standard" });
    expect(xml).toContain("別表等一覧");
  });

  // T1: outsourced=true → 別表1+2 appendix pages included
  it("includes 別表1+2 appendix pages when outsourced", async () => {
    const xml = await renderAndExtractXml({
      has_outsourced_management: true,
      has_outsource: true,
    });
    // Heading TextRun "別表N　title" is unique to appendix pages.
    expect(xml).toContain("別表１\u3000防火・防災管理業務の一部委託状況表");
    expect(xml).toContain("別表２\u3000委託契約書等の内容チェック表");
  });

  // T2: outsourced=false → 別表1+2 appendix pages skipped
  it("excludes 別表1+2 appendix pages when not outsourced", async () => {
    const xml = await renderAndExtractXml({
      has_outsourced_management: false,
      has_outsource: false,
    });
    expect(xml).not.toContain("別表１\u3000防火・防災管理業務の一部委託状況表");
    expect(xml).not.toContain("別表２\u3000委託契約書等の内容チェック表");
  });
});
