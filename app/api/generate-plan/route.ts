// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

// Dynamic import to handle CommonJS modules
async function getGenerators() {
  const kyoto = require("../../../lib/generate_kyoto_full");
  const tokyo = require("../../../lib/generate_tokyo_full");
  return { buildKyoto: kyoto.build, buildTokyo: tokyo.buildTokyo };
}

const USE_SPECIFIC: Record<string, boolean> = {
  "1-イ": true, "1-ロ": true, "2-イ": true, "2-ロ": true,
  "3-イ": true, "3-ロ": true, "4": true, "5-イ": true,
  "6-イ": true, "6-ロ": true, "6-ハ": true, "9-イ": true, "16-イ": true,
};

function transformFormData(raw: any) {
  return {
    building_name: raw.building_name || "ビル名未設定",
    company_name: raw.company_name || raw.building_name || "",
    building_address: `${raw.prefecture || ""}${raw.city || ""}${raw.ward || ""}${raw.address_detail || ""}`,
    building_use: raw.building_use || "",
    use_category: raw.use_category || "",
    is_specific_use: USE_SPECIFIC[raw.use_category] || false,
    total_area: Number(raw.total_area) || 0,
    num_floors: Number(raw.num_floors) || 0,
    capacity: Number(raw.capacity) || 0,
    management_scope: raw.management_scope || "建物全体",
    is_unified_management: raw.is_unified_management || false,
    has_outsourced_management: raw.has_outsource || false,
    outsource_company: raw.outsource_company || "",
    owner_name: raw.owner_name || "",
    manager_name: raw.manager_name || "",
    manager_qualification: raw.manager_qual || "甲種",
    manager_appointment_date: raw.manager_date || "",
    manager_contact: raw.manager_tel || "",
    fire_equipment: raw.equipment || ["消火器"],
    inspection_company: raw.inspection_company || "点検業者未設定",
    security_company: raw.security_company || "",
    daily_checker: "防火管理者",
    daily_check_timing: raw.daily_check || "毎日終業時",
    periodic_check_months: raw.periodic_months || "4月と10月",
    self_check_months: raw.self_check_months || "1月と7月",
    emergency_contact_name: raw.emergency_name || "",
    emergency_contact_phone: raw.emergency_tel || "",
    wide_area_evacuation_site: raw.evacuation_site || "指定避難場所",
    temporary_assembly_point: raw.assembly_point || "",
    drill_months: raw.drill_months || "4月・10月",
    education_months: raw.education_months || "4月・10月",
    creation_date: new Date().toLocaleDateString("ja-JP-u-ca-japanese", {
      era: "long", year: "numeric", month: "long", day: "numeric"
    }),
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    const inputData = transformFormData(formData);
    const { buildKyoto, buildTokyo } = await getGenerators();

    // Select generator based on location
    let generator = buildKyoto;
    let deptName = "標準様式";

    if (formData.city === "京都市") {
      generator = buildKyoto;
      deptName = "京都市消防局";
    } else if (formData.prefecture === "東京都") {
      generator = buildTokyo;
      deptName = "東京消防庁";
    }

    const buffer = await generator(inputData);

    const filename = encodeURIComponent(`消防計画_${inputData.building_name}_${deptName}.docx`);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "生成エラー", message: "消防計画の生成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
