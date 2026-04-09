const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, HeadingLevel, AlignmentType, BorderStyle, WidthType,
        ShadingType, PageBreak, PageNumber } = require("docx");

// ========== TOKYO FIRE DEPARTMENT PLAN GENERATOR ==========
// Based on: 東京消防庁 中規模用消防計画作成例
// Source: https://www.tfd.metro.tokyo.lg.jp/drs/ss_jirei.html

const W = 9026;
const border = { style: BorderStyle.SINGLE, size: 1, color: "888888" };
const borders = { top: border, bottom: border, left: border, right: border };
const cm = { top: 60, bottom: 60, left: 100, right: 100 };
const hdrFill = { fill: "C41E3A", type: ShadingType.CLEAR };
const altFill = { fill: "FFF5F5", type: ShadingType.CLEAR };

function sec(t) { return new Paragraph({ spacing: { before: 480, after: 200 }, children: [new TextRun({ text: t, bold: true, size: 28, font: "游ゴシック" })] }); }
function sub(t) { return new Paragraph({ spacing: { before: 300, after: 120 }, children: [new TextRun({ text: t, bold: true, size: 24, font: "游ゴシック" })] }); }
function txt(t, o = {}) { return new Paragraph({ spacing: { after: 60 }, indent: o.indent ? { left: o.indent } : undefined, children: [new TextRun({ text: t, size: 21, font: "游明朝", ...o })] }); }
function item(n, t) { return txt(`${n}　${t}`); }
function si(t) { return txt(`　${t}`, { indent: 420 }); }
function pb() { return new Paragraph({ children: [new PageBreak()] }); }
function sp() { return new Paragraph({ spacing: { after: 40 }, children: [] }); }

function row(cells, widths, isH = false) {
  return new TableRow({ children: cells.map((c, i) => new TableCell({
    borders, margins: cm, verticalAlign: "center",
    width: { size: widths[i], type: WidthType.DXA },
    shading: isH ? hdrFill : (i === 0 ? altFill : undefined),
    children: [new Paragraph({ children: [new TextRun({ text: c, size: isH ? 19 : 20, font: "游ゴシック", bold: isH, color: isH ? "FFFFFF" : "000000" })] })]
  })) });
}
function tbl(h, rs, w) {
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: w, rows: [row(h, w, true), ...rs.map(r => row(r, w))] });
}

