import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { runV2Adapter, type V2Pack } from "../adapters/generate-plan";
import { buildPlanGuide } from "../adapters/generate-guide";

/**
 * 提出用の消防計画と提出前チェックシートを別ファイルに分けたことの確認。
 * 提出用には案内文・チェックリスト・平面図テンプレートを入れず、提出前チェックシートにだけ入れる。
 */

const FORM = {
  building_name: "テストビル",
  prefecture: "東京都",
  city: "千代田区",
  owner_name: "テスト太郎",
  manager_name: "防火花子",
  use_category: "15",
  total_area: "500",
  num_floors: "3",
  capacity: "50",
  equipment: ["消火器", "自動火災報知設備", "誘導灯"],
  plan: "standard",
};

const PACKS: V2Pack[] = [
  "full", "tokyo-full", "osaka-full", "yokohama-full", "fukuoka-full", "nagoya-full",
  "sapporo-full", "kawasaki-full", "kobe-full", "saitama-full", "sakai-full", "hiroshima-full",
  "sendai-full", "chiba-full", "kitakyushu-full", "niigata-full", "kumamoto-full",
  "sagamihara-full", "shizuoka-full", "okayama-full",
];

const GUIDE_ONLY = [
  "ご入力内容",
  "ご提出前に追記・確認が必要な事項",
  "作成後の提出のしかた",
  "記入用テンプレート",
  "docs.todokede.jp",
];

async function text(buf: Buffer): Promise<string> {
  const xml = await (await JSZip.loadAsync(buf)).file("word/document.xml")!.async("string");
  return xml.replace(/<\/w:p>/g, "\n").replace(/<\/w:tc>/g, "|").replace(/<[^>]+>/g, "").replace(/\n\|/g, "|");
}

describe("提出用の消防計画", () => {
  it.each(PACKS)("%s: 案内用のページを含まず、概要表は「防火対象物の概要」「内容」", async (pack) => {
    for (const plan of ["standard", "light"]) {
      const t = await text(await runV2Adapter({ ...FORM, plan }, { pack }));
      for (const s of GUIDE_ONLY) expect(t, `${pack}/${plan}: ${s}`).not.toContain(s);
      expect(t).toContain("防火対象物の概要\n項目|内容|");
    }
  });

  it("工事中の消防計画も案内用のページを含まない", async () => {
    const t = await text(
      await runV2Adapter({ ...FORM, plan_kind: "construction", construction_type: "内装改修・模様替え" }, { pack: "tokyo-full" })
    );
    for (const s of GUIDE_ONLY) expect(t).not.toContain(s);
    expect(t).not.toContain("工事中の消防計画の届出様式が公表されています");
    expect(t).toContain("防火対象物及び工事の概要\n項目|内容|");
  });
});

describe("提出前チェックシート", () => {
  it("確認事項・提出のしかた・平面図テンプレートを含み、提出不要と明記する", async () => {
    const t = await text(await buildPlanGuide(FORM, "tokyo-full"));
    expect(t).toContain("消防計画 提出前チェックシート");
    expect(t).toContain("この提出前チェックシートは提出しません。");
    expect(t).toContain("ご提出前に追記・確認が必要な事項");
    expect(t).toContain("作成後の提出のしかた");
    expect(t).toContain("各階平面図・避難経路図（記入用テンプレート）");
    expect(t).toContain("対象の階: 1階〜3階");
  });

  it("建物の一部の場合は使用階だけを対象にする", async () => {
    const t = await text(
      await buildPlanGuide({ ...FORM, management_scope_type: "part", used_floors: "1階" }, "tokyo-full")
    );
    expect(t).toContain("対象の階: 1階（使用する階ぶん作成してください）");
  });

  it("工事中の消防計画では工事用の確認事項と所轄の届出の注意を載せる", async () => {
    const t = await text(await buildPlanGuide({ ...FORM, plan_kind: "construction" }, "tokyo-full"));
    expect(t).toContain("ご提出前に追記・確認が必要な事項（工事中の消防計画）");
    expect(t).toContain("工事工程表・工事範囲を示した平面図の添付");
    expect(t).toContain("※　東京消防庁管内");
  });
});
