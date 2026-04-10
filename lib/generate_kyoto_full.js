const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, HeadingLevel, AlignmentType, BorderStyle, WidthType,
        ShadingType, PageBreak, PageNumber } = require("docx");

// ========== KYOTO CITY FIRE PLAN GENERATOR ==========
// Based on: 京都市消防局 中規模用消防計画ひな形 (2025.12.23 updated)
// Source: https://www.city.kyoto.lg.jp/shobo/page/0000330168.html

const W = 9026; // A4 content width (11906 - 1440*2)
const border = { style: BorderStyle.SINGLE, size: 1, color: "888888" };
const borders = { top: border, bottom: border, left: border, right: border };
const cm = { top: 60, bottom: 60, left: 100, right: 100 };
const hdrFill = { fill: "2B4C7E", type: ShadingType.CLEAR };
const altFill = { fill: "F5F7FA", type: ShadingType.CLEAR };

// ========== HELPER FUNCTIONS ==========
function sec(text) {
  return new Paragraph({ spacing: { before: 480, after: 200 },
    children: [new TextRun({ text, bold: true, size: 28, font: "游ゴシック" })] });
}
function sub(text) {
  return new Paragraph({ spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, font: "游ゴシック" })] });
}
function txt(text, opts = {}) {
  return new Paragraph({ spacing: { after: 60 }, indent: opts.indent ? { left: opts.indent } : undefined,
    children: [new TextRun({ text, size: 21, font: "游明朝", ...opts })] });
}
function item(num, text) {
  return txt(`${num}　${text}`);
}
function subitem(text, indent = 420) {
  return txt(`　${text}`, { indent });
}

function row(cells, widths, isHdr = false) {
  return new TableRow({ children: cells.map((c, i) => new TableCell({
    borders, margins: cm, verticalAlign: "center",
    width: { size: widths[i], type: WidthType.DXA },
    shading: isHdr ? hdrFill : (i === 0 ? altFill : undefined),
    children: [new Paragraph({ children: [new TextRun({ text: c, size: isHdr ? 19 : 20,
      font: "游ゴシック", bold: isHdr, color: isHdr ? "FFFFFF" : "000000" })] })]
  })) });
}

function tbl(headers, rows, widths) {
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths,
    rows: [row(headers, widths, true), ...rows.map(r => row(r, widths))] });
}

function pb() { return new Paragraph({ children: [new PageBreak()] }); }
function sp() { return new Paragraph({ spacing: { after: 40 }, children: [] }); }
// ========== APPENDIX BUILDERS (別表1〜9) ==========
function appendixHeading(num, title) {
  return new Paragraph({
    spacing: { before: 480, after: 200 },
    children: [new TextRun({ text: `別表${num}　${title}`, bold: true, size: 28, font: "游ゴシック" })]
  });
}

function buildAppendix1(d) {
  // 防火管理業務の一部委託状況表
  const out = [pb(), appendixHeading("１", "防火管理業務の一部委託状況表")];
  const w = [2500, 3500, 3026];
  out.push(tbl(
    ["受託者", "委託業務の範囲", "受託の方法"],
    [
      [d.outsource_company || "（　　　　　　）", "（　　　　　　）", "常駐 ・ 巡回 ・ 遠隔"],
      ["", "", ""],
    ], w
  ));
  return out;
}

function buildAppendix2(d) {
  // 日常の火災予防の担当者と日常の注意事項
  const out = [pb(), appendixHeading("２", "日常の火災予防の担当者と日常の注意事項")];
  const w = [2500, 3000, 3526];
  out.push(tbl(
    ["担当区域", "担当者", "日常の注意事項"],
    [
      ["事務室", "（　　　　）", "退室時の電源遮断、書類の整理整頓"],
      ["厨房・給湯室", "（　　　　）", "ガス栓の閉止、油の管理、換気"],
      ["倉庫・物置", "（　　　　）", "可燃物の整理、施錠の確認"],
      ["共用部・廊下", "（　　　　）", "避難経路上の物品の除去"],
      ["トイレ・洗面所", "（　　　　）", "不審物の確認、巡視"],
    ], w
  ));
  return out;
}

