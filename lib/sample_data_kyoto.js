// plan.todokede.jp サンプルPDF生成用 架空事業者データ
module.exports = {
  // 建物情報
  building_name: "サンプルビル",
  company_name: "株式会社サンプル防災商事",
  building_address: "京都府架空市サンプル区見本町1-2-3",
  building_use: "飲食店(ダイニングバー)",
  use_category: "3項ロ",
  is_specific_use: true,
  total_area: 320,
  num_floors: 6,
  capacity: 75,

  // 管理形態
  management_scope: "3階・4階部分(Dining Bar SAMPLE)",
  is_unified_management: false,
  has_outsourced_management: false,
  outsource_company: "",

  // 管理権原者・防火管理者
  owner_name: "見本 太郎",
  manager_name: "例示 花子",
  manager_qualification: "甲種",
  manager_appointment_date: "令和7年4月1日",
  manager_contact: "075-XXX-XXXX",

  // 消防用設備
  fire_equipment: [
    "消火器",
    "自動火災報知設備",
    "誘導灯",
    "避難器具(緩降機)",
    "厨房フード用簡易消火装置",
    "ガス漏れ警報器",
  ],
  inspection_company: "サンプル防災設備株式会社",
  security_company: "",

  // 日常点検・定期点検
  daily_checker: "防火管理者",
  daily_check_timing: "開店前・閉店後",
  periodic_check_months: "4月と10月",
  self_check_months: "1月と7月",

  // 緊急連絡
  emergency_contact_name: "見本 太郎",
  emergency_contact_phone: "090-XXXX-XXXX",

  // 避難
  wide_area_evacuation_site: "架空市サンプル区 見本公園",
  temporary_assembly_point: "サンプルビル北側駐車場",

  // 訓練・教育
  drill_months: "4月・10月",
  education_months: "4月・10月",

  // 作成日
  creation_date: "令和8年4月1日",

  // ★重要★ 別表を出力するためのフラグ
  include_appendix: true,
};
