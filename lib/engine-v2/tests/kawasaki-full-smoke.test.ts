import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildKawasakiFull } from "../adapters/kawasaki-full";

/**
 * 川崎市消防局（防火・単一権原用 甲種）v2 スモークテスト。
 *
 * buildKawasakiFull を end-to-end で駆動し、条見出し（第N条）順序・
 * カバー副題・逐語本文・別表（plan ゲーティング）を構造的に検証する。
 *
 * 出典: 川崎市「消防計画作成（変更）届出書」作成例 No.1（防火・単一権原用 甲種）
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "川崎テストビル",
    prefecture: "神奈川県",
    city: "川崎市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };

  const buf = await buildKawasakiFull(form);
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

describe("kawasaki 甲種 v2 smoke tests", () => {
  it("contains representative articles 第１条〜附則 in order", async () => {
    const { xml } = await renderAndUnzip();
    const markers = [
      "（目的）",
      "（適用範囲）",
      "（防火管理者）",
      "（放火防止対策）", // 第27条 — 行頭スペースで落ちやすかった回帰確認
      "（自衛消防の組織の編成等）",
      "（消防機関への通報）",
      "附　則",
    ];
    let lastIdx = -1;
    for (const t of markers) {
      const idx = xml.indexOf(t);
      expect(idx, `missing: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it("includes 第27条 body (regression: leading-space article)", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("第２７条");
    expect(xml).toContain("放火防止対策に努めるものとする");
  });

  it("cover subtitle is 【防火・単一権原用（甲種）】", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【防火・単一権原用（甲種）】");
  });

  it("emits verbatim body text from the official template (第1条目的)", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("この計画は、消防法（以下「法」という。）第８条第１項に基づき");
  });

  it("plan=standard emits 別表1-7 tables; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表等一覧");
    expect(std).toContain("別表１　防火管理委員会の構成");
    expect(std).toContain("別表６　自衛消防の組織");
    expect(std).toContain("別表７　自衛消防の任務分担");
    // 別表等一覧(1) + 別表1〜7(7) = 8 tables
    expect(stdTbl).toBe(9);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表等一覧");
    expect(light).not.toContain("別表１　防火管理委員会の構成");
    expect(lightTbl).toBe(1);
  });

  it("自衛消防 member names land in 別表6 when supplied", async () => {
    const { xml } = await renderAndUnzip({
      plan: "standard",
      leader_name: "川崎太郎",
      shoka_member: "鈴木一郎",
    });
    expect(xml).toContain("川崎太郎");
    expect(xml).toContain("鈴木一郎");
  });
});
