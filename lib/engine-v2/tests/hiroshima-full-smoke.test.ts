import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildHiroshimaFull } from "../adapters/hiroshima-full";

/**
 * 広島市消防局（消防計画 様式）v2 スモークテスト。
 * 出典: 広島市「消防計画（様式）shouboukeikaku_word」
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "広島テストビル",
    prefecture: "広島県",
    city: "広島市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };
  const buf = await buildHiroshimaFull(form);
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

describe("hiroshima v2 smoke tests", () => {
  it("contains chapters 第１章〜第８章 in order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "第１章　総則",
      "第２章　予防管理対策",
      "第３章　火災予防措置",
      "第４章　自衛消防活動対策",
      "第５章　震災対策",
      "第８章　防火管理業務の一部委託",
    ];
    let lastIdx = -1;
    for (const t of titles) {
      const idx = xml.indexOf(t);
      expect(idx, `missing: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it("contains 第19条 南海トラフ + 第25条 + 付則", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("第１９条");
    expect(xml).toContain("南海トラフ");
    expect(xml).toContain("第２５条");
    expect(xml).toContain("付　則");
  });

  it("cover subtitle is 【単一権原用】", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【単一権原用】");
  });

  it("plan=standard emits 別表/別紙 tables; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表・別紙一覧");
    expect(std).toContain("自衛消防隊の編成と任務");
    expect(std).toContain("別紙１　消防用設備等・特殊消防用設備等自主点検チェック表");
    // 一覧(1) + 別表(1) + 別紙1〜3(3) = 5 tables
    expect(stdTbl).toBe(7);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表・別紙一覧");
    expect(lightTbl).toBe(2);
  });

  it("自衛消防 member names land in 別表 when supplied", async () => {
    const { xml } = await renderAndUnzip({
      plan: "standard",
      leader_name: "広島太郎",
      hinan_member: "宮島花子",
    });
    expect(xml).toContain("広島太郎");
    expect(xml).toContain("宮島花子");
  });
});
