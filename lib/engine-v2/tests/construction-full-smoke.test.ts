import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { runV2Adapter, type V2Pack } from "../adapters/generate-plan";
import { buildConstructionFull } from "../adapters/construction-full";

/**
 * 工事中の消防計画（工事中の防火対象物用）のスモークテスト。
 *
 * 既存の <city>-full-smoke.test.ts と同じパターン:
 * build → unzip → document.xml の文字列アサーション。
 */

const BASE_FORM = {
  plan_kind: "construction",
  building_name: "テスト工事ビル",
  prefecture: "東京都",
  city: "新宿区",
  address_detail: "テスト町1-2-3",
  use_category: "15項 事務所等",
  total_area: "1200",
  num_floors: "5",
  capacity: "80",
  owner_name: "工事権原者",
  manager_name: "防火管理花子",
  manager_qual: "甲種",
  manager_tel: "03-1111-2222",
  equipment: ["消火器", "自動火災報知設備"],
  emergency_name: "緊急太郎",
  emergency_tel: "090-0000-0000",
  evacuation_site: "テスト中央公園",
  assembly_point: "ビル前広場",
  leader_name: "隊長一郎",
  construction_name: "テストビル2階内装改修工事",
  construction_type: "内装改修・模様替え",
  construction_scope: "2階 事務室部分",
  construction_start: "令和8年8月1日",
  construction_end: "令和8年9月30日",
  contractor_name: "テスト建設株式会社",
  contractor_tel: "03-9999-8888",
  construction_site_manager: "現場代理人 次郎",
  hot_work: true,
  hazmat_use: true,
  equipment_shutdown: "自動火災報知設備（2階感知器）を8月中停止",
  occupied_during_construction: true,
  creation_date_iso: "2026-07-07",
};

async function extractXml(buf: Buffer): Promise<string> {
  expect(Buffer.isBuffer(buf)).toBe(true);
  expect(buf.length).toBeGreaterThan(5_000);
  const zip = await JSZip.loadAsync(buf);
  const file = zip.file("word/document.xml");
  if (!file) throw new Error("word/document.xml missing");
  return file.async("string");
}

async function renderConstruction(
  formOverrides: Record<string, unknown> = {},
  pack: V2Pack = "tokyo-full"
): Promise<string> {
  const buf = await buildConstructionFull({ ...BASE_FORM, ...formOverrides }, pack);
  return extractXml(buf);
}

