import type { RenderData } from "../helpers/placeholder";

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

export function toRenderData(form: Record<string, unknown>): RenderData {
  return {
    // Building identity
    buildingName: str(form.building_name),
    companyName: str(form.company_name) ?? str(form.building_name),
    managementScope: str(form.management_scope),

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
    isSpecificUse: str(form.is_specific_use),
    capacity: str(form.capacity),

    outsourceCompany: str(form.outsource_company),

    // Chapter 4: inspection & checks
    dailyChecker: str(form.daily_checker),
    dailyCheckTiming: str(form.daily_check_timing),
    periodicCheckMonths: str(form.periodic_check_months),
    selfCheckMonths: str(form.self_check_months),
    inspectionCompany: str(form.inspection_company),

    // Chapter 6: fire equipment — serialise array to CSV so the
    // resolveBody / joinArray computed fn can consume it.
    fireEquipmentList: Array.isArray(form.fire_equipment)
      ? (form.fire_equipment as string[]).join(",")
      : str(form.fire_equipment),

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

    // Creation date (ISO or already-formatted). eraDate computed fn
    // accepts either a real ISO string or undefined (=> "now").
    creationDateIso: str(form.creation_date_iso),
  };
}
