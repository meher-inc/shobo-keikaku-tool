import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { checkoutAnalyticsMetadata } from "../analytics-schema";

const mocks = vi.hoisted(() => ({ event: vi.fn(), create: vi.fn(), retrieve: vi.fn(), marker: vi.fn(), insert: vi.fn(), lookup: vi.fn(), update: vi.fn() }));
vi.mock("stripe", () => ({ default: class {
  webhooks = { constructEvent: mocks.event };
  checkout = { sessions: { create: mocks.create, retrieve: mocks.retrieve, update: mocks.marker } };
} }));
vi.mock("resend", () => ({ Resend: class {} }));
vi.mock("../sendPremiumReview", () => ({ sendPremiumReview: vi.fn() }));
vi.mock("../subscriptions", () => ({ upsertSubscriptionFromStripe: vi.fn() }));
vi.mock("../internal-session", () => ({ getInternalSessionEmail: vi.fn().mockResolvedValue(null) }));
vi.mock("../supabase", () => ({ supabaseAdmin: { from: () => ({
  insert: mocks.insert, select: () => ({ eq: () => ({ maybeSingle: mocks.lookup }) }), update: mocks.update,
}) } }));
import { POST as checkout } from "../../app/api/checkout/route";
import { POST as webhook } from "../../app/api/webhook/stripe/route";

const analytics = { client_id: "1234.1791000000", session_id: "1791000000", fire_department: "京都市消防局", building_use: "3-ロ", attribution: { utm_source: "google", gclid: "TEST_GCLID" } };
const payment = { id: "cs_test_fixture", mode: "payment", livemode: false, payment_status: "paid", payment_intent: "pi_testFixture", currency: "jpy", amount_total: 9800, metadata: { order_id: "local-order", plan: "standard", ...checkoutAnalyticsMetadata(analytics) } };
const request = () => new NextRequest("https://preview.invalid/api/webhook/stripe", { method: "POST", headers: { "stripe-signature": "test-signature" }, body: "signed-test-body" });
let fetcher: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.stubEnv("VERCEL_ENV", "preview"); vi.stubEnv("ANALYTICS_TEST_DATA_ISOLATED", "true");
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_fixture"); vi.stubEnv("GA4_API_SECRET", "local-test-only");
  mocks.event.mockReturnValue({ type: "checkout.session.completed", livemode: false, created: 1791000000, data: { object: payment } });
  mocks.lookup.mockResolvedValue({ data: { id: "local-order", status: "paid", plan_id: "standard" } });
  mocks.insert.mockReturnValue({ select: () => ({ single: async () => ({ data: { id: "local-order" } }) }) });
  mocks.update.mockReturnValue({ eq: async () => ({ error: null }) });
  mocks.create.mockResolvedValue({ id: "cs_test_fixture", url: "https://checkout.stripe.com/test" });
  let metadata = {};
  mocks.retrieve.mockImplementation(async () => ({ metadata }));
  mocks.marker.mockImplementation(async (_id, input) => { metadata = { ...metadata, ...input.metadata }; });
  fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 })); vi.stubGlobal("fetch", fetcher);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetAllMocks(); });

describe("checkout and signed webhook analytics boundary", () => {
  it("stores client/session attribution in Stripe but keeps it out of form_data", async () => {
    const response = await checkout(new NextRequest("https://preview.invalid/api/checkout", { method: "POST", body: JSON.stringify({ plan: "standard", building_name: "Test", analytics }) }));
    expect(response.status).toBe(200);
    expect(mocks.create.mock.calls[0][0].metadata).toMatchObject({ ga_client_id: analytics.client_id, ga_session_id: analytics.session_id, ga_first_gclid: "TEST_GCLID" });
    expect(mocks.insert.mock.calls[0][0].form_data).not.toHaveProperty("analytics");
  });
  it("blocks preview checkout before writing production-shaped data", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_fixture");
    expect((await checkout(new NextRequest("https://preview.invalid/api/checkout", { method: "POST", body: "{}" }))).status).toBe(503);
    expect(mocks.insert).not.toHaveBeenCalled(); expect(mocks.create).not.toHaveBeenCalled();
  });
  it("rejects invalid signatures before purchase delivery", async () => {
    mocks.event.mockImplementation(() => { throw Error("invalid signature"); });
    expect((await webhook(request())).status).toBe(400);
    expect(mocks.lookup).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
  });
  it("retries analytics for an already paid order, then skips the repeated event", async () => {
    fetcher.mockResolvedValueOnce(new Response(null, { status: 503 }));
    expect((await webhook(request())).status).toBe(500);
    expect((await webhook(request())).status).toBe(200);
    expect((await webhook(request())).status).toBe(200);
    expect(fetcher).toHaveBeenCalledTimes(2); expect(mocks.marker).toHaveBeenCalledTimes(1);
    expect(mocks.update).not.toHaveBeenCalled();
  });
  it("does not deliver purchase until delayed payment succeeds", async () => {
    mocks.event.mockReturnValueOnce({ type: "checkout.session.completed", livemode: false, created: 1791000000, data: { object: { ...payment, payment_status: "unpaid" } } });
    expect((await webhook(request())).status).toBe(200); expect(fetcher).not.toHaveBeenCalled();
    mocks.event.mockReturnValueOnce({ type: "checkout.session.async_payment_succeeded", livemode: false, created: 1791000001, data: { object: payment } });
    expect((await webhook(request())).status).toBe(200); expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("preserves the Stripe retry response even when the production failure notification also fails", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("RESEND_API_KEY", "notification-test-only");
    mocks.event.mockReturnValue({ type: "checkout.session.completed", livemode: true, created: 1791000000, data: { object: { ...payment, livemode: true } } });
    fetcher.mockResolvedValueOnce(new Response(null, { status: 503 }));
    fetcher.mockResolvedValueOnce(new Response(null, { status: 500 }));
    expect((await webhook(request())).status).toBe(500);
    expect(fetcher.mock.calls.map(([url]) => new URL(String(url)).hostname)).toEqual(["www.google-analytics.com", "api.resend.com"]);
    expect(mocks.marker).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
