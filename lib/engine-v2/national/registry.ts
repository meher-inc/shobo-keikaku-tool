import {
  NationalFormPackSchema,
  type NationalFormPack,
} from "../types/national-form-pack";

import fireManagerAppointment from "./templates/fire-manager-appointment.json";
import firePlanNotification from "./templates/fire-plan-notification.json";
import selfDefenseOrgEstablishment from "./templates/self-defense-org-establishment.json";
import buildingUseStart from "./templates/building-use-start.json";
import buildingConstructionPlan from "./templates/building-construction-plan.json";
import equipmentConstructionStart from "./templates/equipment-construction-start.json";
import equipmentInstallation from "./templates/equipment-installation.json";

const RAW_PACKS: unknown[] = [
  fireManagerAppointment,
  firePlanNotification,
  selfDefenseOrgEstablishment,
  buildingUseStart,
  buildingConstructionPlan,
  equipmentConstructionStart,
  equipmentInstallation,
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
