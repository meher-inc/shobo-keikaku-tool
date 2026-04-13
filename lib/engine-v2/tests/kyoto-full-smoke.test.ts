import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildKyotoFull } from "../adapters/kyoto-full";

/**
 * Step 4b smoke tests for the Kyoto full-pack v2 rendering.
 *
 * These drive buildKyotoFull (the production entry point for
 * ?engine=v2&pack=full) end-to-end: form → loadPack + TS
 * builders → Document → Packer.toBuffer → unzip →
 * word/document.xml string assertions.
 *
 * We assert presence of key fixed strings, NOT v1 byte-level
 * parity. The goal is to catch structural breakage (missing
 * chapters, broken overrides, placeholder resolution failures).
 */

async function renderAndExtractXml(
  formOverrides: Record<string, unknown> = {}
): Promise<string> {
  const form = {
    building_name: "テストビル",
    owner_name: "テスト太郎",
    manager_name: "テスト花子",
    is_specific_use: true,
    is_unified_management: false,
    has_outsource: false,
    capacity: 80,
    fire_equipment: ["消火器", "自動火災報知設備", "誘導灯"],
    inspection_company: "テスト防災",
    security_company: "テスト警備",
    daily_checker: "防火管理者",
    daily_check_timing: "毎日終業時",
    periodic_check_months: "4月と10月",
    self_check_months: "1月と7月",
    emergency_contact_name: "テスト太郎",
    emergency_contact_phone: "090-0000-0000",
    wide_area_evacuation_site: "テスト公園",
    temporary_assembly_point: "北側駐車場",
    education_months: "4月・10月",
    drill_months: "4月・10月",
    creation_date_iso: "2026-04-11",
    ...formOverrides,
  };

  const buf = await buildKyotoFull(form);
  expect(Buffer.isBuffer(buf)).toBe(true);
  expect(buf.length).toBeGreaterThan(5_000);

  const zip = await JSZip.loadAsync(buf);
  const file = zip.file("word/document.xml");
  if (!file) throw new Error("word/document.xml missing");
  return file.async("string");
}

describe("kyoto full-pack v2 smoke tests", () => {
  it("contains all chapter 1-10 headings and 附則", async () => {
    const xml = await renderAndExtractXml();

    // Chapter headings from v1 (exact strings).
    expect(xml).toContain("第１　目的及びその適用範囲等");
    expect(xml).toContain("第２　管理権原者及び防火管理者の業務と権限");
    expect(xml).toContain("第３　消防機関との連絡等");
    expect(xml).toContain("第４　火災予防上の点検・検査");
    expect(xml).toContain("第５　厳守事項");
    expect(xml).toContain("第６　自衛消防隊等");
    expect(xml).toContain("第７　休日、夜間の防火管理体制");
    expect(xml).toContain("第８　地震対策");
    expect(xml).toContain("第９　防災教育");
    expect(xml).toContain("第10　訓練");
    expect(xml).toContain("附　則");
  });

  it("contains all appendix 1-9 headings and the index table header", async () => {
    const xml = await renderAndExtractXml();

    expect(xml).toContain("別表等一覧");
    for (let i = 1; i <= 9; i++) {
      // Full-width numbers in headings: "別表１", "別表２", etc.
      const fullWidthNum = String.fromCharCode("０".charCodeAt(0) + i);
      expect(xml).toContain(`別表${fullWidthNum}`);
    }
  });

  it("ch3 table builder uses reportFrequency for specific-use", async () => {
    const xml = await renderAndExtractXml({ is_specific_use: true });
    // specific-use → reportFrequency = "1年" → "1年に1回（総合点検終了後）"
    expect(xml).toContain("1年に1回");
  });

  it("ch6 joinArray renders fire equipment list", async () => {
    const xml = await renderAndExtractXml();
    // joinArray joins the CSV with "、" separator.
    expect(xml).toContain("消火器、自動火災報知設備、誘導灯");
  });

  it("ch8 includes assembly variant when temporaryAssemblyPoint is set", async () => {
    const xml = await renderAndExtractXml({ temporary_assembly_point: "北側駐車場" });
    expect(xml).toContain("北側駐車場");
    // "エ" prefix (with-assembly variant has 4 subitems ending in エ).
    expect(xml).toContain("エ　避難には、車両等は使用せず全員徒歩とする。");
  });

  it("ch8 uses no-assembly variant when temporaryAssemblyPoint is absent", async () => {
    const xml = await renderAndExtractXml({ temporary_assembly_point: "" });
    // "ウ" prefix (no-assembly variant has 3 subitems ending in ウ).
    expect(xml).toContain("ウ　避難には、車両等は使用せず全員徒歩とする。");
    // The assembly-specific line should NOT be present.
    expect(xml).not.toContain("一時集合場所の");
  });

  it("ch7 includes security section when securityCompany is set", async () => {
    const xml = await renderAndExtractXml({ security_company: "テスト警備" });
    expect(xml).toContain("テスト警備");
    expect(xml).toContain("休日、夜間に無人となる場合");
  });

  it("ch7 excludes security section when securityCompany is absent", async () => {
    const xml = await renderAndExtractXml({ security_company: "" });
    expect(xml).not.toContain("休日、夜間に無人となる場合");
  });

  // K1: outsourced=true → 別表1 appendix page included
  it("includes 別表1 appendix page when outsourced", async () => {
    const xml = await renderAndExtractXml({
      has_outsourced_management: true,
      has_outsource: true,
    });
    // The heading "別表１　title" is a single TextRun only present
    // in the appendix page, not in the 別表一覧 index table (which
    // has "別表１" and title in separate cells).
    expect(xml).toContain("別表１\u3000防火管理業務の一部委託状況表");
  });

  // indent heuristic: w:ind w:left="420" appears for subitem lines
  it("applies indent to subitem marker lines in document XML", async () => {
    const xml = await renderAndExtractXml();
    // The docx XML should contain indent attribute for ア/イ marker lines.
    // Exact format: <w:ind w:left="420"/>
    expect(xml).toContain('w:left="420"');
  });

  // ch1 section 2 (適用範囲) exists
  it("contains ch1 section 2 (適用範囲) heading", async () => {
    const xml = await renderAndExtractXml();
    expect(xml).toContain("適用範囲");
  });

  // ch1 outsource variant gating (outsourced=true)
  it("shows 委託〔該当〕 heading when outsourced", async () => {
    const xml = await renderAndExtractXml({
      has_outsourced_management: true,
      has_outsource: true,
    });
    // Full heading string to avoid clash with cover page 統括防火管理〔非該当〕
    expect(xml).toContain("防火管理業務の一部委託について〔該当〕");
    expect(xml).not.toContain("防火管理業務の一部委託について〔非該当〕");
  });

  // ch1 outsource variant gating (outsourced=false)
  it("shows 委託〔非該当〕 heading when not outsourced", async () => {
    const xml = await renderAndExtractXml({
      has_outsourced_management: false,
      has_outsource: false,
    });
    expect(xml).toContain("防火管理業務の一部委託について〔非該当〕");
    expect(xml).not.toContain("防火管理業務の一部委託について〔該当〕");
  });

  // K2: outsourced=false → 別表1 appendix page skipped
  it("excludes 別表1 appendix page when not outsourced", async () => {
    const xml = await renderAndExtractXml({
      has_outsourced_management: false,
      has_outsource: false,
    });
    expect(xml).not.toContain("別表１\u3000防火管理業務の一部委託状況表");
  });
});