function buildAppendix3(d) {
  // 自主検査チェック表（日常）「火気関係」
  const out = [pb(), appendixHeading("３", "自主検査チェック表（日常）「火気関係」")];
  const w = [3500, 3500, 2026];
  out.push(tbl(
    ["検査項目", "検査内容", "結果"],
    [
      ["喫煙場所", "吸い殻の処理は適正か", "良 ・ 否"],
      ["火気使用設備器具", "使用後の安全確認", "良 ・ 否"],
      ["ガス設備", "栓の閉止確認", "良 ・ 否"],
      ["電気設備", "コンセント・配線の異常の有無", "良 ・ 否"],
      ["危険物", "適正な保管", "良 ・ 否"],
    ], w
  ));
  out.push(sp(), txt(`実施者：${d.daily_checker || "防火管理者"}　　実施時期：${d.daily_check_timing || "毎日終業時"}`));
  return out;
}

function buildAppendix4(d) {
  // 自主検査チェック表（日常）「閉鎖障害等」
  const out = [pb(), appendixHeading("４", "自主検査チェック表（日常）「閉鎖障害等」")];
  const w = [3500, 3500, 2026];
  out.push(tbl(
    ["検査項目", "検査内容", "結果"],
    [
      ["避難口", "開放できる状態か、物品で塞がれていないか", "良 ・ 否"],
      ["廊下・通路", "避難の障害となる物品がないか", "良 ・ 否"],
      ["階段", "物品が置かれていないか", "良 ・ 否"],
      ["防火戸", "閉鎖の障害となる物品がないか", "良 ・ 否"],
      ["防火シャッター", "降下位置に物品がないか", "良 ・ 否"],
    ], w
  ));
  out.push(sp(), txt(`実施者：${d.daily_checker || "防火管理者"}　　実施時期：${d.daily_check_timing || "毎日終業時"}`));
  return out;
}

function buildAppendix5(d) {
  // 自主検査チェック表（定期）
  const out = [pb(), appendixHeading("５", "自主検査チェック表（定期）")];
  const w = [2800, 4200, 2026];
  out.push(tbl(
    ["検査対象", "検査内容", "結果"],
    [
      ["建物の構造", "壁・柱・床・天井に損傷はないか", "良 ・ 否"],
      ["防火区画", "貫通部の埋戻しは適正か", "良 ・ 否"],
      ["内装制限", "可燃性の装飾物の有無", "良 ・ 否"],
      ["危険物施設", "保管・取扱いは適正か", "良 ・ 否"],
      ["電気設備", "分電盤・配線の異常の有無", "良 ・ 否"],
    ], w
  ));
  out.push(sp(), txt(`実施者：火元責任者　　実施時期：${d.periodic_check_months || "4月と10月"}`));
  return out;
}

function buildAppendix6(d) {
  // 消防用設備等自主点検チェック表
  const out = [pb(), appendixHeading("６", "消防用設備等自主点検チェック表")];
  const equipment = (d.fire_equipment && d.fire_equipment.length)
    ? d.fire_equipment
    : ["消火器", "自動火災報知設備", "誘導灯"];
  const w = [2800, 4200, 2026];
  const rows = equipment.map(eq => [eq, "外観・配置・機能に異常はないか", "良 ・ 否"]);
  out.push(tbl(["設備名", "点検内容", "結果"], rows, w));
  out.push(sp(), txt(`実施者：${d.daily_checker || "防火管理者"}　　実施時期：${d.self_check_months || "1月と7月"}`));
  return out;
}

function buildAppendix7(d) {
  // 消防用設備等の法定点検実施計画
  const out = [pb(), appendixHeading("７", "消防用設備等の法定点検実施計画")];
  const w = [3000, 3000, 3026];
  out.push(tbl(
    ["点検種別", "実施時期", "実施者"],
    [
      ["機器点検", "6か月に1回", d.inspection_company || "（未定）"],
      ["総合点検", "1年に1回", d.inspection_company || "（未定）"],
    ], w
  ));
  const reportFreq = d.is_specific_use ? "1年に1回" : "3年に1回";
  out.push(sp(), txt(`報告：${reportFreq}（総合点検終了後、所轄消防署へ報告）`));
  return out;
}

