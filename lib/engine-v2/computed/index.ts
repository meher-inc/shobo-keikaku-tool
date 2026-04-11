import type { ComputedFnName } from "../types/template-pack";

/**
 * Computed function registry.
 *
 * Each fn takes a variadic list of (already-resolved) RenderData
 * values and returns a plain string. Keys referenced by the
 * TemplatePack's computed nodes go through this registry.
 *
 * The available fn names are the single source of truth — the
 * template-pack zod schema (COMPUTED_FN_NAMES) mirrors this
 * registry so unknown fn names are rejected at loadPack time.
 */

export type ComputedFn = (...args: (string | undefined)[]) => string;

/**
 * Convert an ISO-8601 date string (or undefined → now) into a
 * Japanese era string like "令和7年4月11日". Matches the format
 * the v1 route.ts produces via toLocaleDateString.
 */
function eraDate(isoDate: string | undefined): string {
  const d = isoDate && isoDate.length > 0 ? new Date(isoDate) : new Date();
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return d.toLocaleDateString("ja-JP-u-ca-japanese", {
    era: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Join address components (prefecture / city / street / building)
 * with a full-width space. Undefined/empty components are dropped
 * so a missing building name doesn't leave trailing whitespace.
 */
function joinAddress(
  prefecture: string | undefined,
  city: string | undefined,
  street: string | undefined,
  building: string | undefined
): string {
  return [prefecture, city, street, building]
    .filter((s): s is string => typeof s === "string" && s.length > 0)
    .join("\u3000"); // 全角スペース
}

/**
 * Sum a comma-separated list of numeric strings and return the
 * total as a plain decimal string. Non-numeric tokens are ignored.
 * Example: sumArea("120.5, 80, 40") => "240.5"
 */
function sumArea(areas: string | undefined): string {
  if (!areas) return "0";
  const total = areas
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n))
    .reduce((acc, n) => acc + n, 0);
  return String(total);
}

/**
 * Join a comma-separated list into a single string using the
 * given separator (default: 全角句読点「、」). Empty tokens are
 * dropped so a trailing comma doesn't leave a dangling separator.
 * Example: joinArray("消火器, 誘導灯, ") => "消火器、誘導灯"
 *
 * Used by kyoto ch6 (自衛消防 初期消火 subitem イ) for the
 * fire_equipment list — v1 does `d.fire_equipment.join("、")`
 * inline at lib/generate_kyoto_full.js:369.
 */
function joinArray(csv: string | undefined, separator: string | undefined): string {
  if (!csv) return "";
  const sep = separator && separator.length > 0 ? separator : "\u3001";
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .join(sep);
}

export const computedRegistry: Record<ComputedFnName, ComputedFn> = {
  eraDate: (iso) => eraDate(iso),
  joinAddress: (pref, city, street, building) =>
    joinAddress(pref, city, street, building),
  sumArea: (areas) => sumArea(areas),
  joinArray: (csv, sep) => joinArray(csv, sep),
};
