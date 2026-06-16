import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildShizuokaFull } from "../adapters/shizuoka-full";

/**
 * 静岡市消防局（単一権原・作成例2）v2 スモークテスト。
 * 出典: 静岡市「消防計画（作成例2 単一権原）shouboukeikaku2」
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "静岡テストビル",
    prefecture: "静岡県",
    city: "静岡市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };
  const buf = await buildShizuokaFull(form);
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

describe("shizuoka 単一権原 v2 smoke tests", () => {
  it("contains representative articles in order", async () => {
    const { xml } = await renderAndUnzip();
    const markers = [
      "（目的）",
      "（消防計画の適用範囲）",
      "（防災教育等）",
      "（訓練）",
      "（訓練の実施報告）",
    ];
    let lastIdx = -1;
    for (const t of markers) {
      const idx = xml.indexOf(t);
      expect(idx, `missing: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it("emits verbatim body (第1条目的, 大規模地震対策特別措置法)", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("消防法第８条第１項及び大規模地震対策特別措置法第８条に基づき");
  });

  it("cover subtitle is 【単一権原用】", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【単一権原用】");
  });

  it("plan=standard emits 別表/別紙; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表・別紙一覧");
    expect(std).toContain("別表１　自主点検表");
    expect(std).toContain("別表３　自衛消防組織編成表");
    // 一覧(1) + 別表1,2,3,4(4) + 別紙(1) = 6 tables
    expect(stdTbl).toBe(6);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表・別紙一覧");
    expect(lightTbl).toBe(0);
  });

  it("自衛消防 member names land in 別表3 when supplied", async () => {
    const { xml } = await renderAndUnzip({
      plan: "standard",
      leader_name: "静岡太郎",
      shoka_member: "駿河花子",
    });
    expect(xml).toContain("静岡太郎");
    expect(xml).toContain("駿河花子");
  });
});