function buildAppendix8(d) {
  // 自衛消防隊編成表
  const out = [pb(), appendixHeading("８", "自衛消防隊編成表")];
  const w = [2500, 3000, 3526];
  out.push(tbl(
    ["役割", "氏名", "任務"],
    [
      ["自衛消防隊長", d.manager_name || "（　　　　）", "全体の指揮、消防隊への情報提供"],
      ["通報連絡担当", "（　　　　）", "119番通報、館内・関係者への連絡"],
      ["初期消火担当", "（　　　　）", "消火器・屋内消火栓による初期消火"],
      ["避難誘導担当", "（　　　　）", "避難経路の確保、在館者の誘導"],
      ["安全防護担当", "（　　　　）", "防火戸・防火シャッターの閉鎖確認"],
      ["応急救護担当", "（　　　　）", "負傷者の応急手当、救急隊への引継ぎ"],
    ], w
  ));
  return out;
}

function buildAppendix9(d) {
  // 消防訓練実施結果表
  const out = [pb(), appendixHeading("９", "消防訓練実施結果表")];
  const w = [2200, 2200, 2200, 2426];
  out.push(tbl(
    ["実施年月日", "訓練種別", "参加人数", "反省点・改善事項"],
    [
      ["年　月　日", "消火 ・ 通報 ・ 避難 ・ 総合", "　　名", ""],
      ["年　月　日", "消火 ・ 通報 ・ 避難 ・ 総合", "　　名", ""],
      ["年　月　日", "消火 ・ 通報 ・ 避難 ・ 総合", "　　名", ""],
    ], w
  ));
  return out;
}

