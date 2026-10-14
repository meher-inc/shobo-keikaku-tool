import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildNiigataFull } from "../adapters/niigata-full";

/**
 * 新潟市消防局（その他用途・中規模）v2 スモークテスト。
 * 出典: 新潟市「消防計画作成例（その他の用途・中規模）keikaku-sonota」
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "新潟テストビル",
    prefecture: "新潟県",
    city: "新潟市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };
  const buf = await buildNiigataFull(form);
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

describe("niigata その他・中規模 v2 smoke tests", () => {
  it("contains representative articles 第1条〜第11条 in order", async () => {
    const { xml } = await renderAndUnzip();
    const markers = [
      "（目的）",
      "（適用範囲）",
      "（予防管理組織）",
      "（震災対策）",
      "（防火管理業務の一部委託）",
    ];
    let lastIdx = -1;
    for (const t of markers) {
      const idx = xml.indexOf(t);
      expect(idx, `missing: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it("emits verbatim body (第1条目的)", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain(
      "この計画は、消防法第8条第1項の規定に基づき"
    );
  });

  it("cover subtitle is 【中規模用】", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【中規模用】");
  });

  it("plan=standard emits 別表/別紙; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表・別紙一覧");
    expect(std).toContain("別紙１　自主検査票（その１）「火気・電気関係」");
    expect(std).toContain("別表　防火管理業務の委託状況");
    // 一覧(1) + 別紙1,2(2) + 別表(1) = 4 tables
    expect(stdTbl).toBe(5);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表・別紙一覧");
    expect(lightTbl).toBe(1);
  });
});
