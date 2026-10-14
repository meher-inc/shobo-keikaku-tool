/**
 * 消防計画の本文に差し込む文言を、フォーム入力から組み立てる純粋関数群。
 * 様式（pack）をまたいで同じ判断をするものだけをここに置く。
 */

/** 作成日・施行日は日本時間で数える（サーバーは UTC で動くため明示する）。 */
export const PLAN_TIME_ZONE = "Asia/Tokyo";

/** Date を和暦の日付文字列（例: 令和8年10月14日）にする。日本時間基準。 */
export function formatEraDateJst(d: Date): string {
  return d.toLocaleDateString("ja-JP-u-ca-japanese", {
    timeZone: PLAN_TIME_ZONE,
    era: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── 用途（令別表第一） ─────────────────────────────────────────

/**
 * 特定防火対象物に当たる項（消防法施行令 別表第一）。
 * フォームの値は "15" / "16-ロ" の形式。
 */
const SPECIFIC_USE_CODES = new Set([
  "1-イ", "1-ロ", "2-イ", "2-ロ", "2-ハ", "2-ニ", "3-イ", "3-ロ", "4",
  "5-イ", "6-イ", "6-ロ", "6-ハ", "6-ニ", "9-イ", "16-イ", "16の2", "16の3",
]);

export function isSpecificUseCode(code: string | undefined): boolean | undefined {
  if (!code) return undefined;
  return SPECIFIC_USE_CODES.has(code.trim());
}

/**
 * "15" → "（15）項"、"16-ロ" → "（16）項ロ"。
 * 想定外の形式はそのまま返す（入力を失わないため）。
 */
export function formatUseCategoryCode(code: string | undefined): string | undefined {
  if (!code) return undefined;
  const m = code.trim().match(/^(\d+(?:の\d+)?)(?:-([イロハニホヘト]))?$/);
  if (!m) return code;
  return `（${m[1]}）項${m[2] ?? ""}`;
}

/** 用途名があれば「スポーツクラブ（令別表第一（15）項）」、なければ「（15）項」。 */
export function formatUseCategory(code: string | undefined, useName: string | undefined): string | undefined {
  const item = formatUseCategoryCode(code);
  const name = useName?.trim();
  if (name && item) return `${name}（令別表第一${item}）`;
  return item ?? name;
}

// ── 消防用設備等 ───────────────────────────────────────────────

/** 初期消火に使う設備（警報設備・避難設備は含めない）。並びは条文での表記順。 */
const EXTINGUISHING_EQUIPMENT = [
  "消火器",
  "簡易消火用具",
  "屋内消火栓",
  "屋内消火栓設備",
  "スプリンクラー設備",
  "屋外消火栓",
  "屋外消火栓設備",
  "泡消火設備",
  "水噴霧消火設備",
];

export function pickExtinguishingEquipment(equipment: string[]): string[] {
  const set = new Set(equipment.map((s) => s.trim()));
  return EXTINGUISHING_EQUIPMENT.filter((e) => set.has(e));
}

// ── 管理権原の範囲 ─────────────────────────────────────────────

export type ScopeInput = {
  /** 旧来の自由記述（指定があれば最優先）。 */
  managementScope?: string;
  /** "whole"（建物全体） | "part"（建物の一部）。 */
  scopeType?: string;
  /** 建物の一部の場合の、建物（ビル）の名称。 */
  tenantBuildingName?: string;
  /** 建物の一部の場合の使用階（例: "1階"）。 */
  usedFloors?: string;
  /** 建物の一部の場合の使用面積（㎡）。 */
  usedArea?: string;
  /** 事業所（テナント）の名称。フォームの building_name。 */
  occupantName?: string;
};

export function isPartScope(s: ScopeInput): boolean {
  return !s.managementScope && s.scopeType === "part";
}

/**
 * 「管理権原の及ぶ範囲は、＿＿とする。」の＿＿部分。
 * 建物の一部: 「セントラルビル1階のうち、FLOWFIT24 王子店として使用する部分（390㎡）」
 */
export function managementScopePhrase(s: ScopeInput): string | undefined {
  if (s.managementScope) return s.managementScope;
  if (!isPartScope(s)) return undefined;
  const where = `${s.tenantBuildingName?.trim() || "当該建物"}${s.usedFloors?.trim() ?? ""}`;
  const who = s.occupantName?.trim() || "当事業所";
  const area = s.usedArea?.trim() ? `（${s.usedArea.trim()}㎡）` : "";
  return `${where}のうち、${who}として使用する部分${area}`;
}

/** 建物の一部の場合に置く条項（番号なし）。 */
export const PART_SCOPE_CONFORM_CLAUSE =
  "建物全体についての消防計画が作成されている場合又は今後作成された場合は、この計画をこれに適合させるものとする。";

// ── 火気使用設備 ───────────────────────────────────────────────

export const FIRE_USE_KITCHEN = "厨房設備";
export const FIRE_USE_GAS = "ガス機器";
export const FIRE_USE_NONE = "なし";

/**
 * 東京消防庁様式 第4の1⑵「火気管理等」の項目。
 * fireUse が undefined（旧データで未入力）のときは従来どおり全項目を出す。
 */
export function tokyoFireControlItems(fireUse: string[] | undefined): string[] {
  const legacy = fireUse === undefined;
  const has = (k: string) => legacy || (fireUse ?? []).includes(k);
  const items = [
    "喫煙は、指定された場所で行い、確実に吸殻を処理する。",
    "火気設備・器具は、使用する前後に点検を行い、周囲を整理整頓して安全を確認する。",
  ];
  if (has(FIRE_USE_KITCHEN)) {
    items.push("厨房機器やその周囲は毎日こまめに点検・清掃する。");
    items.push("防火ダンパーや自動消火装置は正常に作動するように整備・清掃する。");
  }
  if (has(FIRE_USE_GAS)) {
    items.push("ガス機器を使用中はその場を離れない。離れるときは火を消す。");
  }
  items.push("危険物品は持ち込まない、持ち込ませない。");
  return items;
}

const CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳";

/** 項目を「　①　…」の行にして改行でつなぐ。 */
export function circledLines(items: string[]): string {
  return items.map((t, i) => `　${CIRCLED[i]}　${t}`).join("\n");
}

// ── 各階配置 ───────────────────────────────────────────────────

export function formatEquipmentByFloor(
  rows: { floor?: string; detail?: string }[]
): string | undefined {
  const out = rows
    .filter((r) => r && (r.floor?.trim() || r.detail?.trim()))
    .map((r) => {
      const floor = (r.floor || "").trim();
      const detail = (r.detail || "").trim();
      return floor ? `${floor}: ${detail}`.trim() : detail;
    })
    .join(" ／ ");
  return out || undefined;
}
