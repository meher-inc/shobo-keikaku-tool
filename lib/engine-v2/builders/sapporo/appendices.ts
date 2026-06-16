import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../helpers/placeholder";
import type { TableTheme } from "../shared/table-helpers";
import { styledTable } from "../shared/table-helpers";
import {
  appendixHeading,
  pageBreak,
  sectionHeading,
} from "../shared/paragraph-helpers";

/**
 * 札幌市消防局（中規模用）別表ビルダ。
 *
 * 出典: 札幌市「消防計画作成（変更）届出」本文様式（中規模用）
 *   https://www3.city.sapporo.jp/download/shinsei/search/procedure_view.asp?ProcID=638
 *
 * 別表は本文（第７・第12・第14条）から参照される:
 *   - 別表１ 自主検査チェック表   （第７ 予防管理対策）
 *   - 別表２ 自衛消防隊の編成      （第12 自衛消防隊）
 *   - 別表３ 休日、夜間の自衛消防隊編成表（第14 休日、夜間における防火管理体制）
 */

/** 札幌 interim theme — 青系（kyoto/osaka と区別）。 */
const sapporoTheme: TableTheme = {
  headerFill: "1B5E9B",
  altFill: "EEF4FA",
};

const BLANK = "";
const MEMBER_FALLBACK = "(　　　　)";

// ── 別表1: 自主検査チェック表 ─────────────────────────────────────

function buildAppendix1SelfInspection(): (Paragraph | Table)[] {
  const rows: string[][] = [
    ["建築構造", "基礎・柱・はり・壁・床に欠損・ひび割れ・脱落・風化等はないか", BLANK],
    ["建築構造", "天井の仕上げ材に、剥離・落下のおそれのあるたるみ・ひび割れ等がないか", BLANK],
    ["建築構造", "窓枠・サッシ等には、ガラス等の落下又は枠自体のはずれの恐れのある腐食・ゆるみ・著しい変形等がないか", BLANK],
    ["建築構造", "外壁・ひさし・パラペットの仕上材に、剥離・落下の恐れのあるひび割れ・浮き上がり等が生じていないか", BLANK],
    ["建築構造", "屋外階段の各構成部材に、手すりの破損・腐食・ひび割れはしていないか", BLANK],
    ["防火設備", "防火戸等は、円滑かつ完全に開閉できるか", BLANK],
    ["防火設備", "防火戸等の閉鎖の障害となる物品等を放置していないか", BLANK],
    ["避難施設", "避難通路は幅員が確保され、避難上支障となる物品等を置いていないか", BLANK],
    ["避難施設", "階段室に物品が置かれていないか", BLANK],
    ["避難施設", "避難扉の開放方向は避難上支障ないか", BLANK],
    ["火気設備・器具", "厨房設備等は、可燃物品からの保有距離は適正か、異常燃焼時に安全装置は適正に機能するか", BLANK],
    ["火気設備・器具", "ガスストーブ・石油ストーブの自動消火装置は適正に機能し、火気周囲は整理整頓されているか", BLANK],
    ["電気設備", "電気器具のコードの亀裂・老化・損傷はないか", BLANK],
    ["電気設備", "タコ足の接続を行っていないか", BLANK],
  ];
  return [
    pageBreak(),
    appendixHeading("１", "自主検査チェック表"),
    styledTable(["区分", "検査項目", "結果"], rows, [1700, 6326, 1000], sapporoTheme),
  ];
}

// ── 別表2: 自衛消防隊の編成 ───────────────────────────────────────

function buildAppendix2FireBrigade(data: RenderData): (Paragraph | Table)[] {
  const rows: string[][] = [
    ["指揮班", data.leaderName ?? MEMBER_FALLBACK, "指揮所の設置、消火・通報・避難状況の把握、隊員への指示・命令の伝達、消防隊への協力"],
    ["通報連絡班", data.tsuhouMember ?? MEMBER_FALLBACK, "119番通報、自衛消防隊長への報告、放送設備による周知、消防隊への情報提供"],
    ["消火班", data.shokaMember ?? MEMBER_FALLBACK, "消火器・屋内消火栓設備等による初期消火、消防隊への情報提供"],
    ["避難誘導班", data.hinanMember ?? MEMBER_FALLBACK, "在館者の避難誘導、非常口の開放、避難経路の障害物除去、未避難者の確認"],
    ["救護班", data.kyugoMember ?? MEMBER_FALLBACK, "応急救護所の設置、負傷者の応急救護"],
  ];
  return [
    pageBreak(),
    appendixHeading("２", "自衛消防隊の編成"),
    styledTable(["班", "編成（氏名）", "任務"], rows, [2000, 2826, 4200], sapporoTheme),
  ];
}

// ── 別表3: 休日、夜間の自衛消防隊編成表 ────────────────────────────

function buildAppendix3NightBrigade(data: RenderData): (Paragraph | Table)[] {
  const rows: string[][] = [
    ["自衛消防隊長", data.leaderName ?? MEMBER_FALLBACK, "全体の指揮、関係者への緊急連絡"],
    ["通報・連絡", data.tsuhouMember ?? MEMBER_FALLBACK, "119番通報、緊急連絡網による関係者への連絡"],
    ["初期消火", data.shokaMember ?? MEMBER_FALLBACK, "初期消火活動、残留者への火災発生の周知"],
    ["避難誘導", data.hinanMember ?? MEMBER_FALLBACK, "残留者の避難誘導、消防隊への情報提供"],
  ];
  return [
    pageBreak(),
    appendixHeading("３", "休日、夜間の自衛消防隊編成表"),
    styledTable(["担当", "編成（氏名）", "任務"], rows, [2000, 2826, 4200], sapporoTheme),
  ];
}

// ── 別表等一覧 ────────────────────────────────────────────────

export function buildSapporoAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    styledTable(
      ["番号", "名称"],
      [
        ["別表１", "自主検査チェック表"],
        ["別表２", "自衛消防隊の編成"],
        ["別表３", "休日、夜間の自衛消防隊編成表"],
      ],
      [1500, 7526],
      sapporoTheme
    ),
  ];
}

// ── Dispatcher ────────────────────────────────────────────────

export function buildSapporoAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildAppendix1SelfInspection(),
    ...buildAppendix2FireBrigade(data),
    ...buildAppendix3NightBrigade(data),
  ];
}
