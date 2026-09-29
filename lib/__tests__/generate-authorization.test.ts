import { afterEach, describe, expect, it } from "vitest";
import {
  getGenerateAuthorizationSecret,
  isAuthorizedGenerateHeader,
} from "../generate-authorization";

const originalInternal = process.env.INTERNAL_GENERATE_SECRET;
const originalStripe = process.env.STRIPE_WEBHOOK_SECRET;
const originalNational = process.env.NATIONAL_SESSION_SECRET;

afterEach(() => {
  if (originalInternal === undefined) delete process.env.INTERNAL_GENERATE_SECRET;
  else process.env.INTERNAL_GENERATE_SECRET = originalInternal;

  if (originalStripe === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = originalStripe;

  if (originalNational === undefined) delete process.env.NATIONAL_SESSION_SECRET;
  else process.env.NATIONAL_SESSION_SECRET = originalNational;
});

describe("generate-authorization", () => {
  it("prefers a dedicated internal secret", () => {
    process.env.INTERNAL_GENERATE_SECRET = "dedicated";
    process.env.STRIPE_WEBHOOK_SECRET = "stripe";
    process.env.NATIONAL_SESSION_SECRET = "national";
    expect(getGenerateAuthorizationSecret()).toBe("dedicated");
  });

  it("uses the existing Stripe webhook secret without new configuration", () => {
    delete process.env.INTERNAL_GENERATE_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = "stripe-secret";
    process.env.NATIONAL_SESSION_SECRET = "national-secret";
    expect(getGenerateAuthorizationSecret()).toBe("stripe-secret");
  });

  it("rejects missing or incorrect headers", () => {
    delete process.env.INTERNAL_GENERATE_SECRET;
    process.env.STRIPE_WEBHOOK_SECRET = "expected";
    expect(isAuthorizedGenerateHeader(null)).toBe(false);
    expect(isAuthorizedGenerateHeader("wrong")).toBe(false);
    expect(isAuthorizedGenerateHeader("expected")).toBe(true);
  });
});
