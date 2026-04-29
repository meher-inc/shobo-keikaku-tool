import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { runV2Adapter } from "../adapters/generate-plan";

/**
 * Phase 2C Step 3-5 (G3): runV2Adapter dispatcher 分岐の単体テスト。
 *
 * pack 文字列 → builder 関数選択を検証する軽量テスト。各 pack に
 * 対し、その builder 固有の dept-distinctive marker が docx に
 * 出現することで dispatch が正しく動作していることを保証。
 *
 * 既存の各 dept smoke test (kyoto / tokyo / osaka / yokohama) と
 * 補完関係: smoke は各 builder の挙動を、本テストは dispatcher の
 * pack→builder マッピングを検証。
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function dispatch(pack: "full" | "tokyo-full" | "osaka-full" | "yokohama-full") {
  const buf = await runV2Adapter(
    { building_name: "テスト株式会社", company_name: "テスト株式会社" },
    { pack }
  );
  expect(Buffer.isBuffer(buf)).toBe(true);
  expect(buf.subarray(0, 4).equals(ZIP_MAGIC)).toBe(true);
  const zip = await JSZip.loadAsync(buf);
  return zip.file("word/document.xml")!.async("string");
}

describe("runV2Adapter dispatcher branches", () => {
  it("pack=full → kyoto builder (kyoto-distinctive 第１ 目的及びその適用範囲等)", async () => {
    const xml = await dispatch("full");
    expect(xml).toContain("第１　目的及びその適用範囲等");
  });

  it("pack=tokyo-full → tokyo builder (tokyo-distinctive 第１ 目的及び適用範囲等)", async () => {
    const xml = await dispatch("tokyo-full");
    expect(xml).toContain("第１　目的及び適用範囲等");
    // Tokyo 帰宅困難者対策章 (tokyo-only)
    expect(xml).toContain("帰宅困難者対策");
  });

  it("pack=osaka-full → osaka builder (osaka-distinctive 第６ 南海トラフ章)", async () => {
    const xml = await dispatch("osaka-full");
    // osaka-only chapter title
    expect(xml).toContain("第６　南海トラフ地震対策");
    // osaka cover subtitle
    expect(xml).toContain("【中・小規模事業所・テナント用】");
  });

  it("pack=yokohama-full → yokohama builder (yokohama-distinctive 第１章 + 一般用 cover)", async () => {
    const xml = await dispatch("yokohama-full");
    // yokohama uses 第N章 format vs others' 第N
    expect(xml).toContain("第１章　総則");
    // yokohama cover subtitle
    expect(xml).toContain("【一般用】");
    // yokohama-only 帰宅困難者条文 (different from tokyo's 帰宅困難者対策章)
    expect(xml).toContain("第36条　帰宅困難者発生時の待機場所の確保等");
  });
});