function generateTokyoPlan(d) {
  const isSpecific = d.is_specific_use;
  const reportFreq = isSpecific ? "1年" : "3年";
  const drillReq = isSpecific ? "年2回以上" : "消防計画に定めた回数";
  const unified = d.is_unified_management;
  const outsourced = d.has_outsourced_management;
  const c = [];

  // 表紙
  c.push(
    new Paragraph({ spacing: { before: 4000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: d.building_name, size: 36, bold: true, font: "游ゴシック" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: "消防計画", size: 56, bold: true, font: "游ゴシック" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300 }, children: [new TextRun({ text: "【中規模用】", size: 24, font: "游ゴシック", color: "C41E3A" })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: `${d.creation_date}作成`, size: 22, font: "游明朝" })] }),
    pb()
  );

  // === 第1 目的及び適用範囲等 ===
  c.push(sec("第１　目的及び適用範囲等"));
  c.push(sub("１　目的"));
  c.push(txt("　この計画は、管理権原の及ぶ範囲における防火管理についての必要事項を定め、火災を予防するとともに、火災、地震その他の災害等による人命の安全及び被害の軽減を図ることを目的とする。"));
  c.push(sub("２　適用範囲"));
  c.push(item("⑴", `管理権原の及ぶ範囲は、${d.management_scope || d.building_name + "の全体"}とする。`));
  c.push(item("⑵", "この計画を適用する者の範囲は、管理権原者、防火管理者及びその他勤務する者とする。"));

  if (outsourced) {
    c.push(sub("３　防火・防災管理業務の一部委託について"));
    c.push(item("⑴", "この計画は、委託を受けて防火・防災管理業務に従事する者（以下「受託者」という。）についても適用する。"));
    c.push(item("⑵", "防火管理業務の一部委託状況は、別表１「防火・防災管理業務の一部委託状況表」のとおり"));
    c.push(item("⑶", "管理権原者は、別表２「防火・防災管理業務一部委託契約書等の内容チェック表」により委託契約内容等の自己チェックを行う。"));
    c.push(item("⑷", "受託者は、この計画に定めるところにより、管理権原者、防火管理者、自衛消防隊長等の指示、指揮命令の下に適正に業務を実施する。"));
    c.push(item("⑸", "受託者は、受託した防火・防災管理業務について、定期に防火管理者に報告する。"));
  }

  // === 第2 管理権原者の責任及び防火管理者の業務 ===
  c.push(pb(), sec("第２　管理権原者の責任及び防火管理者の業務"));
  c.push(sub("１　管理権原者"));
  c.push(item("⑴", "管理権原の及ぶ範囲の防火管理業務について、全ての責任を持つ。"));
  c.push(item("⑵", "廊下、階段等の避難上必要な施設において、避難の支障となる物件及び防火戸等の閉鎖の支障となる物件を放置等されないように管理する。"));
  c.push(item("⑶", "防火上の建物構造の不備や消防用設備等の不備欠陥が発見された場合、速やかに改修する。"));
  c.push(item("⑷", "火災、地震その他の災害等が発生した場合の自衛消防活動の全般についての責任を負う。"));
  if (unified) {
    c.push(item("⑸", "統括防火管理者が作成する全体についての消防計画とこの消防計画は適合する内容にする。"));
  }

  c.push(sub("２　資格管理"));
  c.push(txt("　管理権原者は、防火管理業務を行う上で必要となる各種法定資格について不備が生じないよう管理する。"));

  c.push(sub("３　防火管理者の業務"));
  c.push(txt("　防火管理者は、次の業務を行う。"));
  const w2 = [2800, 6226];
  c.push(tbl(["業務区分", "内容"], [
    ["点検・監督業務", "火災予防上の自主検査・点検の実施及び監督、地震による被害軽減のための自主点検、火気の使用取扱いの指導監督"],
    ["教育・訓練業務", "従業員に対する防火の教育の実施、消火・通報・避難誘導などの訓練の実施及び結果の検討、放火防止対策の推進"],
    ["管理業務", "収容人員の管理、消防機関への届出及び連絡等、家具等の転倒・落下・移動防止措置"],
    ["点検立会業務", "消防用設備等の法定点検・整備の立会い、建物等の定期検査の立会い、改装工事などの立会いと安全対策の樹立"],
    ["提案・報告業務", "防火管理業務を遂行する上での提案、点検・検査の結果についての報告"],
  ], w2));

  // === 第3 火災予防のための点検・検査 ===
  c.push(pb(), sec("第３　火災予防のための点検・検査"));
  c.push(sub("１　日常の火災予防のための任務分担"));
  c.push(item("⑴", "防火管理者、防火担当責任者、火元責任者が行う日常の任務は、別表３「日常の火災予防の担当者と日常の注意事項」のとおりとする。"));
  c.push(item("⑵", "管理権原者又は防火管理者は、別表３を関係する従業員に周知し、見やすい場所に掲示する。"));

  c.push(sub("２　自主的に行う点検・検査"));
  c.push(item("⑴", `出火防止、避難安全の確認は、検査実施者（${d.daily_checker || "防火管理者"}）により、毎日行う。`));
  c.push(si("ア　出火防止の確認は、別表４-１の「自主検査チェック表（火気関係）」により行う。"));
  c.push(si("イ　避難安全等の確認は、別表４-２の「自主検査チェック表（閉鎖障害等）」により行う。"));
  c.push(item("⑵", `建物及び消防用設備等の確認は、${d.periodic_check_months}頃に行う。`));

  c.push(sub("３　消防用設備等の法定点検"));
  c.push(item("⑴", `消防用設備等の法定点検は、法令に規定される期限内に報告できるよう計画的に実施する。`));
  c.push(item("⑵", "防火管理者は法定点検実施時に立ち会い、不備欠陥箇所を確認する。"));

  // === 第4 守らなければならないこと ===
  c.push(pb(), sec("第４　守らなければならないこと"));
  c.push(sub("１　従業員が守るべき事項"));
  c.push(txt("⑴　避難施設の維持管理"));
  ["避難施設に物品等を置かない。発見した場合は直ちに除去する。",
   "避難施設の出入口の扉等の開閉障害となる物品等を置かない。",
   "防火設備は、常時閉鎖又は作動できるようにその機能を有効に保持する。",
   "避難口等に設ける戸は、容易に解錠し開放できるように維持する。",
   "避難施設の床面は避難に際し、つまずき、すべり等を生じないよう維持する。"
  ].forEach((t, i) => c.push(si(`${"①②③④⑤"[i]}　${t}`)));

  c.push(txt("⑵　火気管理等"));
  ["喫煙は、指定された場所で行い、確実に吸殻を処理する。",
   "火気設備・器具は、使用する前後に点検を行い、周囲を整理整頓して安全を確認する。",
   "厨房機器やその周囲は毎日こまめに点検・清掃する。",
   "防火ダンパーや自動消火装置は正常に作動するように整備・清掃する。",
   "ガス機器を使用中はその場を離れない。離れるときは火を消す。",
   "危険物品は持ち込まない、持ち込ませない。"
  ].forEach((t, i) => c.push(si(`${"①②③④⑤⑥"[i]}　${t}`)));

  c.push(txt("⑶　放火防止対策"));
  ["死角となる廊下、階段室、トイレ等に可燃物を置かない。また、これらの場所の巡視を行う。",
   "建物内外の整理整頓を行う。",
   "物置、空室、雑品倉庫等の施錠を行う。",
   "火元責任者又は最終帰宅者による火気及び施錠の確認を行う。"
  ].forEach((t, i) => c.push(si(`${"①②③④"[i]}　${t}`)));

  c.push(sub("２　防火管理者等が守るべき事項"));
  c.push(txt("⑴　収容人員の管理"));
  c.push(si("防火管理者は、用途、規模に応じた収容能力を把握し、過剰な人員が出入りしないように管理する。"));
  c.push(txt("⑵　工事中の安全対策の樹立"));
  c.push(si("防火管理者は、工事を行うときは、工事内容、期間、施工方法等を確認し、安全対策を策定する。"));
  c.push(txt("⑶　火気の使用制限"));
  c.push(si("防火管理者は、喫煙場所及び禁止場所、火気設備器具の使用場所、危険物の取扱い場所を指定する。"));
  c.push(txt("⑷　臨時の火気使用等"));
  c.push(si("使用の都度、防火管理者の承認を受け、火気使用にあたっては周囲を整理し消火器等を準備する。"));
  c.push(txt("⑸　避難経路等の周知"));
  c.push(si("防火管理者は、避難経路図を作成し、従業員及び施設利用者の見やすい箇所に掲出する。"));

  // === 第5 防火・防災教育 ===
  c.push(pb(), sec("第５　防火・防災教育"));
  c.push(sub("１　防火・防災教育の実施時期等"));
  const w5 = [2000, 2200, 2200, 2626];
  c.push(tbl(["対象者", "実施時期", "実施回数", "実施者"], [
    ["正社員", d.education_months, "年2回", "防火管理者"],
    ["新入社員", "採用時", "採用時", "防火管理者"],
    ["アルバイト等", "採用時等", "必要の都度", "教育担当者等"],
  ], w5));
  c.push(sp(), sub("２　自衛消防隊員等の育成"));
  c.push(txt("　管理権原者は、災害時において円滑に自衛消防活動を行うため、自衛消防隊の整備を図るとともに、自衛消防隊員の育成を推進するものとする。"));

  // === 第6 消防機関との連絡等 ===
  c.push(pb(), sec("第６　消防機関との連絡等"));
  c.push(sub("１　消防機関へ連絡等する事項"));
  const w6 = [2600, 3800, 2626];
  c.push(tbl(["種別", "届出等の時期", "届出者等"], [
    ["防火管理者選任（解任）届出", "防火管理者を定め又は解任したとき", "管理権原者"],
    ["消防計画作成（変更）届出", "消防計画を作成又は変更したとき", "防火管理者"],
    ["訓練実施の通知", "消防訓練を実施する前", "防火管理者"],
    ["消防用設備等点検結果報告", `${reportFreq}に1回`, "防火管理者の確認後"],
  ], w6));
  c.push(sp(), sub("２　防火管理維持台帳の作成、整備及び保管"));
  c.push(txt("　管理権原者は、消防機関へ報告した書類及び防火管理業務に必要な書類等を防火管理維持台帳として整備、保管する。"));

  // === 第7 自衛消防隊等 ===
  c.push(pb(), sec("第７　自衛消防隊等"));
  c.push(sub("Ａ　事業所自衛消防隊を編成する場合"));
  c.push(sub("１　事業所自衛消防隊の編成"));
  c.push(txt("　自衛消防隊の編成は別表７のとおりとする。"));
  c.push(sub("２　事業所自衛消防隊の活動範囲"));
  c.push(txt("　自衛消防隊の活動範囲は、当該事業所の管理範囲内とする。"));
  c.push(sub("３　事業所自衛消防隊長等の権限"));
  c.push(txt("　自衛消防隊長は、自衛消防隊を指揮監督し、自衛消防活動の全般に当たる。"));
  c.push(sub("４　火災発生時の自衛消防活動"));
  c.push(txt("⑴　通報・連絡"));
  c.push(si("火災が発生したときは、直ちに119番通報するとともに、周囲に火災の発生を知らせる。"));
  c.push(txt("⑵　初期消火"));
  c.push(si(`${d.fire_equipment.join("、")}等の消防用設備等を使用して初期消火を行う。`));
  c.push(txt("⑶　避難誘導"));
  c.push(si("避難誘導担当は、避難経路に基づき避難誘導を行い、逃げ遅れた者の確認を行う。"));
  c.push(txt("⑷　安全防護・応急救護"));
  c.push(si("防火戸等の閉鎖、負傷者の応急手当を行う。"));
  c.push(txt("⑸　消防隊への情報提供"));
  c.push(si("消防隊に対し、火災発見の状況、延焼状況等を報告し、出火場所への誘導を行う。"));

  c.push(sub("５　営業時間外等の自衛消防活動体制"));
  c.push(tbl(["項目", "内容"], [
    ["緊急連絡先 TEL", d.emergency_contact_phone],
    ["緊急連絡先 氏名", d.emergency_contact_name],
  ], [3000, 6026]));

  // === 第8 訓練 ===
  c.push(pb(), sec("第８　訓練"));
  c.push(sub("１　訓練の実施時期等"));
  c.push(tbl(["訓練の種別", "実施時期", "備考"], [
    ["部分訓練（消火、通報、避難訓練等）", `おおむね${d.drill_months}`, drillReq],
    ["総合訓練", `おおむね${d.drill_months}`, ""],
  ], [3000, 3026, 3000]));
  c.push(sp());
  c.push(item("⑴", "防火管理者は、訓練指導者を指定して訓練を実施させる。"));
  c.push(item("⑵", "訓練を実施するときは、あらかじめ消防機関へ通報する。"));
  c.push(sub("２　訓練時の安全対策"));
  c.push(txt("　訓練使用施設・資器材の事前点検、異常時の即時中止、終了後の安全確保を行う。"));
  c.push(sub("３　訓練の実施結果"));
  c.push(txt("　防火管理者は、訓練終了後に結果を検討・記録し、以後の訓練に反映させる。"));

  // === 第9 震災対策 ★東京独自の充実内容★ ===
  c.push(pb(), sec("第９　震災対策"));
  c.push(sub("１　震災に備えての事前計画"));
  c.push(item("⑴", "家具、什器等の転倒・落下・移動防止措置を行う（別表８）。"));
  c.push(item("⑵", "窓ガラスの飛散防止措置を行う。"));
  c.push(item("⑶", "火気使用設備器具等からの出火防止措置を行う。"));
  c.push(item("⑷", "一斉帰宅抑制のための備蓄を行う（別表９）。"));
  c.push(item("⑸", "震災時における時差退社計画を策定する（別表10）。"));

  c.push(sub("２　震災時の活動計画"));
  c.push(item("⑴", "地震発生直後は、身の安全を守ることを第一とする。"));
  c.push(item("⑵", "火気使用設備器具の元栓・器具栓を閉止又は電源遮断を行う。"));
  c.push(item("⑶", "建物の安全点検を別表11「施設の安全点検のためのチェックリスト」により実施する。"));
  c.push(item("⑷", `広域避難場所（${d.wide_area_evacuation_site}）への誘導計画を実施する。`));
  c.push(item("⑸", "テレビ、ラジオ、インターネット等により情報収集を行い、在館者に必要な情報を提供する。"));

  c.push(sub("３　施設再開までの復旧計画"));
  c.push(item("⑴", "管理権原者は、建物の被害状況を把握し、使用可否を判断する。"));
  c.push(item("⑵", "ガスの元栓及び電気のブレーカーを遮断し、再供給時の出火防止を図る。"));
  c.push(item("⑶", "事業再開時には、火気使用設備器具の破損状況を検査し、安全を確認した上で使用を再開する。"));

  // === 第10 その他の災害対策 ★東京独自★ ===
  c.push(pb(), sec("第10　その他の災害対策"));
  c.push(sub("１　大規模テロ等に伴う災害に係る自衛消防対策"));
  c.push(txt("　爆発物、化学剤、生物剤等による災害が発生した場合は、次の措置を講じる。"));
  c.push(item("⑴", "異常を発見した場合は、直ちに119番通報及び110番通報する。"));
  c.push(item("⑵", "不審物には絶対に触れず、速やかに建物外へ避難する。"));
  c.push(item("⑶", "化学剤等の散布が疑われる場合は、ハンカチ等で口と鼻を覆い、風上に避難する。"));

  c.push(sub("２　大雨・強風等に係る自衛消防対策"));
  c.push(item("⑴", "台風接近時は、気象情報を確認し、必要に応じて早期退社等の措置を講じる。"));
  c.push(item("⑵", "浸水のおそれがある場合は、土のう等による浸水防止措置を行う。"));
  c.push(item("⑶", "強風時は、看板・広告物等の飛散防止措置を行う。"));

  c.push(sub("３　受傷事故等の自衛消防対策"));
  c.push(item("⑴", "事故等により負傷者が発生した場合は、応急手当を行うとともに、119番通報する。"));
  c.push(item("⑵", "AED等の救命器具の設置場所と使用方法を全従業員に周知する。"));

  // === 第11 その他 ===
  c.push(sec("第11　その他"));
  c.push(txt("　消防計画概要版を作成し、従業員に周知するために掲示、活用する。"));

  // === 帰宅困難者対策 ★東京独自★ ===
  c.push(pb(), sec("（追加）帰宅困難者対策"));
  c.push(txt("　大規模地震等により公共交通機関が停止した場合の帰宅困難者対策として、次の事項を定める。", { italics: true }));
  c.push(sub("１　一斉帰宅の抑制"));
  c.push(item("⑴", "大規模地震発生時、従業員等は原則として事業所内に留まる。"));
  c.push(item("⑵", "従業員等の安否確認は、災害用伝言ダイヤル等を活用して行う。"));
  c.push(sub("２　備蓄"));
  c.push(item("⑴", "従業員等の3日分の水・食料・毛布等を備蓄する（別表９）。"));
  c.push(item("⑵", "備蓄品は定期的に点検し、消費期限等を管理する。"));
  c.push(sub("３　時差退社"));
  c.push(txt("　交通機関の運行状況を確認の上、時差退社計画（別表10）に基づき段階的に帰宅させる。"));

  // 附則
  c.push(pb(), sec("附　則"));
  c.push(txt(`この計画は、${d.creation_date}から施行する。`));

  // 別表一覧
  c.push(pb(), sec("別表等一覧"));
  c.push(tbl(["番号", "名称", "法的根拠"], [
    ["別表１", "防火・防災管理業務の一部委託状況表", "▲"],
    ["別表２", "委託契約書等の内容チェック表", "▲"],
    ["別表３", "日常の火災予防の担当者と注意事項", "◎"],
    ["別表４-1", "自主検査チェック表（火気関係）", "◎"],
    ["別表４-2", "自主検査チェック表（閉鎖障害等）", "◎"],
    ["別表５", "自主検査チェック表（定期）", "◎"],
    ["別表６", "自主点検チェック表（消防用設備等）", "◎"],
    ["別表７", "自衛消防隊の編成と任務", "◎"],
    ["別表８", "転倒・落下・移動防止対策チェック表", "○"],
    ["別表９", "帰宅困難者対策の備蓄一覧", "○"],
    ["別表10", "時差退社計画", "○"],
    ["別表11", "施設安全点検チェックリスト", "○"],
    ["別図", "避難経路図", "◎"],
    ["別添え", "消防計画概要", "▲"],
  ], [1500, 5000, 1526]));
  c.push(sp(), txt("◎:消防法第8条 ○:東京都震災対策条例 ●:火災予防条例 ▲:該当時", { size: 18, color: "666666" }));

  return c;
}

