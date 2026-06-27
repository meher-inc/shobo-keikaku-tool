import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildKobeFull } from "../adapters/kobe-full";

/**
 * 神戸市消防局（オフィスビル用・防火防災）v2 スモークテスト。
 *
 * buildKobeFull を end-to-end で駆動し、章（第N章）・条（第N条）順序・
 * カバー副題・逐語本文・別表（plan ゲーティング）を構造的に検証する。
 *
 * 出典: 神戸市「消防計画作成例（オフィスビル用 4-コ）」
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "神戸テストビル",
    prefecture: "兵庫県",
    city: "神戸市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };

  const buf = await buildKobeFull(form);
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

describe("kobe オフィスビル用 v2 smoke tests", () => {
  it("contains all 4 chapter titles in order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "第１章　総則",
      "第２章　予防的事項",
      "第３章　応急対策的事項",
      "第４章　教育訓練",
    ];
    let lastIdx = -1;
    for (const t of titles) {
      const idx = xml.indexOf(t);
      expect(idx, `missing: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it("contains representative 節 and 条 markers", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("第１節　計画の目的等");
    expect(xml).toContain("（目的）");
    expect(xml).toContain("第１条");
    expect(xml).toContain("第77条"); // 末尾の条まで欠落なく出ること
    expect(xml).toContain("付　則");
  });

  it("cover subtitle is 【オフィスビル用】", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【オフィスビル用】");
  });

  it("emits verbatim body text (第1条目的) including 防火・防災", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain(
      "この計画は、消防法（以下「法」という。）第８条第１項及び第36条第１項"
    );
  });

  it("plan=standard emits 別表1-8 tables; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表等一覧");
    expect(std).toContain("別表１　被害想定");
    expect(std).toContain("別表６　自衛消防組織の編成");
    expect(std).toContain("別表８　関係機関への通報連絡先");
    // 別表等一覧(1) + 別表1〜8(8) = 9 tables
    expect(stdTbl).toBe(10);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表等一覧");
    expect(light).not.toContain("別表１　被害想定");
    expect(lightTbl).toBe(1);
  });

  it("自衛消防 member names land in 別表6 when supplied", async () => {
    const { xml } = await renderAndUnzip({
      plan: "standard",
      leader_name: "神戸太郎",
      hinan_member: "山本花子",
    });
    expect(xml).toContain("神戸太郎");
    expect(xml).toContain("山本花子");
  });
});
