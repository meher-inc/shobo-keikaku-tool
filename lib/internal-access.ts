/**
 * Internal / owner free-access allowlist.
 *
 * Only INTERNAL_FREE_ACCESS_EMAILS (comma-separated) grants free access.
 * If the variable is missing or empty, nobody receives free access.
 *
 * Keeping the value server-side prevents client-side spoofing and avoids
 * hard-coding a personal email address in this public repository.
 */

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
  return explicit ? splitEmails(explicit) : [];
}

export function isInternalFreeAccessEmail(email: string): boolean {
  const normalized = normalizeAccessEmail(email);
  return getInternalFreeAccessEmails().includes(normalized);
}
