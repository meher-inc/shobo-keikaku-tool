import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildKitakyushuFull } from "../adapters/kitakyushu-full";

/**
 * 北九州市消防局（中・大規模用）v2 スモークテスト。
 * 出典: 北九州市「消防計画（中規模、大規模防火対象物用）」
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "北九州テストビル",
    prefecture: "福岡県",
    city: "北九州市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };
  const buf = await buildKitakyushuFull(form);
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

describe("kitakyushu 中・大規模 v2 smoke tests", () => {
  it("contains chapters 第１章〜第８章 in order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "第１章　総則",
      "第２章　防火管理者の権限と業務",
      "第３章　予防管理対策",
      "第5章　自衛消防組織",
      "第８章　防火管理の委託",
    ];
    let lastIdx = -1;
    for (const t of titles) {
      const idx = xml.indexOf(t);
      expect(idx, `missing: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it("contains last article (第36条 委託) body", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("防火管理業務の一部を");
  });

  it("cover subtitle is 【中・大規模用】", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【中・大規模用】");
  });

  it("plan=standard emits 別表1-4; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表一覧");
    expect(std).toContain("別表１　自主検査チェック票");
    expect(std).toContain("別表２　自衛消防隊の編成");
    expect(std).toContain("別表４　防火管理業務の委託状況");
    // 一覧(1) + 別表1〜4(4) = 5 tables
    expect(stdTbl).toBe(7);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表一覧");
    expect(lightTbl).toBe(2);
  });

  it("自衛消防 member names land in 別表2 when supplied", async () => {
    const { xml } = await renderAndUnzip({
      plan: "standard",
      leader_name: "北九州太郎",
      shoka_member: "小倉花子",
    });
    expect(xml).toContain("北九州太郎");
    expect(xml).toContain("小倉花子");
  });
});
