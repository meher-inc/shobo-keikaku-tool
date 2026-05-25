/**
 * Pack 固有の派生計算 (normalizer)。
 *
 * UI/フォームから受け取った raw NationalFormData を、preamble や section の
 * テンプレに埋め込むための「派生キー」で補強する。
 *
 * pack 固有の特殊化が必要なケースのみここで処理し、汎用化できるものは
 * renderer / applyTemplate 側に置く。
 *
 * 現在の対象:
 *   - fire-manager-appointment:
 *     kind (checkbox-group, 配列) → kindManagers 文字列を派生
 *     preamble テンプレで {{kindManagers}} として参照される
 */

import type { NationalFormData } from "../types/national-form-pack";

type Normalizer = (input: NationalFormData) => NationalFormData;

/**
 * fire-manager-appointment 用:
 *   kind 配列 → kindManagers 文字列
 *     ["防火"]         → "防火管理者"
 *     ["防災"]         → "防災管理者"
 *     ["防火","防災"]  → "防火管理者及び防災管理者"
 *     []  / undefined  → ""
 */
const fireManagerAppointment: Normalizer = (input) => {
  const out: NationalFormData = { ...input };
  const raw = input.kind;
  let arr: string[];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === "string" && raw !== "") {
    // 後方互換: 旧 radio 形式で文字列で来た場合
    arr = [raw];
  } else {
    arr = [];
  }
  const labels = arr
    .filter((k) => k === "防火" || k === "防災")
    .map((k) => `${k}管理者`);
  out.kindManagers = labels.length === 0 ? "" : labels.join("及び");
  return out;
};

const NORMALIZERS: Record<string, Normalizer> = {
  "fire-manager-appointment": fireManagerAppointment,
};

export function applyPackNormalizers(
  packName: string,
  input: NationalFormData
): NationalFormData {
  const fn = NORMALIZERS[packName];
  if (!fn) return input;
  return fn(input);
}
