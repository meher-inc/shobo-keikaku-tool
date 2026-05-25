import { describe, expect, it } from "vitest";
import { generateNationalDocument } from "../../adapters/generate-national";
import { listNationalPacks } from "../registry";
import type { NationalFormData } from "../../types/national-form-pack";

// docx zip files start with "PK\x03\x04" (50 4B 03 04)
function isDocxBuffer(buf: Buffer): boolean {
  return (
    buf.length > 4 &&
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    buf[2] === 0x03 &&
    buf[3] === 0x04
  );
}

function sampleData(packName: string): NationalFormData {
  // Minimal but non-empty form payload — exercises text, radio, date,
  // checkbox-group placeholders. Per-pack key sets differ so we provide
  // a broad superset; unused keys are ignored by the renderer.
  return {
    kind: "防火",
    operationType: "選任",
    submitDate: "2026-05-25",
    municipality: "京都市",
    fireDeptName: "中京",
    fireAuthorityName: "東京消防庁",
    submitterAddress: "京都市中京区テスト町1-2-3",
    submitterName: `テスト株式会社 代表取締役 山田 太郎 (${packName})`,
    submitterPhone: "075-000-0000",
    authorityName: "テスト株式会社 代表取締役 山田 太郎",
    buildingAddress: "京都市中京区テスト町1-2-3",
    buildingPhone: "075-111-1111",
    buildingName: "テストビル",
    buildingUse: "事務所",
    buildingCategory: "（15）項",
    capacity: "120人",
    managementAuthority: "単一権原",
    managerKind: "甲種",
    managerName: "防火 太郎",
    managerNameKana: "ボウカ タロウ",
    managerAddress: "京都市中京区テスト町1-2-3",
    appointmentDate: "2026-05-01",
    positionTitle: "総務部長",
    qualificationKind: ["防火管理（甲種）新規講習"],
    qualificationInstitution: "日本防火・防災協会",
    qualificationCompletionDate: "2025-12-10",
    structure: ["耐火"],
    floorsAbove: "5",
    floorsBelow: "1",
    buildingArea: "200",
    totalArea: "1000",
    useStartDate: "2026-06-01",
    constructionStartDate: "2026-06-01",
    plannedUseStartDate: "2026-07-01",
    constructionLocation: "テストビル 1階",
    equipmentKind: "自動火災報知設備",
    constructorAddress: "東京都千代田区テスト1-1",
    constructorName: "テスト工業株式会社",
    officerLicenseKind: "甲種",
    officerLicenseClass: "第4類",
    officerLicensePrefecture: "京都府",
    officerLicenseDate: "2020-04-01",
    officerLicenseNumber: "甲4-12345",
    workKind: "新設",
    workStartDate: "2026-06-10",
    workCompletionDate: "2026-07-30",
    installerAddress: "東京都千代田区テスト1-1",
    installerPhone: "03-1111-2222",
    installerName: "テスト株式会社 代表取締役",
    structureKind: "耐火造",
    officerAddress: "東京都千代田区テスト1-1",
    officerName: "設備 一郎",
    completionDate: "2026-07-30",
    internalStructure: "本部隊・地区隊3班体制",
    personnelPlacement: "各階1名以上配置",
    chiefName: "統括 一郎",
    chiefAddress: "東京都港区テスト1-1",
    equipment: "拡声器、ヘルメット、誘導棒",
    totalAreaAndFloors: "延べ8,000㎡／地上10階・地下2階",
  };
}

describe("renderNationalDocx", () => {
  it("produces a valid .docx Buffer for every registered pack", async () => {
    const packs = listNationalPacks();
    expect(packs.length).toBeGreaterThan(0);

    for (const pack of packs) {
      const buf = await generateNationalDocument(pack.packName, sampleData(pack.packName));
      expect(buf, `pack=${pack.packName} returned non-Buffer`).toBeInstanceOf(Buffer);
      expect(buf.length, `pack=${pack.packName} buffer empty`).toBeGreaterThan(2000);
      expect(isDocxBuffer(buf), `pack=${pack.packName} not docx magic`).toBe(true);
    }
  });

  it("throws UnknownNationalPackError for unknown pack name", async () => {
    await expect(
      generateNationalDocument("does-not-exist", {})
    ).rejects.toThrow(/Unknown national pack/);
  });
});
