import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { runV2Adapter } from "../adapters/generate-plan";

/**
 * Step 4a smoke test for the kyoto-city full pack.
 *
 * Renders the pack via the same adapter path the production route
 * uses (?engine=v2&pack=full), unzips the resulting docx, and
 * asserts the presence of fixed literal strings in document.xml.
 * We are not chasing v1 byte-level parity here — only that the
 * chapter 1/2/3 headings exist, placeholder substitution ran, and
 * the eraDate computed fn produced a 和暦 string.
 */
describe("kyoto-city full pack smoke test", () => {
  it("produces a docx with ch1/ch2/ch3 headings, buildingName substitution, and an era-date string", async () => {
    const buf = await runV2Adapter(
      {
        building_name: "テストビル",
        // Pin creationDateIso so the era output is deterministic.
        creation_date_iso: "2026-04-11",
      },
      { pack: "full" }
    );

    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);

    const zip = await JSZip.loadAsync(buf);
    const file = zip.file("word/document.xml");
    if (!file) throw new Error("word/document.xml missing from rendered docx");
    const documentXml = await file.async("string");

    // Chapter headings — exact literal strings from v1 generate_kyoto_full.js.
    expect(documentXml).toContain("第１　目的及びその適用範囲等");
    expect(documentXml).toContain("第２　管理権原者及び防火管理者の業務と権限");
    expect(documentXml).toContain("第３　消防機関との連絡等");

    // Placeholder substitution in chapter 1.
    expect(documentXml).toContain("テストビル");

    // eraDate(creationDateIso=2026-04-11) → "令和8年4月11日" in ja-JP-u-ca-japanese.
    // We only assert the stable "令和" prefix so timezone wiggle
    // around a midnight boundary can't flake the test.
    expect(documentXml).toContain("令和");
  });
});
