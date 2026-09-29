/**
 * Owner-login return target for the spot-purchase plan page.
 *
 * Only the site root is accepted. Query parameters (UTM/session tracking) are
 * preserved, and #form is appended when the caller did not provide a hash.
 * Any other path fails closed to /#form.
 */
export function normalizeInternalReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/#form";
  }

  try {
    const url = new URL(value, "https://plan.todokede.jp");
    if (url.pathname !== "/") return "/#form";

    const hash = url.hash || "#form";
    return `${url.pathname}${url.search}${hash}`;
  } catch {
    return "/#form";
  }
}
