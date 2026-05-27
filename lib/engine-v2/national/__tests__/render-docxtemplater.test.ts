import { describe, expect, it } from "vitest";
import {
  hasOfficialTemplate,
  renderWithOfficialTemplate,
} from "../render-docxtemplater";

const EXPECTED_PACKS = [
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

// docx zip files start with PK\x03\x04
function isDocxBuffer(buf: Buffer): boolean {
  return (
    buf.length > 4 &&
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    buf[2] === 0x03 &&
    buf[3] === 0x04
  );
}

describe("hasOfficialTemplate", () => {
  it("returns true for all 12 expected packs", () => {
    for (const pack of EXPECTED_PACKS) {
      expect(hasOfficialTemplate(pack), `pack ${pack} missing`).toBe(true);
    }
  });

  it("returns false for unknown pack", () => {
    expect(hasOfficialTemplate("does-not-exist")).toBe(false);
  });
});

describe("renderWithOfficialTemplate", () => {
  // 共通のサンプルデータ (全 pack で使われうるキーを網羅、未使用キーは無視される)
  const sample = {
    submitDate: "令和8年5月26日",
    municipality: "京都市",
    recipientTitle: "消防署長",
    submitterAddress: "京都市中京区テスト1-2-3",
    submitterName: "テスト株式会社 代表取締役 山田 太郎",
    submitterPhone: "075-000-0000",
    ownerAddress: "京都市中京区テスト1-2-3",
    ownerName: "同上",
    ownerPhone: "075-000-0000",
    buildingAddress: "京都市中京区テスト1-2-3",
    buildingPhone: "075-111-1111",
    buildingName: "テストビル",
    mainUse: "事務所",
    siteArea: "1000",
    buildingArea: "500",
    totalArea: "2500",
    employeeCount: "100",
    businessHours: "9:00〜18:00",
    fireEquipment: "屋外消火栓1基",
    remarks: "サンプル",
    constructionStartDate: "令和8年6月1日",
    constructionCompleteDate: "令和8年12月1日",
    constructionEndDate: "令和9年1月1日",
    buildingConfirmationDate: "令和8年5月1日",
    buildingConfirmationNumber: "確認1号",
    fireConsentDate: "令和8年5月10日",
    fireConsentNumber: "同意1号",
    otherPermits: "なし",
    facilityLocation: "テスト施設",
    facilityKind: "屋内貯蔵所",
    facilityCategory: "一般取扱所",
    hazmatClassAndName: "第4類 第1石油類",
    designatedQuantityMultiple: "5倍",
    permitDate: "令和7年1月1日",
    permitNumber: "1",
  } as Record<string, string>;

  for (const pack of EXPECTED_PACKS) {
    it(`renders ${pack} as a valid docx Buffer`, async () => {
      const buf = await renderWithOfficialTemplate(pack, sample);
      expect(buf).toBeInstanceOf(Buffer);
      expect(buf.length).toBeGreaterThan(2000);
      expect(isDocxBuffer(buf)).toBe(true);
    });
  }
});