function buildAllAppendices(d) {
  const all = [];
  // 別表1は委託がある場合のみ
  if (d.has_outsourced_management) all.push(...buildAppendix1(d));
  all.push(...buildAppendix2(d));
  all.push(...buildAppendix3(d));
  all.push(...buildAppendix4(d));
  all.push(...buildAppendix5(d));
  all.push(...buildAppendix6(d));
  all.push(...buildAppendix7(d));
  all.push(...buildAppendix8(d));
  all.push(...buildAppendix9(d));
  return all;
}
// ========== MAIN GENERATOR ==========
function generateKyotoPlan(d) {
  const isSpecific = d.is_specific_use;
  const reportFreq = isSpecific ? "1年" : "3年";
  const drillReq = isSpecific ? "年2回以上" : "消防計画に定めた回数";
  const unified = d.is_unified_management;
  const outsourced = d.has_outsourced_management;
  const c = [];

  // ===== 表紙 =====
  c.push(
    new Paragraph({ spacing: { before: 4000 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: d.company_name || d.building_name, size: 36, bold: true, font: "游ゴシック" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 },
      children: [new TextRun({ text: "消防計画", size: 56, bold: true, font: "游ゴシック" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600 },
      children: [new TextRun({ text: `統括防火管理〔${unified ? "該当" : "非該当"}〕`, size: 22, font: "游明朝" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 },
      children: [new TextRun({ text: `${d.creation_date}作成`, size: 22, font: "游明朝" })] }),
    pb()
  );

  // ===== 第1 目的及びその適用範囲等 =====
  c.push(sec("第１　目的及びその適用範囲等"));
  c.push(sub("１　目的"));
  const legalBasis = unified ? "消防法第８条の２第１項" : "消防法第８条第１項";
  c.push(txt(`　この計画は、${legalBasis}に基づき、管理権原の及ぶ範囲における防火管理についての必要事項を定め、火災、地震、その他の災害の予防と人命の安全、被害の軽減を図ることを目的とする。`));

  c.push(sub("２　適用範囲"));
  c.push(item("⑴", `当該管理権原の及ぶ範囲は${d.building_name}の${d.management_scope || "建物全体"}とする。`));
  c.push(item("⑵", "この計画を適用する者の範囲は、管理権原者、防火管理者およびその他勤務する全ての者とする。"));
  if (outsourced) {
    c.push(item("⑶", `防火管理業務の一部を受託している者　${d.outsource_company}`));
  }

  c.push(sub(`３　防火管理業務の一部委託について〔${outsourced ? "該当" : "非該当"}〕`));
  if (outsourced) {
    c.push(item("⑴", "委託を受けて防火管理業務に従事する者は、この計画に定めるところにより、管理権原者・防火管理者・自衛消防隊長等の指示・指揮命令の下に適正に業務を実施する。"));
    c.push(item("⑵", "受託者は、受託した防火管理業務について、定期に防火管理者に報告する。"));
    c.push(item("⑶", "防火管理業務の委託状況は、別表１「防火管理業務の一部委託状況表」のとおり。"));
  }

  // ===== 第2 管理権原者及び防火管理者の業務と権限 =====
  c.push(pb(), sec("第２　管理権原者及び防火管理者の業務と権限"));
  c.push(sub("１　管理権原者"));
  c.push(item("⑴", "管理権原者は、管理権原の及ぶ範囲の防火管理業務について、全ての責任を持つものとする。"));
  c.push(item("⑵", "管理権原者は、管理的又は監督的な立場にあり、かつ、防火管理業務を適正に遂行できる権限を持つ者を防火管理者として選任して、防火管理業務を行わせなければならない。"));
  c.push(item("⑶", "管理権原者は、防火管理者が消防計画を作成（変更）する場合、必要な指示を与えなければならない。"));
  c.push(item("⑷", "管理権原者は、防火上の建物構造の不備や消防用設備等・特殊消防用設備等の不備・欠陥が発見された場合は、速やかに改修しなければならない。"));
  if (unified) {
    c.push(item("⑸", "管理権原者は、統括防火管理者が全体についての防火管理上必要な業務を適切に遂行できるように協力する。"));
  }

  c.push(sub("２　防火管理者"));
  c.push(txt("　防火管理者は、次の業務を行うものとする。"));
  const pmDuties = [
    "消防計画の作成（変更）", "消火、通報、避難誘導などの訓練の実施",
    "火災予防上の自主検査の実施と監督", "防火対象物の法定点検の立会い",
    "消防用設備等・特殊消防用設備等の法定点検・整備及び立会い",
    "改装工事など工事中の立会い及び安全対策の策定", "火気の使用、取扱いの指導、監督",
    "収容人員の適正管理", "全従業員等に対する防災教育の実施",
    "防火管理業務従事者（火元責任者等）に対する指導、監督",
    "管理権原者への提案や報告", "放火防止対策の推進"
  ];
  const nums = ["⑴","⑵","⑶","⑷","⑸","⑹","⑺","⑻","⑼","⑽","⑾","⑿"];
  pmDuties.forEach((duty, i) => c.push(item(nums[i], duty)));

  // ===== 第3 消防機関との連絡等 =====
  c.push(pb(), sec("第３　消防機関との連絡等"));
  c.push(sub("１　消防機関へ報告、連絡する事項"));
  const w3 = [2600, 3800, 2626];
  c.push(tbl(["種別", "届出等の時期", "届出者等"], [
    ["防火管理者選任（解任）届出", "防火管理者を定めたとき、又はこれを解任したとき", "管理権原者"],
    ["消防計画作成（変更）届出", "消防計画を作成したとき、又は変更事項があったとき", "防火管理者"],
    ["訓練実施の通知", "消防訓練を実施する前", "防火管理者"],
    ["消防用設備等点検結果報告", `${reportFreq}に1回（総合点検終了後）`, "防火管理者の確認を受けた後"],
    ["防火対象物定期点検結果報告", isSpecific && d.capacity >= 300 ? "1年に1回" : "報告対象非該当", "管理権原者"],
  ], w3));

  c.push(sp(), sub("２　防火管理維持台帳の作成、整備及び保管"));
  c.push(item("⑴", "管理権原者は、消防機関へ報告した書類及び防火管理業務に必要な書類等をこの消防計画とともに取りまとめて、防火管理維持台帳を作成し、整備し、保管する。"));
  c.push(item("⑵", "転売等により管理権原者が変更となる場合は、防火管理維持台帳のうち竣工からの建築関係及び消防用設備等に関する届出書類や図面等の関係書類を確実に受け渡すものとする。"));

  // ===== 第4 火災予防上の点検・検査 =====
  c.push(pb(), sec("第４　火災予防上の点検・検査"));
  c.push(sub("１　日常の火災予防"));
  c.push(item("⑴", `防火管理者、防火担当責任者、火元責任者等が行う日常の任務は、別表２「日常の火災予防の担当者と日常の注意事項」のとおりとする。`));
  c.push(item("⑵", "別表２は全従業員等に配布し、さらに休憩室など見やすい場所に掲示する。"));

  c.push(sub("２　自主的に行う検査・点検"));
  c.push(txt("⑴　火災予防上の自主検査"));
  c.push(subitem(`ア　日常的に行う検査は、別表３及び別表４に基づき、${d.daily_checker || "防火管理者"}がチェックする。`));
  c.push(subitem(`　(ア)「火気関係」のチェックは${d.daily_check_timing}に行う。`));
  c.push(subitem(`　(イ)「閉鎖障害等」のチェックは${d.daily_check_timing}に行う。`));
  c.push(subitem(`イ　定期的に行う検査は、別表５に基づき、火元責任者がチェックする。実施時期は、${d.periodic_check_months}とする。`));

  c.push(txt("⑵　消防用設備等の自主点検"));
  c.push(subitem(`ア　自主点検は、別表６に基づき、${d.daily_checker || "防火管理者"}がチェックする。`));
  c.push(subitem(`イ　実施時期は、${d.self_check_months}とする。`));

  c.push(sub("３　法定点検"));
  c.push(item("⑴", `消防用設備等の法定点検は、${d.inspection_company}に委託して行う。`));
  c.push(item("⑵", "防火管理者は、点検実施時に立ち会うものとする。"));

  c.push(sub("４　報告等"));
  c.push(item("⑴", "自主検査、自主点検及び法定点検の実施者は、定期的に防火管理者に報告する。ただし、不備・欠陥部分がある場合は、速やかに防火管理者に報告する。"));
  c.push(item("⑵", "防火管理者は、報告された内容で不備・欠陥部分がある場合は、管理権原者に報告し改修しなければならない。"));

  // ===== 第5 厳守事項 =====
  c.push(pb(), sec("第５　厳守事項"));
  c.push(sub("１　従業員等が守るべき事項"));
  c.push(txt("⑴　全従業員等は、避難口、廊下、階段などの避難施設と防火戸、防火シャッターなどの防火設備が有効に機能するように次の事項を行わなければならない。"));
  c.push(subitem("ア　階段、廊下、通路には、物品を置かない。"));
  c.push(subitem("イ　階段等への出入口に設けられている扉の開閉を妨げるように物品が置いてある場合は、直ちに除去する。"));
  c.push(subitem("ウ　防火シャッターの降下位置又はその付近に物品が置いてある場合は、直ちに除去する。"));
  c.push(subitem("エ　上記において物品を容易に除去できない場合は、直ちに防火管理者に報告する。"));

  c.push(txt("⑵　火気管理等"));
  c.push(subitem("ア　喫煙管理について常に注意し、火気使用設備器具の自主検査と合わせて、終業時等に全員が吸い殻の点検を行う。"));
  c.push(subitem("イ　喫煙は指定された場所で行い、歩行中の喫煙は絶対に行わない。"));
  c.push(subitem("ウ　火気使用設備器具は、使用する前後に点検を行い、安全を確認する。"));
  c.push(subitem("エ　火気使用設備器具は指定された場所で使用する。"));
  c.push(subitem("オ　燃焼器具等を使用する場合は、周囲を整理整頓するとともに、可燃物に接近して使用しない。"));
  c.push(subitem("カ　危険物品は、持ち込まない、持ち込ませない。"));

  c.push(txt("⑶　放火防止対策"));
  c.push(subitem("ア　死角となる廊下、階段室、トイレ等に可燃物を置かない。"));
  c.push(subitem("イ　物置、空室、雑品倉庫等の施錠を行う。"));
  c.push(subitem("ウ　建物内外の整理整頓を行う。"));
  c.push(subitem("エ　トイレ、洗面所の巡視を定期又は不定期に行う。"));
  c.push(subitem("オ　火元責任者又は最終帰宅者による火気及び施錠の確認を行う。"));

  c.push(sub("２　防火管理者等が守るべき事項"));
  c.push(txt("⑴　収容人員の管理"));
  c.push(subitem("防火管理者は、収容能力を把握し、過剰な人員が出入りしないように管理を行う。"));
  c.push(txt("⑵　工事中の安全対策の策定"));
  c.push(subitem("ア　防火管理者は、工事を行うときは、工事中の安全対策を策定する。"));
  c.push(txt("⑶　火気の使用制限"));
  c.push(subitem("ア　喫煙場所及び喫煙禁止場所の指定"));
  c.push(subitem("イ　火気使用設備器具の使用禁止場所及び使用場所の指定"));
  c.push(subitem("ウ　危険物の貯蔵又は取扱い場所の指定"));
  c.push(subitem("エ　工事等の火気使用の禁止又は制限"));

  // ===== 第6 自衛消防隊等 =====
  c.push(pb(), sec("第６　自衛消防隊等"));
  c.push(sub("１　隊の編成"));
  c.push(txt(`　自衛消防隊の編成は別表８のとおりとし、この別表は従業員等の見やすい場所に掲示する。`));

  c.push(sub("２　自衛消防活動"));
  c.push(txt("　消火・通報・避難誘導等の担当者は、下記に示す基準により行動する。"));
  c.push(txt("⑴　通報・連絡"));
  c.push(subitem("ア　火災が発生したときには、各通報連絡担当又は火災を発見した者は、直ちに119番通報する。同時に、防災センター、警備室等や周囲の者に、火災の発生と状況を連絡する。"));
  c.push(subitem("イ　ぼやで消えた場合であっても、消防機関へ通報する。"));
  c.push(subitem(`ウ　管理権原者、防火管理者が不在のときは、緊急連絡一覧表により、管理権原者（${d.owner_name}）、防火管理者（${d.manager_name}）へ連絡する。`));
  c.push(txt("⑵　初期消火"));
  c.push(subitem("ア　初期消火担当は、出火場所に急行し、積極的に初期消火活動を行う。"));
  c.push(subitem(`イ　初期消火担当は、${d.fire_equipment.join("、")}等の適切な消防用設備等を用いて消火する。`));
  c.push(txt("⑶　避難誘導"));
  c.push(subitem("ア　避難誘導担当は、避難経路図に基づいて、避難誘導する。"));
  c.push(subitem("イ　拡声器、メガホン等を使用して落ち着いて行動するよう誘導する。"));
  c.push(subitem("ウ　避難方向が分かりにくいときは、曲がり角などに誘導員が立って、誘導する。"));
  c.push(subitem("エ　避難誘導担当は、負傷者及び逃げ遅れた者の確認を行い、自衛消防隊長に報告する。"));
  c.push(txt("⑷　安全防護"));
  c.push(subitem("ア　逃げ遅れた者がいないことを確認した後、防火戸や防火シャッターを閉鎖する。"));
  c.push(txt("⑸　応急救護"));
  c.push(subitem("ア　応急救護担当は、負傷者の応急手当を行い、救急隊と連絡を密にして、負傷者を速やかに運ぶことができるようにする。"));
  c.push(subitem("イ　応急救護担当は、負傷者の氏名、負傷程度など必要事項を記録する。"));

  c.push(sub("３　自衛消防隊の活動範囲"));
  c.push(item("⑴", "自衛消防隊の活動範囲は、当該事業所の管理範囲内とする。"));
  c.push(item("⑵", "近接する建物等からの火災で延焼を阻止する必要がある場合は、設置されている消防用設備等を有効に活用できる範囲で、自衛消防隊長の判断に基づき活動する。"));

  // ===== 第7 休日、夜間の防火管理体制 =====
  c.push(pb(), sec("第７　休日、夜間の防火管理体制"));
  const w7 = [3000, 6026];
  c.push(tbl(["項目", "内容"], [
    ["緊急連絡先 TEL", d.emergency_contact_phone],
    ["緊急連絡先 氏名", d.emergency_contact_name],
  ], w7));

  c.push(sp(), sub("１　休日、夜間に在館者がいる場合"));
  c.push(item("⑴", "休日、夜間の勤務者は、定期に巡回する等火災予防上の安全を確保する。"));
  c.push(item("⑵", "休日、夜間における自衛消防活動は、勤務している者など建物内にいる者全員で初動措置を行う。"));
  c.push(subitem("ア　火災が発生したときは、直ちに119番通報するとともに、他の勤務者に火災の発生を知らせ、さらに緊急連絡一覧表等により関係者に速やかに連絡すること。"));
  c.push(subitem("イ　全員が協力して、消火器や屋内消火栓等の適切な消防用設備等を活用して初期消火を行うとともに、防火戸などの閉鎖を行うこと。"));

  if (d.security_company) {
    c.push(sub("２　休日、夜間に無人となる場合"));
    c.push(txt(`　休日、夜間において無人となる場合は、${d.security_company}からの通報により、火災発生等の連絡を受けた防火管理者等は、直ちに現場に駆けつける。`));
  }

  // ===== 第8 地震対策 =====
  c.push(pb(), sec("第８　地震対策"));
  c.push(sub("１　日常の地震対策"));
  c.push(item("⑴", "管理権原者等は、地震時の災害を予防するため、次の事項を実施する。"));
  c.push(subitem("ア　ロッカー、自動販売機等の転倒・移動防止措置を行う。"));
  c.push(subitem("イ　窓ガラスの飛散防止措置及び看板、広告塔等の倒壊、落下及び転倒防止措置を行う。"));
  c.push(subitem("ウ　火気使用設備器具等からの出火防止措置を行う。"));
  c.push(subitem("エ　危険物等の流出、漏えい防止措置を行う。"));

  c.push(sub("２　地震後の安全措置"));
  c.push(item("⑴", "地震発生直後は、身の安全を守ることを第一とする。"));
  c.push(item("⑵", "火気使用設備器具の直近にいる従業員は、元栓・器具栓を閉止又は電源遮断を行い、各火元責任者はその状況を確認する。"));
  c.push(item("⑶", "地震動終了後、防火担当責任者等は、二次災害の発生を防止するため、建物、火気使用設備器具及び危険物施設等について点検・検査を実施し、異常が認められた場合は応急措置を行う。"));
  c.push(item("⑷", "各設備器具は、安全を確認した後、使用する。"));

  c.push(sub("３　地震時の活動"));
  c.push(txt("⑴　情報収集等"));
  c.push(subitem("ア　テレビ、ラジオ、インターネットなどにより、情報の収集を行う。"));
  c.push(subitem("イ　混乱防止を図るため、必要な情報は在館者に知らせる。"));
  c.push(txt("⑵　避難誘導等"));
  c.push(subitem("ア　在館者等を落ち着かせ、自衛消防隊長から避難命令があるまで安全な場所で待機させる。"));
  c.push(subitem(`イ　在館者を広域避難場所（${d.wide_area_evacuation_site}）に誘導するときは、順路、道路状況、地域の被害状況について説明する。`));
  if (d.temporary_assembly_point) {
    c.push(subitem(`ウ　避難は一時集合場所の${d.temporary_assembly_point}に集合し、人員確認後、避難する。`));
  }
  c.push(subitem(`${d.temporary_assembly_point ? "エ" : "ウ"}　避難には、車両等は使用せず全員徒歩とする。`));
  c.push(sp());
  c.push(txt("※京都市は津波による被害が想定されていないため、南海トラフ地震に関する計画の記載義務はありません。", { italics: true, color: "666666", size: 18 }));

  // ===== 第9 防災教育 =====
  c.push(pb(), sec("第９　防災教育"));
  c.push(sub("１　防災教育の実施時期等"));
  const w9 = [2000, 2200, 2200, 2626];
  c.push(tbl(["対象者", "実施時期", "実施回数", "実施者"], [
    ["正社員", d.education_months, "年2回", "防火管理者"],
    ["新入社員", "採用時", "採用時", "防火管理者"],
    ["アルバイト・パート", "採用時等", "必要の都度", "防火管理者"],
  ], w9));

  c.push(sp(), sub("２　自衛消防隊員等の育成"));
  c.push(txt("　管理権原者は、災害時において円滑に自衛消防活動を行うため、自衛消防隊の整備を図るとともに、自衛消防隊員の育成を推進するものとする。"));

  c.push(sub("３　防災教育の内容"));
  c.push(subitem("ア　消防計画について（全従業員等が守るべき事項、火災発生時の対応及び地震時の対応）"));
  c.push(subitem("イ　その他火災予防上必要な事項"));

  // ===== 第10 訓練 =====
  c.push(pb(), sec("第10　訓練"));
  c.push(sub("１　訓練の実施時期等"));
  const w10 = [3000, 3026, 3000];
  c.push(tbl(["訓練の種別", "実施時期", "備考"], [
    ["部分訓練（消火、通報、避難訓練等）", `おおむね${d.drill_months}`, drillReq],
    ["総合訓練", `おおむね${d.drill_months}`, ""],
  ], w10));

  c.push(sp(), item("⑴", "防火管理者は、訓練指導者を指定して、訓練の実施に当たらせる。"));
  c.push(item("⑵", "防火管理者は訓練を実施しようとするとき、あらかじめその旨を消防機関へ通報する。"));

  c.push(sub("２　訓練時の安全対策"));
  c.push(txt("　訓練指導者は訓練時における自衛消防隊員の事故防止等を図るため、次の安全管理を実施する。"));
  c.push(item("⑴", "訓練実施前：訓練に使用する施設、資器材及び設備等は、必ず事前に点検を実施する。"));
  c.push(item("⑵", "訓練実施時：使用資器材及び訓練施設等に異常を認めた場合は、直ちに訓練を中止するとともに必要な措置等を講じること。"));
  c.push(item("⑶", "訓練終了後：使用資器材収納時には、十分に安全を確保させる。"));

  c.push(sub("３　訓練の実施結果"));
  c.push(txt("　防火管理者は、消防訓練終了後直ちに実施結果について検討し、別表９「消防訓練実施結果表」に記録し、以後の訓練に反映させるものとする。"));

  // ===== 附則 =====
  c.push(pb(), sec("附　則"));
  c.push(txt(`この計画は、${d.creation_date}から施行する。`));

  // ===== 別表一覧（目次）=====
  c.push(pb(), sec("別表等一覧"));
  const appendixList = [
    ["別表１", "防火管理業務の一部委託状況表", outsourced ? "該当" : "非該当"],
    ["別表２", "日常の火災予防の担当者と日常の注意事項", "必須"],
    ["別表３", "自主検査チェック表（日常）「火気関係」", "必須"],
    ["別表４", "自主検査チェック表（日常）「閉鎖障害等」", "必須"],
    ["別表５", "自主検査チェック表（定期）", "必須"],
    ["別表６", "消防用設備等自主点検チェック表", "必須"],
    ["別表７", "消防用設備等の法定点検実施計画", "必須"],
    ["別表８", "自衛消防隊編成表", "必須"],
    ["別表９", "消防訓練実施結果表", "必須"],
  ];
  c.push(tbl(["番号", "名称", "必要性"], appendixList, [1500, 5526, 2000]));

  return c;
}

// ========== EXECUTE ==========
function build(inputData) {
  const children = generateKyotoPlan(inputData);
  const doc = new Document({
    styles: {
      default: { document: { run: { font: "游明朝", size: 21 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "游ゴシック" },
          paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "游ゴシック" },
          paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      headers: {
        default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: `${inputData.building_name}　消防計画`, size: 16, font: "游ゴシック", color: "999999" })] })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
          children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "游ゴシック" })] })] })
      },
      children
    }]
  });
  return Packer.toBuffer(doc);
}