function buildTokyo(d) {
  const children = generateTokyoPlan(d);
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
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: `${d.building_name}　消防計画（東京消防庁様式）`, size: 16, font: "游ゴシック", color: "999999" })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
        children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "游ゴシック" })] })] }) },
      children
    }]
  });
  return Packer.toBuffer(doc);
}

// --- Run ---
const sample = {
  building_name: "○○ビル", building_address: "東京都千代田区○○町1-2-3",
  building_use: "事務所", use_category: "15項", is_specific_use: false,
  total_area: 800, num_floors: 5, capacity: 120,
  management_scope: "○○ビルの3階部分", is_unified_management: true,
  has_outsourced_management: true, outsource_company: "○○警備株式会社",
  owner_name: "東京 太郎", manager_name: "防火 花子",
  manager_qualification: "甲種", daily_checker: "防火管理者",
  periodic_check_months: "5月と11月", fire_equipment: ["消火器", "屋内消火栓", "自動火災報知設備", "誘導灯", "避難器具"],
  inspection_company: "○○防災株式会社", security_company: "○○警備株式会社",
  emergency_contact_name: "東京 太郎", emergency_contact_phone: "03-0000-1234",
  wide_area_evacuation_site: "千代田区○○ ○○公園", temporary_assembly_point: "ビル正面駐車場",
  drill_months: "5月・11月", education_months: "4月・10月", creation_date: "令和7年4月1日"
};

buildTokyo(sample).then(buf => {
  fs.writeFileSync("/mnt/user-data/outputs/tokyo_shobo_keikaku_full.docx", buf);
  console.log("OK: tokyo_shobo_keikaku_full.docx");
});

module.exports = { generateTokyoPlan, buildTokyo };
