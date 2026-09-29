const HEADER_NAME = "x-todokede-internal-generate";

export const GENERATE_AUTH_HEADER = HEADER_NAME;

/**
 * Resolve a server-only secret for internal document-generation calls.
 *
 * INTERNAL_GENERATE_SECRET is an optional dedicated override.
 * STRIPE_WEBHOOK_SECRET is already required in production for paid checkout,
 * so existing deployments do not need a new environment variable.
 * NATIONAL_SESSION_SECRET is a final fallback for non-Stripe environments.
 */
export function getGenerateAuthorizationSecret(): string {
  const secret =
    process.env.INTERNAL_GENERATE_SECRET?.trim() ||
    process.env.STRIPE_WEBHOOK_SECRET?.trim() ||
    process.env.NATIONAL_SESSION_SECRET?.trim() ||
    "";

  if (!secret) {
    throw new Error(
      "[generate-authorization] no server-side authorization secret is configured"
    );
  }

  return secret;
}

export function isAuthorizedGenerateHeader(value: string | null): boolean {
  if (!value) return false;

  try {
    return value === getGenerateAuthorizationSecret();
  } catch {
    return false;
  }
}