// --- Run with sample data ---
const sampleData = {
  building_name: "サンプルビル", company_name: "○○株式会社",
  building_address: "京都市中京区○○通○○町123", building_use: "飲食店", use_category: "3項ロ",
  is_specific_use: true, total_area: 350, num_floors: 3, capacity: 80,
  management_scope: "建物全体", is_unified_management: false, has_outsourced_management: false,
  outsource_company: "", owner_name: "京都 太郎", manager_name: "消防 花子",
  manager_qualification: "甲種", manager_appointment_date: "令和6年4月1日", manager_contact: "075-000-1234",
  fire_equipment: ["消火器", "自動火災報知設備", "誘導灯"],
  inspection_company: "○○防災設備株式会社", security_company: "",
  daily_checker: "防火管理者", daily_check_timing: "毎日終業時",
  periodic_check_months: "4月と10月", self_check_months: "1月と7月",
  emergency_contact_name: "京都 太郎", emergency_contact_phone: "090-0000-1234",
  wide_area_evacuation_site: "京都市中京区○○町 ○○公園", temporary_assembly_point: "ビル北側駐車場",
  drill_months: "4月・10月", education_months: "4月・10月", creation_date: "令和7年4月1日"
};

build(sampleData).then(buf => {
  fs.writeFileSync("/mnt/user-data/outputs/kyoto_shobo_keikaku_full.docx", buf);
  console.log("OK: kyoto_shobo_keikaku_full.docx");
});

module.exports = { generateKyotoPlan, build };
