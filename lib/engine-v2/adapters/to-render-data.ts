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

    // Creation date (ISO or already-formatted). eraDate computed fn
    // accepts either a real ISO string or undefined (=> "now").
    creationDateIso: str(form.creation_date_iso),
  };
}
