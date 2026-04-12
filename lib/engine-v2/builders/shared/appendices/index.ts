import type { Paragraph, Table } from "docx";
import type { RenderData } from "../../../helpers/placeholder";
import type { TableTheme } from "../table-helpers";
import { styledTable } from "../table-helpers";
import { appendixHeading, pageBreak, plainText, spacerParagraph } from "../paragraph-helpers";

/**
 * Shared appendix builders — identical or near-identical structures
 * used by both Kyoto and Tokyo (and future depts). Each takes a
 * TableTheme and dept-specific option overrides so the caller
 * controls the visual branding and text variations.
 *
 * Moved from builders/kyoto/appendices.ts in Step 5 Task 5.
 */

// ── 委託状況表 ────────────────────────────────────────────────

export function buildOutsourceStatus(
  data: RenderData,
  theme: TableTheme,
  opts: { num: string; title: string }
): (Paragraph | Table)[] {
  const company = data.outsourceCompany ?? "（　　　　　　）";
  return [
    pageBreak(),
    appendixHeading(opts.num, opts.title),
    styledTable(
      ["受託者", "委託業務の範囲", "受託の方法"],
      [[company, "（　　　　　　）", "常駐 ・ 巡回 ・ 遠隔"], ["", "", ""]],
      [2500, 3500, 3026],
      theme
    ),
  ];
}

// ── 日常の火災予防 ────────────────────────────────────────────

export function buildDailyPrevention(
  theme: TableTheme,
  opts: { num: string; title: string }
): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading(opts.num, opts.title),
    styledTable(
      ["担当区域", "担当者", "日常の注意事項"],
      [
        ["事務室", "(    )", "退室時の電源遮断、書類の整理整頓"],
        ["厨房・給湯室", "(    )", "ガス栓の閉止、油の管理、換気"],
        ["倉庫・物置", "(    )", "可燃物の整理、施錠の確認"],
        ["共用部・廊下", "(    )", "避難経路上の物品の除去"],
        ["トイレ・洗面所", "(    )", "不審物の確認、巡視"],
      ],
      [2500, 3000, 3526],
      theme
    ),
  ];
}

// ── 火気関係チェック ──────────────────────────────────────────

export function buildFireCheck(
  data: RenderData,
  theme: TableTheme,
  opts: { num: string; title: string; timingDefault: string }
): (Paragraph | Table)[] {
  const checker = data.dailyChecker ?? "防火管理者";
  const timing = data.dailyCheckTiming ?? opts.timingDefault;
  return [
    pageBreak(),
    appendixHeading(opts.num, opts.title),
    styledTable(
      ["検査項目", "検査内容", "結果"],
      [
        ["喫煙場所", "吸い殻の処理は適正か", "良 ・ 否"],
        ["火気使用設備器具", "使用後の安全確認", "良 ・ 否"],
        ["ガス設備", "栓の閉止確認", "良 ・ 否"],
        ["電気設備", "コンセント・配線の異常の有無", "良 ・ 否"],
        ["危険物", "適正な保管", "良 ・ 否"],
      ],
      [3500, 3500, 2026],
      theme
    ),
    spacerParagraph(),
    plainText(`実施者:${checker}\u3000\u3000実施時期:${timing}`),
  ];
}

// ── 閉鎖障害チェック ─────────────────────────────────────────

export function buildClosureCheck(
  data: RenderData,
  theme: TableTheme,
  opts: { num: string; title: string; timingDefault: string }
): (Paragraph | Table)[] {
  const checker = data.dailyChecker ?? "防火管理者";
  const timing = data.dailyCheckTiming ?? opts.timingDefault;
  return [
    pageBreak(),
    appendixHeading(opts.num, opts.title),
    styledTable(
      ["検査項目", "検査内容", "結果"],
      [
        ["避難口", "開放できる状態か、物品で塞がれていないか", "良 ・ 否"],
        ["廊下・通路", "避難の障害となる物品がないか", "良 ・ 否"],
        ["階段", "物品が置かれていないか", "良 ・ 否"],
        ["防火戸", "閉鎖の障害となる物品がないか", "良 ・ 否"],
        ["防火シャッター", "降下位置に物品がないか", "良 ・ 否"],
      ],
      [3500, 3500, 2026],
      theme
    ),
    spacerParagraph(),
    plainText(`実施者:${checker}\u3000\u3000実施時期:${timing}`),
  ];
}

