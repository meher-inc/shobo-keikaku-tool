import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildSendaiFull } from "../adapters/sendai-full";

/**
 * 仙台市消防局（大規模用）v2 スモークテスト。
 * 出典: 仙台市「消防計画作成例（大規模用 bouka01）」
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "仙台テストビル",
    prefecture: "宮城県",
    city: "仙台市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };
  const buf = await buildSendaiFull(form);
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

describe("sendai 大規模 v2 smoke tests", () => {
  it("contains section headings in order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "目的及び適用範囲",
      "管理権原者の責任",
      "防火管理者の業務",
      "自衛消防隊の編成",
      "地震対策",
    ];
    let lastIdx = -1;
    for (const t of titles) {
      const idx = xml.indexOf(t);
      expect(idx, `missing: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it("emits verbatim body text (第8条目的)", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain(
      "この計画は、消防法第８条の規定に基づき、管理権原の及ぶ範囲における防火管理についての必要事項を定め"
    );
  });

  it("cover subtitle is 【大規模用】", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【大規模用】");
  });

  it("plan=standard emits 別表/別紙 tables; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表・別紙一覧");
    expect(std).toContain("別表１　自衛消防隊の編成と任務");
    expect(std).toContain("別表２－１　自主検査チェック表（出火防止）");
    expect(std).toContain("別紙　防火管理業務委託状況票");
    // 一覧(1) + 別表1,2-1,2-2,3(4) + 別紙(1) = 6 tables
    expect(stdTbl).toBe(8);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表・別紙一覧");
    expect(lightTbl).toBe(2);
  });

  it("自衛消防 member names land in 別表1 when supplied", async () => {
    const { xml } = await renderAndUnzip({
      plan: "standard",
      leader_name: "仙台太郎",
      shoka_member: "青葉花子",
    });
    expect(xml).toContain("仙台太郎");
    expect(xml).toContain("青葉花子");
  });
});
