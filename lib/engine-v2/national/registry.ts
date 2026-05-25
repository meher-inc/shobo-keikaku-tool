import {
  NationalFormPackSchema,
  type NationalFormPack,
} from "../types/national-form-pack";

// Phase 1
import fireManagerAppointment from "./templates/fire-manager-appointment.json";
import firePlanNotification from "./templates/fire-plan-notification.json";
import selfDefenseOrgEstablishment from "./templates/self-defense-org-establishment.json";
import buildingUseStart from "./templates/building-use-start.json";
import buildingConstructionPlan from "./templates/building-construction-plan.json";
import equipmentConstructionStart from "./templates/equipment-construction-start.json";
import equipmentInstallation from "./templates/equipment-installation.json";
// Phase 2
import fireObjectInspectionReport from "./templates/fire-object-inspection-report.json";
import equipmentInspectionReport from "./templates/equipment-inspection-report.json";
import inspectionReportSpecialApproval from "./templates/inspection-report-special-approval.json";
import hazmatFacilityPermit from "./templates/hazmat-facility-permit.json";
import hazmatFacilityAbolition from "./templates/hazmat-facility-abolition.json";
import hazmatSafetySupervisor from "./templates/hazmat-safety-supervisor.json";
import minorHazmatNotification from "./templates/minor-hazmat-notification.json";
import eventHostingNotification from "./templates/event-hosting-notification.json";

const RAW_PACKS: unknown[] = [
  // Phase 1
  fireManagerAppointment,
  firePlanNotification,
  selfDefenseOrgEstablishment,
  buildingUseStart,
  buildingConstructionPlan,
  equipmentConstructionStart,
  equipmentInstallation,
  // Phase 2
  fireObjectInspectionReport,
  equipmentInspectionReport,
  inspectionReportSpecialApproval,
  hazmatFacilityPermit,
  hazmatFacilityAbolition,
  hazmatSafetySupervisor,
  minorHazmatNotification,
  eventHostingNotification,
];

const PACKS: Record<string, NationalFormPack> = RAW_PACKS.reduce<
  Record<string, NationalFormPack>
>((acc, raw) => {
  const parsed = NationalFormPackSchema.parse(raw);
  acc[parsed.packName] = parsed;
  return acc;
}, {});

export const NATIONAL_PACK_NAMES = Object.keys(PACKS) as readonly string[];

export function getNationalPack(packName: string): NationalFormPack | undefined {
  return PACKS[packName];
}

export function listNationalPacks(): NationalFormPack[] {
  return Object.values(PACKS);
}
