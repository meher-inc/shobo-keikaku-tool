// サーバー（Vercel）と同じ UTC で動かし、作成日が日本時間で数えられることを確かめる。
process.env.TZ = "UTC";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import JSZip from "jszip";
import { runV2Adapter, type V2Pack } from "../adapters/generate-plan";
import { selectPackByLocation } from "../city-dispatch";
import { toRenderData } from "../adapters/to-render-data";
import { equipmentRows } from "../builders/shared/equipment-rows";
import { formatUseCategory } from "../helpers/plan-text";

/**
 * 実案件（東京消防庁管内・テナント入居のフィットネスジム）で見つかった出力不具合の再現テスト。
 * 生成日時は 2026-10-14 08:30 JST（UTC では 10/13）。
 */

const REPRO_FORM = {
  prefecture: "東京都",
  city: "北区",
  ward: "",
  address_detail: "王子4-25-6 セントラルビル 101",
  building_name: "FLOWFIT24 王子店",
  use_category: "15",
  use_name: "スポーツクラブ",
  total_area: "390",
  num_floors: "5",
  capacity: "129",
  management_scope_type: "part",
  tenant_building_name: "セントラルビル",
  used_floors: "1階",
  used_area: "390",
  owner_name: "株式会社ライフアライアンス 代表取締役 小林 俊",
  manager_name: "小林 俊",
  manager_qual: "甲種",
  manager_date: "令和8年10月1日",
  manager_tel: "03-0000-0000",
  has_outsource: false,
  equipment: ["消火器", "誘導灯", "自動火災報知設備"],
  equipment_floors: [
    { floor: "", detail: "消火器4本（受付・トレーニングエリア）" },
    { floor: "", detail: "誘導灯3個（出入口・通路）" },
  ],
  fire_use_equipment: ["なし"],
  emergency_name: "小林 俊",
  emergency_tel: "03-0000-0000",
  evacuation_site: "飛鳥山公園",
  assembly_point: "建物前",
  drill_months: "4月・10月",
  education_months: "4月・10月",
  plan_kind: "normal",
  plan: "standard",
};

/** docx の本文を段落ごとの改行・セルごとの「|」区切りのテキストにする。 */
async function renderText(form: Record<string, unknown>, pack?: V2Pack): Promise<string> {
  const p = pack ?? selectPackByLocation(String(form.prefecture), String(form.city));
  const buf = await runV2Adapter(form, { pack: p });
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file("word/document.xml")!.async("string");
  return xml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<\/w:tc>/g, "|")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\n\|/g, "|");
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-13T23:30:00Z")); // 2026-10-14 08:30 JST
});
afterEach(() => {
  vi.useRealTimers();
});

