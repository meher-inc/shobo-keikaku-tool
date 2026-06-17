import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildOkayamaFull } from "../adapters/okayama-full";

/**
 * 岡山市消防局（中規模用）v2 スモークテスト。
 *
 * 出典: 岡山市「消防計画書（中規模用）」
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "岡山テストビル",
    prefecture: "岡山県",
    city: "岡山市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };
  const buf = await buildOkayamaFull(form);
  expect(Buffer.isBuffer(buf)).toBe(true);
  expect(buf.length).toBeGreaterThan(5_000);
  expect(buf.subarray(0, 4).equals(ZIP_MAGIC)).toBe(true);
  const zip = await JSZip.loadAsync(buf);
  const file = zip.file("word/document.xml");
  if (!file) throw new Error("word/document.xml missing");
  const xml = await file.async("string");
  const tblCount = (xml.match(/<w:tbl[^A-Za-z]/g) || []).length;
  return { buf, xml, tblCount };
}

describe("okayama 中規模 v2 smoke tests", () => {
  it("contains chapter titles in order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "１　防火管理体制の組織及び防火管理業務の分担",
      "２　自衛消防隊の設置及び組織",
      "３　受信機の監視及び各消防用設備等の担当者",
      "４　通報連絡方法",
      "５　消火活動要領",
      "６　避難計画及び避難誘導",
      "７　避難・通報・消火訓練の計画及び実施",
      "８　避難通路の確保及び火災予防上の危険物品の除去等",
      "９　夜間・休日の防火管理体制",
      "10　工事中の防火管理",
      "11　ガス漏れ事故対策",
      "12　法定の点検計画",
      "13　危険物施設における遵守事項",
      "14　火気管理",
      "15　震災対策措置",
      "16　防災教育",
      "17　防火管理台帳の作成上の遵守事項",
      "18　社（店）内防火規則作成上の遵守事項",
      "19　管理権原の明確化",
    ];
    let lastIdx = -1;
    for (const t of titles) {
      const idx = xml.indexOf(t);
      expect(idx, `missing: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it("cover subtitle is 【中規模用】", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【中規模用】");
  });

  it("plan=standard emits 別表1-4 tables; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表等一覧");
    expect(std).toContain("別表２");
    expect(std).toContain("別表４");
    // 別表等一覧(1) + 別表1〜4(4) = 5 tables
    expect(stdTbl).toBe(5);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表等一覧");
    expect(lightTbl).toBe(0);
  });

  it("自衛消防 member names land in 別表2 when supplied", async () => {
    const { xml } = await renderAndUnzip({
      plan: "standard",
      leader_name: "岡山太郎",
      shoka_member: "岡山花子",
    });
    expect(xml).toContain("岡山太郎");
    expect(xml).toContain("岡山花子");
  });
});
