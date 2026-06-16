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
 * 川崎市消防局（防火・単一権原用 甲種）別表ビルダ。
 *
 * 出典: 川崎市「消防計画作成（変更）届出書」作成例 No.1（防火・単一権原用 甲種）
 *   https://www.city.kawasaki.jp/bousai/category/291-2-8-7-0-0-0-0-0-0.html
 *
 * 別表は本文の各条から参照される記入式フォーム:
 *   - 別表１ 防火管理委員会の構成      （第８条）
 *   - 別表２ 予防的活動のための組織      （第10条）
 *   - 別表３ 自主点検・検査表（消防用設備等）（第13条）
 *   - 別表４ 自主点検・検査表（建物・火気・電気設備等）（第13条）
 *   - 別表５ 点検・検査員              （第13条）
 *   - 別表６ 自衛消防の組織            （第28条・第29条）
 *   - 別表７ 自衛消防の任務分担          （第28条・第29条）
 */

const kawasakiTheme: TableTheme = {
  headerFill: "2E5F9E",
  altFill: "EEF4FA",
};

const B = ""; // 記入欄（空欄）
const NAME = "(　　　　)";

// ── 別表1: 防火管理委員会の構成 ───────────────────────────────────
function buildAppendix1Committee(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("１", "防火管理委員会の構成"),
    styledTable(
      ["役職", "氏名", "備考"],
      [
        ["委員長", NAME, "管理権原者"],
        ["副委員長", NAME, "防火管理者"],
        ["委員", NAME, "防火担当責任者"],
        ["委員", NAME, B],
        ["委員", NAME, B],
      ],
      [2200, 3826, 3000],
      kawasakiTheme
    ),
  ];
}

// ── 別表2: 予防的活動のための組織 ─────────────────────────────────
function buildAppendix2PreventionOrg(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("２", "予防的活動のための組織"),
    styledTable(
      ["区域", "防火担当責任者", "火元責任者"],
      [
        [B, NAME, NAME],
        [B, NAME, NAME],
        [B, NAME, NAME],
        [B, NAME, NAME],
      ],
      [3026, 3000, 3000],
      kawasakiTheme
    ),
  ];
}

// ── 別表3: 自主点検・検査表（消防用設備等） ───────────────────────
function buildAppendix3EquipmentCheck(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("３", "自主点検・検査表（消防用設備等）"),
    styledTable(
      ["設備名", "点検項目", "結果"],
      [
        ["消火器・簡易消火用具", "設置場所は適正か、外形・圧力に異常はないか", B],
        ["屋内消火栓設備", "ホース・ノズル・開閉弁に損傷はなく、使用障害はないか", B],
        ["自動火災報知設備", "受信機・感知器の表示・機能に異常はないか", B],
        ["避難器具", "設置場所・操作に障害はないか、標識は適正か", B],
        ["誘導灯・誘導標識", "点灯し、視認の障害となる物品はないか", B],
        ["連結送水管・その他", "送水口・放水口に損傷・障害はないか", B],
      ],
      [2600, 5426, 1000],
      kawasakiTheme
    ),
  ];
}

// ── 別表4: 自主点検・検査表（建物・火気・電気設備等） ─────────────
function buildAppendix4BuildingCheck(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("４", "自主点検・検査表（建物・火気・電気設備等）"),
    styledTable(
      ["区分", "点検項目", "結果"],
      [
        ["建物", "防火戸・防火シャッターは閉鎖障害がなく、機能を保持しているか", B],
        ["避難施設", "避難通路・階段・避難口に障害物はないか", B],
        ["火気使用設備器具", "可燃物からの離隔距離は適正か、安全装置は機能するか", B],
        ["電気設備", "コードの損傷・たこ足配線はないか", B],
        ["危険物施設等", "危険物の貯蔵・取扱いは適正で、漏れ・転倒防止措置はあるか", B],
      ],
      [2200, 5826, 1000],
      kawasakiTheme
    ),
  ];
}

// ── 別表5: 点検・検査員 ───────────────────────────────────────────
function buildAppendix5Inspectors(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("５", "点検・検査員"),
    styledTable(
      ["点検・検査の対象", "点検・検査員氏名"],
      [
        ["消防用設備等・特殊消防用設備等", NAME],
        ["建物", NAME],
        ["火気使用設備器具", NAME],
        ["電気設備等", NAME],
      ],
      [5026, 4000],
      kawasakiTheme
    ),
  ];
}

// ── 別表6: 自衛消防の組織 ─────────────────────────────────────────
function buildAppendix6FireOrg(data: RenderData): (Paragraph | Table)[] {
  const rows: string[][] = [
    ["自衛消防隊長", data.leaderName ?? NAME, "自衛消防活動全般の指揮統括"],
    ["通報連絡班", data.tsuhouMember ?? NAME, "119番通報、館内放送、関係機関への連絡"],
    ["初期消火班", data.shokaMember ?? NAME, "消火器・屋内消火栓設備等による初期消火"],
    ["避難誘導班", data.hinanMember ?? NAME, "在館者の避難誘導、避難経路の確保"],
    ["救護班", data.kyugoMember ?? NAME, "負傷者の応急救護、救護所の設置"],
    ["安全防護班", data.anzenMember ?? NAME, "防火戸の閉鎖、危険物の除去、二次災害の防止"],
  ];
  return [
    pageBreak(),
    appendixHeading("６", "自衛消防の組織"),
    styledTable(["班", "編成（氏名）", "備考"], rows, [2200, 3826, 3000], kawasakiTheme),
  ];
}

// ── 別表7: 自衛消防の任務分担 ─────────────────────────────────────
function buildAppendix7Duties(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    appendixHeading("７", "自衛消防の任務分担"),
    styledTable(
      ["班", "任務分担"],
      [
        ["通報連絡班", "火災発見時の119番通報、自衛消防隊長への報告、館内放送による周知、消防隊への情報提供"],
        ["初期消火班", "出火場所への消火器・屋内消火栓設備等の搬送と初期消火活動"],
        ["避難誘導班", "避難開始の伝達、非常口の開放、在館者の安全な場所への避難誘導、未避難者の確認"],
        ["救護班", "応急救護所の設置、負傷者の応急手当と搬送"],
        ["安全防護班", "防火戸・防火シャッターの閉鎖、火気・電源の遮断、避難障害物の除去"],
      ],
      [2200, 6826],
      kawasakiTheme
    ),
  ];
}

// ── 別表等一覧 ────────────────────────────────────────────────
export function buildKawasakiAppendixList(): (Paragraph | Table)[] {
  return [
    pageBreak(),
    sectionHeading("別表等一覧"),
    styledTable(
      ["番号", "名称"],
      [
        ["別表１", "防火管理委員会の構成"],
        ["別表２", "予防的活動のための組織"],
        ["別表３", "自主点検・検査表（消防用設備等）"],
        ["別表４", "自主点検・検査表（建物・火気・電気設備等）"],
        ["別表５", "点検・検査員"],
        ["別表６", "自衛消防の組織"],
        ["別表７", "自衛消防の任務分担"],
      ],
      [1500, 7526],
      kawasakiTheme
    ),
  ];
}

// ── Dispatcher ────────────────────────────────────────────────
export function buildKawasakiAppendices(data: RenderData): (Paragraph | Table)[] {
  return [
    ...buildAppendix1Committee(),
    ...buildAppendix2PreventionOrg(),
    ...buildAppendix3EquipmentCheck(),
    ...buildAppendix4BuildingCheck(),
    ...buildAppendix5Inspectors(),
    ...buildAppendix6FireOrg(data),
    ...buildAppendix7Duties(),
  ];
}