describe("再現データ（FLOWFIT24 王子店・東京消防庁 中規模用）", () => {
  it("A1: 作成日と施行日を日本時間で出す", async () => {
    const t = await renderText(REPRO_FORM);
    expect(t).toContain("令和8年10月14日作成");
    expect(t).toContain("この計画は、令和8年10月14日から施行する。");
    expect(t).not.toContain("令和8年10月13日");
  });

  it("A2: 建物の一部の適用範囲と、全体計画への適合条項を出す", async () => {
    const t = await renderText(REPRO_FORM);
    expect(t).toContain(
      "⑴　管理権原の及ぶ範囲は、セントラルビル1階のうち、FLOWFIT24 王子店として使用する部分（390㎡）とする。"
    );
    expect(t).toContain("⑶　建物全体についての消防計画が作成されている場合又は今後作成された場合は、この計画をこれに適合させるものとする。");
    expect(t).not.toContain("建物全体とする");
  });

  it("A2: 建物全体の場合は従来どおりで、適合条項は出さない", async () => {
    const t = await renderText({ ...REPRO_FORM, management_scope_type: "whole" });
    expect(t).toContain("⑴　管理権原の及ぶ範囲は、建物全体とする。");
    expect(t).not.toContain("これに適合させる");
  });

  it("A3: 初期消火には消火設備だけを並べる", async () => {
    const t = await renderText(REPRO_FORM);
    expect(t).toContain("⑵　初期消火\n　消火器等を使用して初期消火を行う。");
    const withHydrant = await renderText({
      ...REPRO_FORM,
      equipment: ["消火器", "誘導灯", "自動火災報知設備", "屋内消火栓", "スプリンクラー設備"],
    });
    expect(withHydrant).toContain("　消火器、屋内消火栓、スプリンクラー設備等を使用して初期消火を行う。");
    expect(withHydrant).not.toMatch(/誘導灯[^\n]*初期消火を行う/);
  });

  it("A4: 設置していない設備は第7・別表6・別表7に出さない", async () => {
    const t = await renderText(REPRO_FORM);
    expect(t).not.toContain("屋内消火栓");
    expect(t).not.toContain("スプリンクラー");
    const app6 = t.slice(t.lastIndexOf("別表６　"), t.lastIndexOf("別表７　"));
    expect(app6).toContain("消火器|");
    expect(app6).toContain("誘導灯|");
    expect(app6).toContain("自動火災報知設備|");
    expect(t).toContain("初期消火担当|(    )|消火器による初期消火|");
    expect(t).toContain("安全防護担当|(    )|防火戸等の閉鎖確認|");
    expect(t).not.toContain("防火シャッターの閉鎖確認");
  });

  it("A5: 用途は「用途名（令別表第一（15）項）」で出す", async () => {
    const t = await renderText(REPRO_FORM);
    expect(t).toContain("用途（令別表第一）|スポーツクラブ（令別表第一（15）項）|");
    expect(formatUseCategory("15", undefined)).toBe("（15）項");
    expect(formatUseCategory("16-ロ", undefined)).toBe("（16）項ロ");
    expect(formatUseCategory("3-ロ", "飲食店")).toBe("飲食店（令別表第一（3）項ロ）");
  });

  it("A6: 点検結果報告は関係者が行い、周期は特定1年・非特定3年", async () => {
    const t = await renderText(REPRO_FORM);
    expect(t).toContain("消防用設備等点検結果報告|3年に1回|関係者（防火管理者は結果を確認）|");
    expect(t).not.toContain("防火管理者の確認後");
    const specific = await renderText({ ...REPRO_FORM, use_category: "3-ロ" });
    expect(specific).toContain("消防用設備等点検結果報告|1年に1回|");
    const tenant16i = await renderText({ ...REPRO_FORM, use_category: "16-イ" });
    expect(tenant16i).toContain("消防用設備等点検結果報告|1年に1回|");
  });

  it("B7: 階が空の行に「—:」を付けない", async () => {
    const t = await renderText(REPRO_FORM);
    expect(t).toContain("消火器4本（受付・トレーニングエリア） ／ 誘導灯3個（出入口・通路）");
    expect(t).not.toContain("—:");
  });

  it("B8: 定期点検の時期は第3と別表5で同じ", async () => {
    const t = await renderText(REPRO_FORM);
    expect(t).toContain("⑵　建物及び消防用設備等の確認は、5月と11月頃に行う。");
    expect(t).toContain("実施者:火元責任者　　実施時期:5月と11月");
    const entered = await renderText({ ...REPRO_FORM, periodic_check_months: "6月と12月" });
    expect(entered).toContain("確認は、6月と12月頃に行う。");
    expect(entered).toContain("実施時期:6月と12月");
  });

  it("B9: 火気使用設備なしなら厨房・防火ダンパー・ガス機器の条文を出さず、番号を振り直す", async () => {
    const t = await renderText(REPRO_FORM);
    expect(t).not.toContain("厨房機器");
    expect(t).not.toContain("防火ダンパー");
    expect(t).not.toContain("ガス機器");
    expect(t).toContain(
      "⑵　火気管理等\n" +
        "　①　喫煙は、指定された場所で行い、確実に吸殻を処理する。\n" +
        "　②　火気設備・器具は、使用する前後に点検を行い、周囲を整理整頓して安全を確認する。\n" +
        "　③　危険物品は持ち込まない、持ち込ませない。\n" +
        "⑶　放火防止対策"
    );
    const kitchen = await renderText({ ...REPRO_FORM, fire_use_equipment: ["厨房設備", "ガス機器"] });
    expect(kitchen).toContain("　③　厨房機器やその周囲は毎日こまめに点検・清掃する。");
    expect(kitchen).toContain("　⑤　ガス機器を使用中はその場を離れない。離れるときは火を消す。");
    expect(kitchen).toContain("　⑥　危険物品は持ち込まない、持ち込ませない。");
    // 火気使用設備の項目がない旧データは、従来どおり全項目を出す。
    const legacy = await renderText({ ...REPRO_FORM, fire_use_equipment: undefined });
    expect(legacy).toContain("　④　防火ダンパーや自動消火装置は正常に作動するように整備・清掃する。");
  });

  it("B10/B11: 選択肢の見出し「Ａ」を出さず、帰宅困難者対策は第12とする", async () => {
    const t = await renderText(REPRO_FORM);
    expect(t).not.toContain("Ａ　事業所自衛消防隊を編成する場合");
    expect(t).not.toContain("（追加）");
    expect(t).toContain("第12　帰宅困難者対策");
  });

  it("B12: 別表8の実施状況はすべて「済 ・ 未」", async () => {
    const t = await renderText(REPRO_FORM);
    const app8 = t.slice(t.lastIndexOf("別表８　"), t.lastIndexOf("別表９　"));
    expect(app8.match(/済 ・ 未/g)).toHaveLength(6);
    expect(app8).not.toContain("済 ・ 否");
  });
});

