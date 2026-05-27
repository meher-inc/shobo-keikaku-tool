import { describe, expect, it } from "vitest";
import { generateNationalDocument } from "../../adapters/generate-national";
import { hasOfficialTemplate } from "../render-docxtemplater";
import { listNationalPacks } from "../registry";

const PACKS_WITH_TEMPLATE = [
  "building-use-start",
  "hazmat-facility-permit",
  "hazmat-facility-change-permit",
  "hazmat-temporary-use",
  "hazmat-transfer",
  "hazmat-name-quantity-change",
  "hazmat-facility-abolition",
  "hazmat-comprehensive-safety-supervisor",
  "hazmat-safety-supervisor",
  "hazmat-prevention-rules-approval",
  "minor-hazmat-notification",
  "hazmat-temporary-storage",
];

function isDocxBuffer(buf: Buffer): boolean {
  return (
    buf.length > 4 &&
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    buf[2] === 0x03 &&
    buf[3] === 0x04
  );
}

describe("generateNationalDocument auto-routing", () => {
  it("uses official template path when template exists", async () => {
    for (const pack of PACKS_WITH_TEMPLATE) {
      expect(hasOfficialTemplate(pack), `template missing for ${pack}`).toBe(true);
      const buf = await generateNationalDocument(pack, {
        submitDate: "令和8年5月26日",
        municipality: "京都市",
        recipientTitle: "消防署長",
      });
      expect(isDocxBuffer(buf), `${pack} not valid docx`).toBe(true);
    }
  });

  it("falls back to legacy renderer when no official template", async () => {
    const packs = listNationalPacks();
    const legacyOnly = packs.filter((p) => !hasOfficialTemplate(p.packName));
    expect(legacyOnly.length).toBeGreaterThan(0);
    // Just verify one legacy pack renders without throwing
    const sample = {
      submitDate: "2026-05-26",
      municipality: "京都市",
      submitterAddress: "京都市中京区",
      submitterPhone: "075-000-0000",
      submitterName: "テスト株式会社",
      managerName: "山田 太郎",
      managerAddress: "京都市中京区",
      managerNameKana: "ヤマダ タロウ",
      buildingAddress: "京都市中京区",
      buildingName: "テストビル",
      buildingUse: "事務所",
      buildingPhone: "075-111-1111",
      appointmentDate: "2026-05-01",
      kind: "防火",
      operationType: "選任",
      managerKind: "甲種",
    };
    const buf = await generateNationalDocument(legacyOnly[0].packName, sample);
    expect(isDocxBuffer(buf)).toBe(true);
  });
});
