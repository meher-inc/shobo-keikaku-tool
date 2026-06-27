import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildSakaiFull } from "../adapters/sakai-full";

/**
 * 堺市消防局（中規模用）v2 スモークテスト。
 *
 * 出典: 堺市「消防計画（中規模事業所用）keikaku3」
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "堺テストビル",
    prefecture: "大阪府",
    city: "堺市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };
  const buf = await buildSakaiFull(form);
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

describe("sakai 中規模 v2 smoke tests", () => {
  it("contains chapter titles in order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "総則",
      "予防管理対策",
      "自衛消防活動",
      "震災対策",
      "防災教育及び訓練等",
      "共同防火管理について",
      "防火管理業務の一部委託について",
      "附則",
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

  it("plan=standard emits 別表1-12 tables; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表等一覧");
    expect(std).toContain("別表７");
    expect(std).toContain("別表１２");
    // 別表等一覧(1) + 別表1〜12(12) = 13 tables
    expect(stdTbl).toBe(14);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表等一覧");
    expect(lightTbl).toBe(1);
  });

  it("自衛消防 member names land in 別表7 when supplied", async () => {
    const { xml } = await renderAndUnzip({
      plan: "standard",
      leader_name: "堺太郎",
      shoka_member: "堺花子",
    });
    expect(xml).toContain("堺太郎");
    expect(xml).toContain("堺花子");
  });
});
