import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildSagamiharaFull } from "../adapters/sagamihara-full";

/**
 * 相模原市消防局（中規模用）v2 スモークテスト。
 * 出典: 相模原市「中規模用消防計画（作成例）1-3-3」
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "相模原テストビル",
    prefecture: "神奈川県",
    city: "相模原市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };
  const buf = await buildSagamiharaFull(form);
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

describe("sagamihara 中規模 v2 smoke tests", () => {
  it("contains numbered sections 1〜16 in order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "１　目的と適用範囲",
      "３　防火管理者の業務",
      "６　厳守事項",
      "12　自衛消防組織の編成及び任務等",
      "14　震災対策",
      "16　付則",
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

  it("plan=standard emits 別表; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表等一覧");
    expect(std).toContain("別表８　自衛消防隊の編成と任務");
    expect(std).toContain("別表　防火管理業務の委託状況");
    // 一覧(1) + 別表2,3,4,5,8,委託(6) = 7 tables
    expect(stdTbl).toBe(7);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表等一覧");
    expect(lightTbl).toBe(0);
  });

  it("自衛消防 member names land in 別表8 when supplied", async () => {
    const { xml } = await renderAndUnzip({
      plan: "standard",
      leader_name: "相模太郎",
      shoka_member: "橋本花子",
    });
    expect(xml).toContain("相模太郎");
    expect(xml).toContain("橋本花子");
  });
});