describe("他の様式でも同じ不具合が出ない", () => {
  const PACKS: V2Pack[] = [
    "full", "osaka-full", "yokohama-full", "fukuoka-full", "nagoya-full", "sapporo-full",
    "kawasaki-full", "kobe-full", "saitama-full", "sakai-full", "hiroshima-full", "sendai-full",
    "chiba-full", "kitakyushu-full", "niigata-full", "kumamoto-full", "sagamihara-full",
    "shizuoka-full", "okayama-full",
  ];

  // 初期消火の任務は別表（表のセル）だけを見る。本文は各消防本部の作成例の文言のため対象外。
  it.each(PACKS)("%s: 作成日がJST・用途が項表記・「—:」なし・別表の初期消火の任務は入力設備のみ", async (pack) => {
    const t = await renderText(REPRO_FORM, pack);
    expect(t).toContain("令和8年10月14日");
    expect(t).not.toContain("令和8年10月13日");
    expect(t).toContain("スポーツクラブ（令別表第一（15）項）");
    expect(t).not.toContain("—:");
    expect(t).not.toMatch(/\|[^|\n]*屋内消火栓[^|\n]*初期消火/);
  });

  it("標準様式（京都ベース）: 建物の一部の適用範囲と適合条項、初期消火の設備", async () => {
    const t = await renderText({ ...REPRO_FORM, prefecture: "静岡県", city: "浜松市" });
    expect(t).toContain(
      "⑴　当該管理権原の及ぶ範囲はセントラルビル1階のうち、FLOWFIT24 王子店として使用する部分（390㎡）とする。"
    );
    expect(t).toContain("⑶　建物全体についての消防計画が作成されている場合又は今後作成された場合は、この計画をこれに適合させるものとする。");
    expect(t).toContain("初期消火担当は、消火器等の適切な消防用設備等を用いて消火する。");
    const whole = await renderText({ ...REPRO_FORM, prefecture: "静岡県", city: "浜松市", management_scope_type: "whole" });
    expect(whole).toContain("⑴　当該管理権原の及ぶ範囲はFLOWFIT24 王子店の建物全体とする。");
  });

  it("大阪市: 建物の一部の管理権原範囲と適合条項", async () => {
    const t = await renderText(REPRO_FORM, "osaka-full");
    expect(t).toContain(
      "管理権原範囲」という。）は、セントラルビル1階のうち、FLOWFIT24 王子店として使用する部分（390㎡）とする。"
    );
    expect(t).toContain("　建物全体についての消防計画が作成されている場合又は今後作成された場合は、この計画をこれに適合させるものとする。");
    const whole = await renderText({ ...REPRO_FORM, management_scope_type: "whole" }, "osaka-full");
    expect(whole).toContain("）は、（建物全体）部分とする。");
  });

  it("工事中の消防計画: 作成日がJST", async () => {
    const t = await renderText({
      ...REPRO_FORM,
      plan_kind: "construction",
      construction_type: "内装改修・模様替え",
      construction_start: "令和8年11月1日",
      construction_end: "令和8年11月30日",
      contractor_name: "テスト建設",
    }, "tokyo-full");
    expect(t).toContain("令和8年10月14日");
    expect(t).not.toContain("令和8年10月13日");
  });
});

describe("入力の変換", () => {
  it("is_specific_use が送られなくても用途の項から判定する", () => {
    expect(toRenderData({ use_category: "15" }).isSpecificUse).toBe("false");
    expect(toRenderData({ use_category: "3-ロ" }).isSpecificUse).toBe("true");
    expect(toRenderData({ use_category: "3-ロ", is_specific_use: false }).isSpecificUse).toBe("false");
  });

  it("様式の設備行は入力された設備だけ残し、足りない設備は行を足す", () => {
    const base = [
      ["消火器", "x"],
      ["屋内消火栓設備", "x"],
      ["避難器具・誘導灯", "x"],
    ];
    const rows = equipmentRows({ fireEquipmentList: "消火器,誘導灯,自動火災報知設備" }, base, (n) => [n, "add"]);
    expect(rows).toEqual([
      ["消火器", "x"],
      ["避難器具・誘導灯", "x"],
      ["自動火災報知設備", "add"],
    ]);
    expect(equipmentRows({}, base, (n) => [n])).toBe(base);
  });
});
