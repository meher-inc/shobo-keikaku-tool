import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { runV2Adapter, type V2Pack } from "../adapters/generate-plan";

/**
 * 顧客に渡る消防計画に、開発用のメモや転記時の残骸が印字されていないことを確かめる。
 * 別表・条項の出し分けフラグをすべて立てた入力と、何も立てない入力の両方で全様式を生成する。
 */

const PACKS: V2Pack[] = [
  "full", "tokyo-full", "osaka-full", "yokohama-full", "fukuoka-full", "nagoya-full",
  "sapporo-full", "kawasaki-full", "kobe-full", "saitama-full", "sakai-full", "hiroshima-full",
  "sendai-full", "chiba-full", "kitakyushu-full", "niigata-full", "kumamoto-full",
  "sagamihara-full", "shizuoka-full", "okayama-full",
];

const BASE = {
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

const ALL_FLAGS = {
  has_outsource: true,
  has_outsourced_management: true,
  outsource_company: "テスト防災",
  is_unified_management: true,
  requires_unified_fpm: true,
  unified_fpm: true,
  has_disaster_center: true,
  tokai_quake_applicable: true,
};

// 開発用のメモ・変数名・Word からの転記残骸。
const DEV_NOTE_PATTERNS = [
  /Phase ?\d/,
  /Step ?\d/,
  /TODO|FIXME|TBD/,
  /完全実装/,
  /placeholder/i,
  /<<table:/,
  /\b[a-z]+[A-Z][A-Za-z]+\b/, // camelCase の変数名（leaderName など）
  /\bPAGE \d/,
  /\bleft-\d/,
  /undefined|NaN|\[object/,
];

async function renderText(form: Record<string, unknown>, pack: V2Pack): Promise<string> {
  const buf = await runV2Adapter(form, { pack });
  const xml = await (await JSZip.loadAsync(buf)).file("word/document.xml")!.async("string");
  return xml.replace(/<\/w:p>/g, "\n").replace(/<[^>]+>/g, "");
}

describe("出力に開発用メモが残っていない", () => {
  it.each(PACKS)("%s", async (pack) => {
    for (const form of [BASE, { ...BASE, ...ALL_FLAGS }, { ...BASE, plan: "light" }]) {
      const text = await renderText(form, pack);
      for (const re of DEV_NOTE_PATTERNS) {
        expect(text.match(re)?.[0] ?? null, `${pack}: ${re}`).toBeNull();
      }
    }
  });

  it("工事中の消防計画", async () => {
    const text = await renderText(
      { ...BASE, ...ALL_FLAGS, plan_kind: "construction", construction_type: "内装改修・模様替え" },
      "tokyo-full"
    );
    for (const re of DEV_NOTE_PATTERNS) {
      expect(text.match(re)?.[0] ?? null, `construction: ${re}`).toBeNull();
    }
  });
});