// ── 定期検査チェック ─────────────────────────────────────────

export function buildPeriodicCheck(
  data: RenderData,
  theme: TableTheme,
  opts: { num: string; title: string }
): (Paragraph | Table)[] {
  const months = data.periodicCheckMonths ?? "4月と10月";
  return [
    pageBreak(),
    appendixHeading(opts.num, opts.title),
    styledTable(
      ["検査対象", "検査内容", "結果"],
      [
        ["建物の構造", "壁・柱・床・天井に損傷はないか", "良 ・ 否"],
        ["防火区画", "貫通部の埋戻しは適正か", "良 ・ 否"],
        ["内装制限", "可燃性の装飾物の有無", "良 ・ 否"],
        ["危険物施設", "保管・取扱いは適正か", "良 ・ 否"],
        ["電気設備", "分電盤・配線の異常の有無", "良 ・ 否"],
      ],
      [2800, 4200, 2026],
      theme
    ),
    spacerParagraph(),
    plainText(`実施者:火元責任者\u3000\u3000実施時期:${months}`),
  ];
}

// ── 消防用設備等自主点検 ─────────────────────────────────────

export function buildEquipmentCheck(
  data: RenderData,
  theme: TableTheme,
  opts: { num: string; title: string; showTiming?: boolean }
): (Paragraph | Table)[] {
  const csv = data.fireEquipmentList;
  const equipment =
    csv && csv.length > 0
      ? csv.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : ["消火器", "自動火災報知設備", "誘導灯"];

  const checker = data.dailyChecker ?? "防火管理者";
  const out: (Paragraph | Table)[] = [
    pageBreak(),
    appendixHeading(opts.num, opts.title),
    styledTable(
      ["設備名", "点検内容", "結果"],
      equipment.map((eq) => [eq, "外観・配置・機能に異常はないか", "良 ・ 否"]),
      [2800, 4200, 2026],
      theme
    ),
    spacerParagraph(),
  ];
  if (opts.showTiming !== false) {
    const selfCheckMonths = data.selfCheckMonths ?? "1月と7月";
    out.push(plainText(`実施者:${checker}\u3000\u3000実施時期:${selfCheckMonths}`));
  } else {
    out.push(plainText(`実施者:${checker}`));
  }
  return out;
}

// ── 自衛消防隊編成表 ─────────────────────────────────────────

type BrigadeRow = [string, string, string]; // [role, name, duty]

const COMMON_BRIGADE_ROWS: BrigadeRow[] = [
  ["通報連絡担当", "(    )", "119番通報、館内・関係者への連絡"],
  ["初期消火担当", "(    )", "消火器・屋内消火栓による初期消火"],
  ["避難誘導担当", "(    )", "避難経路の確保、在館者の誘導"],
  ["安全防護担当", "(    )", "防火戸・防火シャッターの閉鎖確認"],
  ["応急救護担当", "(    )", "負傷者の応急手当、救急隊への引継ぎ"],
];

export function buildFireBrigade(
  data: RenderData,
  theme: TableTheme,
  opts: {
    num: string;
    title: string;
    /** Extra rows inserted after the 隊長 row (e.g. tokyo adds 副隊長). */
    extraLeaderRows?: BrigadeRow[];
  }
): (Paragraph | Table)[] {
  const managerName = data.managerName ?? "(    )";
  const leaderRow: BrigadeRow = ["自衛消防隊長", managerName, "全体の指揮、消防隊への情報提供"];
  const rows: string[][] = [
    leaderRow,
    ...(opts.extraLeaderRows ?? []),
    ...COMMON_BRIGADE_ROWS,
  ];
  // Tokyo uses 班 naming (通報連絡班) vs kyoto 担当. For now the
  // common rows use kyoto naming; tokyo can override if needed in
  // a future step.
  return [
    pageBreak(),
    appendixHeading(opts.num, opts.title),
    styledTable(["役割", "氏名", "任務"], rows, [2500, 3000, 3526], theme),
  ];
}
