/**
 * Internal / owner free-access allowlist.
 *
 * Priority:
 *   1. INTERNAL_FREE_ACCESS_EMAILS (comma-separated)
 *   2. REVIEW_TO_EMAIL (already used for operator notifications)
 *   3. plan@todokede.jp (existing operator mailbox fallback)
 *
 * Keeping the value server-side prevents client-side spoofing and avoids
 * hard-coding a personal email address in this public repository.
 */

const FALLBACK_INTERNAL_EMAIL = "plan@todokede.jp";

export function normalizeAccessEmail(email: string): string {
  return email.toLowerCase().trim();
}

function splitEmails(value: string): string[] {
  return value
    .split(",")
    .map(normalizeAccessEmail)
    .filter(Boolean);
}

export function getInternalFreeAccessEmails(): string[] {
  const explicit = process.env.INTERNAL_FREE_ACCESS_EMAILS?.trim();
  if (explicit) return splitEmails(explicit);

  const reviewTo = process.env.REVIEW_TO_EMAIL?.trim();
  if (reviewTo) return splitEmails(reviewTo);

  return [FALLBACK_INTERNAL_EMAIL];
}

export function isInternalFreeAccessEmail(email: string): boolean {
  const normalized = normalizeAccessEmail(email);
  return getInternalFreeAccessEmails().includes(normalized);
}
