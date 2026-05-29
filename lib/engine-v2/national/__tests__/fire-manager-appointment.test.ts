import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import PizZip from "pizzip";
import {
  hasOfficialTemplate,
  renderWithOfficialTemplate,
} from "../render-docxtemplater";
import { generateNationalDocument } from "../../adapters/generate-national";

/**
 * fire-manager-appointment（防火・防災管理者選任（解任）届出書）— 品質3条件テスト。
 *
 * §5 仕様:
 *   1. 空欄ゼロ確認: 全フィールド入力で生成し、未差し込み {{var}} が残らない
 *   2. 書式崩れゼロ確認: 出力 docx の先頭4バイトが ZIP シグネチャ (PK\x03\x04)
 *   3. 破損ゼロ確認: 例外なく Buffer が返り、サイズが 5,000 bytes 以上
 *
 * 空欄ゼロの構造的検証は zero-blanks.test.ts が EXPECTED_PACKS でカバー済み。
 * 本ファイルは fire-manager-appointment 固有の END-TO-END (adapter 経路を含む) 確認を行う。
 */

const PACK_NAME = "fire-manager-appointment";

const fullSample: Record<string, string> = {
  submitDate: "令和8年5月29日",
  municipality: "京都市",
  fireDeptName: "中京",
  kind: "防火",
  operationType: "選任",

  submitterAddress: "京都市中京区テスト1-2-3",
  submitterName: "テスト株式会社 代表取締役 山田 太郎",
  submitterPhone: "075-000-0000",

  buildingAddress: "京都市中京区テスト1-2-3",
  buildingPhone: "075-111-1111",
  buildingName: "テストビル",
  managementAuthority: "単一権原",
  multipleAuthorityPart: "（該当なし）",
  mainUse: "事務所",
  buildingCategory: "（15）項",
  capacity: "120人",
  managerKind: "甲種",

  rule2Building1Name: "（該当なし）",
  rule2Building1Category: "—",
  rule2Building1Capacity: "—",
  rule2Building2Name: "（該当なし）",
  rule2Building2Category: "—",
  rule2Building2Capacity: "—",
  rule3p3Part1Name: "（該当なし）",
  rule3p3Part1Category: "—",
  rule3p3Part1Capacity: "—",
  rule3p3Part2Name: "（該当なし）",
  rule3p3Part2Category: "—",
  rule3p3Part2Capacity: "—",

  managerName: "管理 太郎",
  managerNameKana: "カンリ タロウ",
  managerAddress: "京都市中京区テスト1-2-3",
  appointmentDate: "令和8年5月20日",
  positionTitle: "総務部長",
  qualificationKind: "防火管理（甲種）新規講習",
  qualificationInstitution: "（一財）京都市防災協会",
  qualificationCompletionDate: "令和8年4月15日",
  otherQualification: "—",

  dismissedManagerName: "（該当なし）",
  dismissalDate: "—",
  dismissalReason: "（該当なし）",

  remarks: "資格を証する書面を別添。",
};

function isDocxBuffer(buf: Buffer): boolean {
  return (
    buf.length > 4 &&
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    buf[2] === 0x03 &&
    buf[3] === 0x04
  );
}

describe("fire-manager-appointment quality conditions", () => {
  it("公式テンプレが templates-official に配置されている", () => {
    expect(hasOfficialTemplate(PACK_NAME)).toBe(true);
  });

  it("テスト1: 空欄ゼロ — 全フィールド入力で未差し込み {{var}} が残らない", async () => {
    const buf = await renderWithOfficialTemplate(PACK_NAME, fullSample);
    const xml = new PizZip(buf).file("word/document.xml")!.asText();
    // <w:t> 分割を考慮して全テキスト連結後に検出（docxtemplater の挙動準拠）
    const textRe = /<w:t\b[^>]*>([^<]*)<\/w:t>/g;
    const joined: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = textRe.exec(xml)) !== null) joined.push(m[1]);
    const all = joined.join("");
    const unfilled = all.match(/\{\{[A-Za-z_][A-Za-z0-9_]*\}\}/g) ?? [];
    expect(unfilled, `${unfilled.length} unfilled placeholders: ${unfilled.join(", ")}`).toEqual([]);
  });

  it("テスト2: 書式崩れゼロ — 先頭4バイトが ZIP シグネチャ (PK\\x03\\x04)", async () => {
    const buf = await renderWithOfficialTemplate(PACK_NAME, fullSample);
    expect(isDocxBuffer(buf)).toBe(true);
  });

  it("テスト3: 破損ゼロ — 例外なく Buffer 返却、5,000 bytes 以上", async () => {
    const buf = await renderWithOfficialTemplate(PACK_NAME, fullSample);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThanOrEqual(5000);
  });

  it("テスト4: フォールバック — 全フィールド空でも例外を投げない", async () => {
    const buf = await renderWithOfficialTemplate(PACK_NAME, {});
    expect(isDocxBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(2000);
  });

  it("テスト5: adapter 経路 — generateNationalDocument 経由でも docx Buffer が返る", async () => {
    const buf = await generateNationalDocument(PACK_NAME, fullSample);
    expect(isDocxBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThanOrEqual(5000);
  });
});

/**
 * 配置場所確認 — 公式テンプレが期待されるパスに存在する（再生成後の取り違え防止）。
 */
describe("fire-manager-appointment placement", () => {
  it("docx が lib/engine-v2/national/templates-official/ に存在する", () => {
    const expected = path.join(
      process.cwd(),
      "lib/engine-v2/national/templates-official",
      `${PACK_NAME}.docx`
    );
    expect(fs.existsSync(expected)).toBe(true);
  });
});
