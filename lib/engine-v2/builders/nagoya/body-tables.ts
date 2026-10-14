import type { Paragraph, Table } from "docx";
import { resolveBody, type RenderData } from "../../helpers/placeholder";
import type { Section } from "../../types/template-pack";
import { buildSectionBody } from "../paragraph";
import { styledTable } from "../shared/table-helpers";
import { nagoyaTheme } from "./appendices";

/**
 * 名古屋市様式の本文中の表（第4条・第6条・第8条・第11条）。
 * テンプレート本文の「<<table:キー>>」の行を、対応する記入用の表に置き換える。
 */

const B = "　";

const BODY_TABLES: Record<string, () => Table> = {
  selfCheckSchedule: () =>
    styledTable(
      ["検査対象", "実施月日"],
      [
        ["建築物", "　　月　　日"],
        ["通路・階段等", "　　月　　日"],
        ["火気使用設備", "　　月　　日"],
        ["防火区画等", "　　月　　日"],
        ["消防用設備等", "　　月　　日"],
      ],
      [4500, 4526],
      nagoyaTheme
    ),
  legalInspection: () =>
    styledTable(
      ["消防用設備等", "機器点検", "総合点検"],
      [
        ["消火器", "　　月", "　　月"],
        ["屋内消火栓設備", "　　月", "　　月"],
        ["自動火災報知設備", "　　月", "　　月"],
        ["誘導灯", "　　月", "　　月"],
        ["放送設備", "　　月", "　　月"],
        ["避難器具", "　　月", "　　月"],
      ],
      [3500, 2763, 2763],
      nagoyaTheme
    ),
  stockpile: () =>
    styledTable(
      ["備蓄品", "数量", "備蓄場所"],
      [
        ["飲料水", B, B],
        ["非常用食料", B, B],
        ["応急手当セット", B, B],
        ["懐中電灯", B, B],
        ["乾電池", B, B],
        ["携帯用ラジオ", B, B],
        ["その他", B, B],
      ],
      [3500, 2000, 3526],
      nagoyaTheme
    ),
  rescueEquipment: () =>
    styledTable(
      ["資機材", "数量", "保管場所"],
      [
        ["ヘルメット", B, B],
        ["スコップ", B, B],
        ["つるはし", B, B],
        ["ハンマー", B, B],
        ["金てこ", B, B],
        ["鉄パイプ", B, B],
        ["ロープ", B, B],
        ["軍手", B, B],
      ],
      [3500, 2000, 3526],
      nagoyaTheme
    ),
  educationSchedule: () =>
    styledTable(
      ["対象者", "実施時期"],
      [
        ["新入社員", "採用時1回"],
        ["正社員", "年2回"],
        ["派遣社員", "採用時1回・必要の都度"],
        ["アルバイト・パート", "採用時1回・必要の都度"],
      ],
      [4000, 5026],
      nagoyaTheme
    ),
  drillSchedule: () =>
    styledTable(
      ["訓練種別", "実施時期"],
      [
        ["消火訓練", "　　月"],
        ["避難訓練", "　　月"],
        ["通報訓練", "　　月"],
        ["震災訓練", "　　月"],
        ["総合訓練", "　　月"],
      ],
      [4000, 5026],
      nagoyaTheme
    ),
};

const MARKER_RE = /^<<table:(\w+)>>$/;

/** 本文を表の位置で区切り、文章と表を順に並べる。 */
export function buildBodyWithTables(section: Section, data: RenderData): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  let chunk: string[] = [];
  const flush = () => {
    if (chunk.length === 0) return;
    out.push(...buildSectionBody({ ...section, body: [{ type: "text", value: chunk.join("\n") }] }, data));
    chunk = [];
  };
  for (const line of resolveBody(section.body, data).split("\n")) {
    const key = line.match(MARKER_RE)?.[1];
    const table = key ? BODY_TABLES[key] : undefined;
    if (table) {
      flush();
      out.push(table());
    } else {
      chunk.push(line);
    }
  }
  flush();
  return out;
}

/** 表を含む本文の section id（テンプレート本文に「<<table:…>>」があるもの）。 */
export const NAGOYA_SECTIONS_WITH_TABLES = [
  "art4-self-check",
  "art6-formal-inspection",
  "art8-quake",
  "art11-education",
];
