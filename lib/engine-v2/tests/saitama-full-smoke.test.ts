import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildSaitamaFull } from "../adapters/saitama-full";

/**
 * さいたま市消防局（中規模用）v2 スモークテスト。
 *
 * 出典: さいたま市「中規模用消防計画作成例（chukibo-genpon）」
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "さいたまテストビル",
    prefecture: "埼玉県",
    city: "さいたま市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };
  const buf = await buildSaitamaFull(form);
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

describe("saitama 中規模 v2 smoke tests", () => {
  it("contains 第１〜第10 section headings in order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "第１　目的及びその適用範囲等",
      "第２　管理権原者及び防火管理者の業務と権限",
      "第４　火災予防上の点検・検査",
      "第５　厳守事項", // 行頭スペースで漏れやすかった節の回帰確認
      "第８　地震対策",
      "第10　訓練",
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

  it("plan=standard emits 別表1-9 tables; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表等一覧");
    expect(std).toContain("別表１　日常の火災予防の担当者と日常の注意事項");
    expect(std).toContain("別表７　自衛消防隊の編成と任務");
    expect(std).toContain("別表９　防火管理業務の一部委託状況表");
    // 別表等一覧(1) + 別表1〜9(9) = 10 tables
    expect(stdTbl).toBe(11);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表等一覧");
    expect(lightTbl).toBe(1);
  });

  it("自衛消防 member names land in 別表7 when supplied", async () => {
    const { xml } = await renderAndUnzip({
      plan: "standard",
      leader_name: "埼玉太郎",
      shoka_member: "大宮花子",
    });
    expect(xml).toContain("埼玉太郎");
    expect(xml).toContain("大宮花子");
  });
});
