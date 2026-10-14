import type { RenderData } from "../../helpers/placeholder";

/**
 * 各様式の別表にある「設備名ごとの行」を、入力された消防用設備等に合わせて出し分ける。
 *
 * - 設備の入力がない（旧データ等）ときは、様式どおりの行をそのまま返す。
 * - 入力があるときは、設置されている設備に当たる行だけを残し、
 *   様式に行がない設置設備は makeRow で行を足す。
 *
 * 行の先頭セル（設備名）は「避難器具・誘導灯」のように「・」区切りでもよい。
 */
export function equipmentRows(
  data: RenderData,
  baseRows: string[][],
  makeRow: (name: string) => string[]
): string[][] {
  const installed = (data.fireEquipmentList ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (installed.length === 0) return baseRows;

  const covered = new Set<string>();
  const kept = baseRows.filter((row) => {
    const hits = installed.filter((eq) => labelMatches(row[0] ?? "", eq));
    hits.forEach((h) => covered.add(h));
    return hits.length > 0;
  });
  const added = installed.filter((eq) => !covered.has(eq)).map(makeRow);
  return [...kept, ...added];
}

function norm(s: string): string {
  return s.trim().replace(/設備$/, "");
}

function labelMatches(label: string, equipment: string): boolean {
  const e = norm(equipment);
  return label.split("・").some((token) => {
    const t = norm(token);
    return t.length > 0 && (t === e || t.startsWith(e) || e.startsWith(t));
  });
}

/**
 * 初期消火を担う班の任務。設置されている消火設備（消火器・屋内消火栓・スプリンクラー設備等）
 * だけを並べる。設備の入力がない場合は様式どおりの文言を返す。
 */
export function extinguishingDuty(
  data: RenderData,
  legacy: string,
  build: (names: string) => string
): string {
  const names = (data.extinguishingEquipmentList ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (names.length === 0) {
    return data.fireEquipmentList ? build("消火器等") : legacy;
  }
  return build(names.join("・"));
}
