// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";

// Determine if use category is "specific" (特定防火対象物)
const SPECIFIC_USES = new Set([
  "1-イ", "2-イ", "3-イ", "3-ロ", "4", "5-イ",
  "6-イ", "6-ロ", "16-イ",
]);

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const engine = url.searchParams.get("engine");
    const form = await request.json();

    // v2 experimental path — 完全に隔離。クエリなし時は1行も到達しない。
    if (engine === "v2") {
      const packParam = url.searchParams.get("pack");
      const { runV2Adapter } = await import("../../../lib/engine-v2/adapters/generate-plan");
      const packOpts = packParam === "full" || packParam === "tokyo-full"
        ? { pack: packParam as "full" | "tokyo-full" }
        : {};
      const buffer = await runV2Adapter(form, packOpts);
      const filePrefix = packParam === "full" ? "v2full" : packParam === "tokyo-full" ? "v2tokyo" : "v2sample";
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`消防計画_${filePrefix}_${form.building_name || "untitled"}.docx`)}`,
        },
      });
    }

    const plan = form.plan || "standard";

    // Map form fields → generator input format
    const isSpecific = SPECIFIC_USES.has(form.use_category || "");
    const address = [form.prefecture, form.city, form.ward, form.address_detail]
      .filter(Boolean).join("");

    const inputData = {
      // 建物情報
      building_name: form.building_name || "",
      company_name: form.building_name || "",
      building_address: address,
      building_use: form.use_category || "",
      use_category: form.use_category || "",
      is_specific_use: isSpecific,
      total_area: Number(form.total_area) || 0,
      num_floors: Number(form.num_floors) || 0,
      capacity: Number(form.capacity) || 0,

      // 管理
      management_scope: "建物全体",
      is_unified_management: false,
      has_outsourced_management: form.has_outsource === true || form.has_outsource === "true",
      outsource_company: form.outsource_company || "",

      // 管理者
      owner_name: form.owner_name || "",
      manager_name: form.manager_name || "",
      manager_qualification: form.manager_qual || "甲種",
      manager_appointment_date: form.manager_date || "",
      manager_contact: form.manager_tel || "",

      // 設備
      fire_equipment: Array.isArray(form.equipment) ? form.equipment : JSON.parse(form.equipment || "[]"),
      inspection_company: form.inspection_company || "（未定）",
      security_company: form.security_company || "",

      // 点検
      daily_checker: "防火管理者",
      daily_check_timing: "毎日終業時",
      periodic_check_months: "4月と10月",
      self_check_months: "1月と7月",

      // 緊急連絡
      emergency_contact_name: form.emergency_name || "",
      emergency_contact_phone: form.emergency_tel || "",

      // 避難
      wide_area_evacuation_site: form.evacuation_site || "",
      temporary_assembly_point: form.assembly_point || "",

      // 訓練・教育
      drill_months: form.drill_months || "4月・10月",
      education_months: form.education_months || "4月・10月",

      // 作成日
      creation_date: new Date().toLocaleDateString("ja-JP-u-ca-japanese", {
        era: "long", year: "numeric", month: "long", day: "numeric",
      }),

      // プラン情報（生成エンジン内で別表の出力制御に使用）
      plan: plan,
      include_appendix: plan !== "light",
    };

    // Select generator based on location
    let buildFn;
    const city = form.city || "";
    const prefecture = form.prefecture || "";

    if (city === "京都市") {
      const { build } = require("../../../lib/generate_kyoto_full.js");
      buildFn = build;
    } else if (prefecture === "東京都") {
      const { build } = require("../../../lib/generate_tokyo_full.js");
      buildFn = build;
    } else {
      // Fallback to Kyoto template as standard
      const { build } = require("../../../lib/generate_kyoto_full.js");
      buildFn = build;
    }

    const buffer = await buildFn(inputData);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`消防計画_${form.building_name}.docx`)}`,
      },
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "消防計画の生成に失敗しました: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
