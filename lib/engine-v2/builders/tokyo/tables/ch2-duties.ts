import { Paragraph, Table, TextRun } from "docx";
import { tokyoTable } from "../../shared/table-helpers";

/**
 * 第2章 §3 防火管理者の業務 table (2×5).
 * v1: lib/generate_tokyo_full.js:297-306.
 * Tokyo-unique — kyoto ch2 has no table.
 */
export function buildCh2DutiesTable(): (Paragraph | Table)[] {
  return [
    new Paragraph({
      spacing: { after: 60 },
      children: [new TextRun({ text: "　防火管理者は、次の業務を行う。", size: 21, font: "游明朝" })],
    }),
    tokyoTable(
      ["業務区分", "内容"],
      [
        ["点検・監督業務", "火災予防上の自主検査・点検の実施及び監督、地震による被害軽減のための自主点検、火気の使用取扱いの指導監督"],
        ["教育・訓練業務", "従業員に対する防火の教育の実施、消火・通報・避難誘導などの訓練の実施及び結果の検討、放火防止対策の推進"],
        ["管理業務", "収容人員の管理、消防機関への届出及び連絡等、家具等の転倒・落下・移動防止措置"],
        ["点検立会業務", "消防用設備等の法定点検・整備の立会い、建物等の定期検査の立会い、改装工事などの立会いと安全対策の樹立"],
        ["提案・報告業務", "防火管理業務を遂行する上での提案、点検・検査の結果についての報告"],
      ],
      [2800, 6226]
    ),
  ];
}
