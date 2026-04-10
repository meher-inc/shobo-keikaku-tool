// lib/sample_data_kyoto.js
// plan.todokede.jp サンプルPDF生成用の架空事業者データ
module.exports = {
  company_name: "株式会社サンプル防災商事",
  representative_name: "見本 太郎",
  address: "京都府架空市サンプル区見本町1-2-3 サンプルビル3F・4F",
  phone: "075-XXX-XXXX",
  building_name: "Dining Bar SAMPLE",
  business_type: "飲食店(ダイニングバー)",
  total_floor_area: 320,
  floors: "地上6階建てのうち3F・4F部分",
  capacity: 75,
  business_hours: "17:00〜翌2:00",
  jurisdiction: "京都市消防局 中京消防署",

  fire_manager_name: "例示 花子",
  fire_manager_qualification: "甲種防火管理者",
  fire_manager_cert_no: "XXXXXX-XXXXXX",
  fire_manager_appointed_date: "2025年4月1日",

  has_outsourced_management: false,
  include_appendix: true,

  // 自衛消防隊
  squad_leader: "例示 花子(店長)",
  squad_vice_leader: "試作 次郎(副店長)",
  squad_notification: ["ホールスタッフA", "ホールスタッフB"],
  squad_extinguish: ["キッチンスタッフA", "キッチンスタッフB", "キッチンスタッフC"],
  squad_evacuation: ["ホールスタッフC", "ホールスタッフD", "ホールスタッフE"],
  squad_firstaid: ["ホールスタッフF", "キッチンスタッフD"],
  night_staff_count: 4,

  // 設備
  equipment: {
    auto_fire_alarm: true,
    indoor_hydrant: true,
    guidance_light: true,
    evacuation_tool: "緩降機(4F設置)",
    fire_extinguisher: "各フロア3本",
    kitchen_hood_extinguisher: true,
    gas_leak_alarm: true,
  },
};