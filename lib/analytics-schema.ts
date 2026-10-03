import { isSpotPlanId } from "./spot-plans";

export const FUNNEL_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FUNNEL_GA_ID || "G-TF01DPKTPQ";
export const ATTRIBUTION_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content", "gclid", "gbraid", "wbraid"] as const;
export type Attribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number] | "referrer", string>>;
export type AnalyticsContext = {
  fire_department: string;
  building_use: string;
};

const DEPARTMENTS = ["東京消防庁", ...["京都", "大阪", "堺", "横浜", "川崎", "相模原", "静岡", "北九州", "新潟", "熊本", "福岡", "名古屋", "札幌", "神戸", "さいたま", "広島", "仙台", "千葉", "岡山", "浜松"].map(c => `${c}市消防局`)];
const BUILDING_USES = ["1-イ", "2-イ", "3-イ", "3-ロ", "4", "5-イ", "5-ロ", "6-イ", "6-ロ", "7", "8", "10", "12-イ", "14", "15", "16-イ", "16-ロ"];

export function analyticsContext(department: unknown, use: unknown): AnalyticsContext {
  return {
    fire_department: typeof department === "string" && DEPARTMENTS.includes(department) ? department : "unknown",
    building_use: typeof use === "string" && BUILDING_USES.includes(use) ? use : "unknown",
  };
}

// Attribution is campaign metadata, never arbitrary form text or a full referrer URL.
export function campaignValue(value: unknown): string | undefined {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_.~-]{1,100}$/.test(value) || /\d{7,}/.test(value)) return undefined;
  return value;
}

export function clickId(value: unknown): string | undefined {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,200}$/.test(value) ? value : undefined;
}

export function safeReferrer(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return undefined;
    return url.origin;
  } catch { return undefined; }
}

export function sanitizeAttribution(input: unknown): Attribution {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const result: Attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = key.endsWith("clid") || key.endsWith("braid") ? clickId(source[key]) : campaignValue(source[key]);
    if (value) result[key] = value;
  }
  const referrer = safeReferrer(source.referrer);
  if (referrer) result.referrer = referrer;
  return result;
}

export function safePageLocation(href: string): string {
  const url = new URL(href);
  const input = Object.fromEntries(url.searchParams);
  url.search = "";
  url.hash = "";
  for (const [key, value] of Object.entries(sanitizeAttribution(input))) url.searchParams.set(key, value);
  if (isSpotPlanId(input.plan || "")) url.searchParams.set("plan", input.plan);
  return url.href;
}

export type CheckoutAnalytics = AnalyticsContext & {
  client_id: string;
  session_id: string;
  attribution: Attribution;
};

export function sanitizeCheckoutAnalytics(input: unknown): CheckoutAnalytics | null {
  if (!input || typeof input !== "object") return null;
  const data = input as Record<string, unknown>;
  if (typeof data.client_id !== "string" || !/^\d{1,20}\.\d{1,20}$/.test(data.client_id)) return null;
  if (typeof data.session_id !== "string" || !/^\d{1,20}$/.test(data.session_id)) return null;
  return { client_id: data.client_id, session_id: data.session_id, ...analyticsContext(data.fire_department, data.building_use), attribution: sanitizeAttribution(data.attribution) };
}

export function checkoutAnalyticsMetadata(input: unknown): Record<string, string> {
  const data = sanitizeCheckoutAnalytics(input);
  if (!data) return {};
  return {
    ga_client_id: data.client_id,
    ga_session_id: data.session_id,
    ga_fire_department: data.fire_department,
    ga_building_use: data.building_use,
    ...Object.fromEntries(Object.entries(data.attribution).map(([key, value]) => [`ga_first_${key}`, value])),
  };
}