describe("construction full-pack smoke tests", () => {
  it("contains all chapter headings and 附則", async () => {
    const xml = await renderConstruction();

    expect(xml).toContain("第１　目的及び適用範囲");
    expect(xml).toContain("第２　工事の計画及び施工");
    expect(xml).toContain("第３　工事中の防火管理体制");
    expect(xml).toContain("第４　火気管理");
    expect(xml).toContain("第５　危険物品の管理");
    expect(xml).toContain("第６　放火防止対策");
    expect(xml).toContain("第７　避難施設等の維持管理");
    expect(xml).toContain("第８　消防用設備等の機能維持及び代替措置");
    expect(xml).toContain("第９　工事人に対する教育及び計画の周知");
    expect(xml).toContain("第１０　自衛消防活動及び訓練");
    expect(xml).toContain("第１１　緊急連絡体制");
    expect(xml).toContain("附　則");
  });

  it("has the construction cover title and injects form values", async () => {
    const xml = await renderConstruction();

    expect(xml).toContain("工事中の消防計画");
    expect(xml).toContain("テスト工事ビル");
    expect(xml).toContain("テストビル2階内装改修工事");
    expect(xml).toContain("内装改修・模様替え");
    expect(xml).toContain("テスト建設株式会社");
    expect(xml).toContain("現場代理人 次郎");
    expect(xml).toContain("令和8年8月1日");
    expect(xml).toContain("防火管理花子");
    expect(xml).toContain("テスト中央公園");
    expect(xml).toContain("自動火災報知設備（2階感知器）を8月中停止");
  });

  it("includes appendices 1-5 for standard plan and omits them for light plan", async () => {
    // 本文にも「別表２「火気使用工事 事前承認書」により…」等の参照が
    // あるため、別表そのものの有無は見出し形式（別表Ｎ　タイトル）で判定する。
    const standard = await renderConstruction({ plan: "standard" });
    expect(standard).toContain("別表１　工事概要書");
    expect(standard).toContain("別表２　火気使用工事 事前承認書");
    expect(standard).toContain("別表３　危険物品持込届");
    expect(standard).toContain("別表４　工事中の自衛消防隊編成及び緊急連絡先一覧");
    expect(standard).toContain("別表５　工事中の防火巡回チェック表");

    const light = await renderConstruction({ plan: "light" });
    expect(light).not.toContain("別表２　火気使用工事 事前承認書");
    expect(light).not.toContain("別表５　工事中の防火巡回チェック表");
  });

  it("gates the ch2-occupied section on occupied_during_construction", async () => {
    const occupied = await renderConstruction({ occupied_during_construction: true });
    expect(occupied).toContain("使用中の部分との区画等");

    const vacant = await renderConstruction({ occupied_during_construction: false });
    expect(vacant).not.toContain("使用中の部分との区画等");
  });

  it("shows the dept name on the cover for each supported city pack", async () => {
    const cases: Array<[V2Pack, string]> = [
      ["tokyo-full", "東京消防庁"],
      ["osaka-full", "大阪市消防局"],
      ["sakai-full", "堺市消防局"],
      ["yokohama-full", "横浜市消防局"],
      ["kawasaki-full", "川崎市消防局"],
      ["sagamihara-full", "相模原市消防局"],
      ["nagoya-full", "名古屋市消防局"],
      ["fukuoka-full", "福岡市消防局"],
      ["kitakyushu-full", "北九州市消防局"],
      ["sapporo-full", "札幌市消防局"],
      ["kobe-full", "神戸市消防局"],
      ["saitama-full", "さいたま市消防局"],
      ["hiroshima-full", "広島市消防局"],
      ["sendai-full", "仙台市消防局"],
      ["chiba-full", "千葉市消防局"],
      ["niigata-full", "新潟市消防局"],
      ["kumamoto-full", "熊本市消防局"],
      ["shizuoka-full", "静岡市消防局"],
      ["okayama-full", "岡山市消防局"],
    ];
    for (const [pack, dept] of cases) {
      const xml = await renderConstruction({}, pack);
      expect(xml, `pack=${pack}`).toContain(`【工事中の防火対象物用・${dept}管内】`);
    }
  });

  it("falls back to a dept-less subtitle for unsupported areas (pack=full)", async () => {
    const xml = await renderConstruction({}, "full");
    expect(xml).toContain("【工事中の防火対象物用】");
    expect(xml).not.toContain("管内】");
  });
});

describe("runV2Adapter — plan_kind dispatch", () => {
  it("routes plan_kind=construction to the construction builder for any city pack", async () => {
    const buf = await runV2Adapter({ ...BASE_FORM }, { pack: "tokyo-full" });
    const xml = await extractXml(buf);
    expect(xml).toContain("第２　工事の計画及び施工");
    // 通常の東京計画の章は含まれない。
    expect(xml).not.toContain("第２　管理権原者の責任及び防火管理者の業務");
  });

  it("keeps normal plans on the city builder when plan_kind is absent", async () => {
    const normalForm: Record<string, unknown> = { ...BASE_FORM };
    delete normalForm.plan_kind;
    const buf = await runV2Adapter(normalForm, { pack: "tokyo-full" });
    const xml = await extractXml(buf);
    expect(xml).toContain("第２　管理権原者の責任及び防火管理者の業務");
    expect(xml).not.toContain("第２　工事の計画及び施工");
  });
});
