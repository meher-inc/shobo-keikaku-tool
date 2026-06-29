// Table: public.care_bcp_waitlist

export type CareBcpFacilityType =
  | "tsusho"
  | "nyusho"
  | "houmon"
  | "tasyou"
  | "sonota";

export interface CareBcpWaitlistEntry {
  id: string;
  email: string;
  facility_name: string;
  facility_type: CareBcpFacilityType;
  region: string | null;
  source: string | null;
  created_at: string;
  notified_at: string | null;
}

export interface CareBcpWaitlistCreateInput {
  email: string;
  facility_name: string;
  facility_type: CareBcpFacilityType;
  region?: string;
  source?: string;
}
