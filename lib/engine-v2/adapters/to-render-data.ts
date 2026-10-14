import type { RenderData } from "../helpers/placeholder";
import {
  PART_SCOPE_CONFORM_CLAUSE,
  circledLines,
  formatEquipmentByFloor,
  formatUseCategory,
  isPartScope,
  isSpecificUseCode,
  managementScopePhrase,
  pickExtinguishingEquipment,
  tokyoFireControlItems,
  type ScopeInput,
} from "../helpers/plan-text";

/**
 * Convert a v1-shape POST body (snake_case, see
 * app/api/generate-plan/route.ts) into the camelCase RenderData map
 * the v2 engine uses for placeholder + computed resolution.
 *
 * Only the keys needed by the kyoto-city chapter 1-3 pack are
 * mapped here. Other chapters / packs can extend this as they
 * come online.
 */

function str(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "string") return v.length > 0 ? v : undefined;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return undefined;
}

function strList(v: unknown): string[] | undefined {
  if (Array.isArray(v)) return (v as unknown[]).filter((x): x is string => typeof x === "string");
  if (typeof v === "string" && v.length > 0) return v.split(",").map((s) => s.trim()).filter(Boolean);
  return undefined;
}

export function toRenderData(form: Record<string, unknown>): RenderData {
  const equipment = strList(form.equipment) ?? strList(form.fire_equipment) ?? [];
  const extinguishing = pickExtinguishingEquipment(equipment);
  // 火気使用設備。旧データ（項目なし・未選択）は undefined として従来の全条項を出す。
  // 「なし」を選んだ場合は ["なし"] が届く。
  const fireUseRaw = strList(form.fire_use_equipment);
  const fireUse = fireUseRaw && fireUseRaw.length > 0 ? fireUseRaw : undefined;
  const useCode = str(form.use_category) ?? str(form.use_category_label);
  const scope: ScopeInput = {
    managementScope: str(form.management_scope),
    scopeType: str(form.management_scope_type),
    tenantBuildingName: str(form.tenant_building_name),
    usedFloors: str(form.used_floors),
    usedArea: str(form.used_area) ?? str(form.total_area),
    occupantName: str(form.building_name),
  };
  const scopePhrase = managementScopePhrase(scope);
  const partScope = isPartScope(scope);
  const buildingName = str(form.building_name);

  return {
    // Building identity
    buildingName,
    companyName: str(form.company_name) ?? buildingName,

    // 管理権原の範囲。建物の一部の場合は「〇〇ビル〇階のうち、〇〇として使用する部分（〇〇㎡）」。
    managementScope: scopePhrase,
    // 京都ベース様式の「当該管理権原の及ぶ範囲は＿＿とする」用（建物名を前置する旧表記を維持）。
    managementScopeWithBuilding: partScope
      ? scopePhrase
      : `${buildingName ?? "当該防火対象物"}の${scopePhrase ?? "建物全体"}`,
    // 建物の一部の場合だけ置く条項。様式ごとの項番号に合わせて複数用意する。
    scopeConformItem3: partScope ? `\n⑶\u3000${PART_SCOPE_CONFORM_CLAUSE}` : undefined,
    scopeConformItem4: partScope ? `\n⑷\u3000${PART_SCOPE_CONFORM_CLAUSE}` : undefined,
    scopeConformSentence: partScope ? `\n\u3000${PART_SCOPE_CONFORM_CLAUSE}` : undefined,

    // Address parts — consumed by joinAddress computed fn
    prefecture: str(form.prefecture),
    city: str(form.city),
    ward: str(form.ward),
    addressDetail: str(form.address_detail),

    // Manager / owner — unused by kyoto ch1-3 body, mapped for
    // future packs and to test that the adapter's surface covers
    // the Step 1 dept scope.
    ownerName: str(form.owner_name),
    managerName: str(form.manager_name),
    managerQualification: str(form.manager_qual) ?? str(form.manager_qualification),
    managerAppointmentDate: str(form.manager_date) ?? str(form.manager_appointment_date),
    managerContact: str(form.manager_tel) ?? str(form.manager_contact),

    // Flags surfaced as strings so the computed / placeholder layer
    // can treat them uniformly. The adapter that decides paragraph
    // inclusion can still read these.
    isUnifiedManagement: str(form.is_unified_management),
    hasOutsourcedManagement: str(form.has_outsourced_management) ?? str(form.has_outsource),
    // フォームは is_specific_use を送らないため、未指定なら用途の項から判定する。
    isSpecificUse:
      str(form.is_specific_use) ??
      (isSpecificUseCode(useCode) === undefined ? undefined : String(isSpecificUseCode(useCode))),
    capacity: str(form.capacity),

    // 建物概要（入力概要セクションで使用）
    useCategory: formatUseCategory(useCode, str(form.use_name)),
    totalArea: str(form.total_area),
    numFloors: str(form.num_floors),

    outsourceCompany: str(form.outsource_company),

    // Chapter 4: inspection & checks
    dailyChecker: str(form.daily_checker),
    dailyCheckTiming: str(form.daily_check_timing),
    periodicCheckMonths: str(form.periodic_check_months),
    selfCheckMonths: str(form.self_check_months),
    inspectionCompany: str(form.inspection_company),

    // Chapter 6: fire equipment — serialise array to CSV so the
    // resolveBody / joinArray computed fn can consume it。
    // フォームは equipment で送るため、fire_equipment と両対応にする
    // （以前は fire_equipment のみ参照で入力が反映されていなかった）。
    fireEquipmentList: equipment.length > 0 ? equipment.join(",") : undefined,
    // 初期消火に使う設備だけ（誘導灯・自動火災報知設備などは含めない）。
    extinguishingEquipmentList: extinguishing.length > 0 ? extinguishing.join(",") : undefined,
    extinguishingEquipmentText: extinguishing.length > 0 ? extinguishing.join("\u3001") : undefined,

    // 火気使用設備（CSV）と、東京消防庁様式 第4の1⑵ の項目行。
    fireUseEquipment: fireUse?.join(","),
    tokyoFireControlLines: circledLines(tokyoFireControlItems(fireUse)),

    // 各階の設備配置（任意）。入力概要で「○階: 設備…」形式に整形して表示。
    // 階の名前が空の行は「—:」を付けずに内容だけ出す。
    equipmentByFloor: Array.isArray(form.equipment_floors)
      ? formatEquipmentByFloor(form.equipment_floors as { floor?: string; detail?: string }[])
      : undefined,

    // Chapter 7: emergency contacts
    emergencyContactName: str(form.emergency_contact_name) ?? str(form.emergency_name),
    emergencyContactPhone: str(form.emergency_contact_phone) ?? str(form.emergency_tel),
    securityCompany: str(form.security_company),

    // Chapter 8: evacuation
    wideAreaEvacuationSite: str(form.wide_area_evacuation_site) ?? str(form.evacuation_site),
    temporaryAssemblyPoint: str(form.temporary_assembly_point) ?? str(form.assembly_point),

    // Chapter 9: education
    educationMonths: str(form.education_months),

    // Chapter 10: drills
    drillMonths: str(form.drill_months),

    // 自衛消防隊の編成（専用様式の別表「自衛消防隊の編成」／入力概要で使用）
    leaderName: str(form.leader_name),
    tsuhouMember: str(form.tsuhou_member),
    shokaMember: str(form.shoka_member),
    hinanMember: str(form.hinan_member),
    kyugoMember: str(form.kyugo_member),
    anzenMember: str(form.anzen_member),

    // 工事中の消防計画（plan_kind === "construction" のとき使用）
    planKind: str(form.plan_kind),
    constructionName: str(form.construction_name),
    constructionType: str(form.construction_type),
    constructionScope: str(form.construction_scope),
    constructionStart: str(form.construction_start),
    constructionEnd: str(form.construction_end),
    contractorName: str(form.contractor_name),
    contractorTel: str(form.contractor_tel),
    constructionSiteManager: str(form.construction_site_manager),
    hotWork: str(form.hot_work),
    hazmatUse: str(form.hazmat_use),
    equipmentShutdown: str(form.equipment_shutdown),
    occupiedDuringConstruction: str(form.occupied_during_construction),

    // Creation date — v1 passes the pre-formatted string (e.g.
    // "令和7年4月1日") in creation_date. creationDateIso is the ISO
    // form for the eraDate computed fn in 附則.
    creationDate: str(form.creation_date),
    creationDateIso: str(form.creation_date_iso),
  };
}
