import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildSapporoFull } from "../adapters/sapporo-full";

/**
 * 札幌市消防局（中規模用）v2 スモークテスト。
 *
 * buildSapporoFull を end-to-end で駆動し、章順序・カバー副題・
 * 別表（plan ゲーティング）・第３ 一部委託節（has_outsourced_management
 * ゲーティング）を構造的に検証する。
 *
 * 出典: 札幌市「消防計画作成（変更）届出」本文様式（中規模用）
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "札幌テストビル",
    prefecture: "北海道",
    city: "札幌市",
    creation_date_iso: "2026-06-16",
    ...formOverrides,
  };

  const buf = await buildSapporoFull(form);
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

describe("sapporo 中規模 v2 smoke tests", () => {
  it("contains representative chapter titles in 第１〜附則 order", async () => {
    const { xml } = await renderAndUnzip({ has_outsourced_management: true });
    const titles = [
      "第１　目的",
      "第２　適用範囲",
      "第３　防火管理業務の一部委託（該当する場合のみ）",
      "第４　管理権原者及び防火管理者の業務",
      "第５　消防機関との連絡",
      "第10　工事中の安全対策",
      "第12　自衛消防隊",
      "第15　震災対策",
      "第17　防火・防災教育、自衛消防訓練等",
      "附則",
    ];
    let lastIdx = -1;
    for (const t of titles) {
      const idx = xml.indexOf(t);
      expect(idx, `missing chapter title: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  it("cover subtitle is 【中規模用】", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【中規模用】");
  });

  it("emits verbatim body text from the official template", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain(
      "この計画は、消防法第８条第１項に基づき、防火対象物の防火管理について必要事項を定め"
    );
  });

  it("第３ 一部委託節 emits only when has_outsourced_management is true", async () => {
    const { xml: withOutsource } = await renderAndUnzip({
      has_outsourced_management: true,
    });
    expect(withOutsource).toContain("第３　防火管理業務の一部委託（該当する場合のみ）");

    const { xml: withoutOutsource } = await renderAndUnzip();
    expect(withoutOutsource).not.toContain("第３　防火管理業務の一部委託（該当する場合のみ）");
    // 番号ギャップは許容 — 第２ の次に第４ が来る。
    expect(withoutOutsource).toContain("第４　管理権原者及び防火管理者の業務");
  });

  it("plan=standard emits 別表1-3 tables; plan=light suppresses them", async () => {
    const { xml: std, tblCount: stdTbl } = await renderAndUnzip({ plan: "standard" });
    expect(std).toContain("別表等一覧");
    expect(std).toContain("別表１　自主検査チェック表");
    expect(std).toContain("別表２　自衛消防隊の編成");
    expect(std).toContain("別表３　休日、夜間の自衛消防隊編成表");
    // 別表等一覧(1) + 別表1(1) + 別表2(1) + 別表3(1) = 4 tables
    expect(stdTbl).toBe(5);

    const { xml: light, tblCount: lightTbl } = await renderAndUnzip({ plan: "light" });
    expect(light).not.toContain("別表等一覧");
    expect(light).not.toContain("別表１　自主検査チェック表");
    expect(lightTbl).toBe(1);
  });

  it("自衛消防隊 member names land in 別表2 when supplied", async () => {
    const { xml } = await renderAndUnzip({
      plan: "standard",
      leader_name: "山田太郎",
      tsuhou_member: "佐藤花子",
    });
    expect(xml).toContain("山田太郎");
    expect(xml).toContain("佐藤花子");
  });
});
