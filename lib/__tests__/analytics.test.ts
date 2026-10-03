import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { analyticsContext, checkoutAnalyticsMetadata, safePageLocation, sanitizeAttribution } from "../analytics-schema";
import { purchasePayload, sendPurchase } from "../analytics-purchase";

const at = 1790899200;
const context = { client_id: "123456.1790899200", session_id: "1790899200", fire_department: "京都市消防局", building_use: "3-ロ", attribution: { utm_source: "google", utm_medium: "cpc", utm_campaign: "plan_fall", gclid: "TEST_click_12345678", referrer: "https://example.com/private?email=test@example.com" } };
function session(overrides = {}) {
  return { id: "cs_test_fixture", mode: "payment", payment_status: "paid", payment_intent: "pi_testFixture", amount_total: 9800, currency: "jpy", livemode: false, metadata: { plan: "standard", ...checkoutAnalyticsMetadata(context), owner_name: "秘密氏名", address_detail: "秘密住所", manager_tel: "09012345678", email: "customer@example.com" }, ...overrides } as unknown as Stripe.Checkout.Session;
}
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("analytics privacy boundary", () => {
  it("only accepts enumerated departments and building uses", () => {
    expect(analyticsContext("秘密住所", "customer@example.com")).toEqual({ fire_department: "unknown", building_use: "unknown" });
  });
  it("strips PII, query, fragment and credentials from attribution", () => {
    expect(sanitizeAttribution({ utm_source: "customer@example.com", utm_campaign: "09012345678", referrer: "https://user:pass@example.com/", email: "secret" })).toEqual({});
    expect(checkoutAnalyticsMetadata(context).ga_first_referrer).toBe("https://example.com");
    expect(safePageLocation("https://plan.todokede.jp/success?session_id=cs_secret&email=a%40b.com&gclid=TEST_123&plan=light#person")).toBe("https://plan.todokede.jp/success?gclid=TEST_123&plan=light");
  });
  it("keeps Stripe metadata within its per-value limit", () => {
    const metadata = checkoutAnalyticsMetadata({ ...context, attribution: Object.fromEntries(["utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content"].map(k => [k, "a".repeat(100)])) });
    expect(Object.values(metadata).every(v => v.length <= 500)).toBe(true);
  });
  it("does not include any customer details in the purchase payload", () => {
    const body = purchasePayload(session(), at)!;
    expect(body.events[0].params).toMatchObject({ transaction_id: "pi_testFixture", plan: "standard", value: 9800, currency: "JPY", session_id: at, fire_department: "京都市消防局", building_use: "3-ロ", items: [{ item_id: "standard", quantity: 1, price: 9800 }] });
    expect(JSON.stringify(body)).not.toMatch(/秘密|customer@|09012345678|cs_test_fixture/);
    expect(body.timestamp_micros).toBe(at * 1000000);
  });
  it.each([{ payment_status: "unpaid" }, { amount_total: 0 }, { currency: "usd" }, { mode: "subscription" }, { payment_intent: null }, { metadata: { plan: "standard" } }])("skips non-purchases or unlinked clients: %j", overrides => {
    expect(purchasePayload(session(overrides), at)).toBeNull();
  });
});

describe("purchase delivery and replay", () => {
  beforeEach(() => {
    vi.stubEnv("GA4_API_SECRET", "test-only-secret"); vi.stubEnv("VERCEL_ENV", "preview");
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  const logs = (level: "info" | "error") => vi.mocked(console[level]).mock.calls.map(([line]) => JSON.parse(String(line).replace("[ga4.purchase] ", "")));
  function fixture() {
    let metadata: Record<string, string> = {};
    const retrieve = vi.fn(async () => ({ metadata }));
    const update = vi.fn(async (_id, input) => { metadata = { ...metadata, ...input.metadata }; });
    const stripe = { checkout: { sessions: { retrieve, update } } } as unknown as Stripe;
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetcher);
    return { stripe, fetcher, update };
  }
  it("sends once for sequential webhook retries even without a success page", async () => {
    const { stripe, fetcher } = fixture();
    expect(await sendPurchase(stripe, session(), at)).toBe("sent");
    expect(await sendPurchase(stripe, session(), at)).toBe("duplicate");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(logs("info").map(entry => entry.outcome)).toEqual(["acknowledged", "duplicate"]);
  });
  it.each(["", "[SENSITIVE]"])("does not send or mark an unavailable secret: %s", async secret => {
    const { stripe, fetcher, update } = fixture();
    vi.stubEnv("GA4_API_SECRET", secret);
    await expect(sendPurchase(stripe, session(), at)).rejects.toThrow("GA4_API_SECRET is not available");
    expect(fetcher).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(logs("error")).toMatchObject([{ outcome: "failed", stage: "configuration", secret_configured: false }]);
  });
  it("does not mark failed transports and allows retry", async () => {
    const { stripe, fetcher, update } = fixture();
    fetcher.mockResolvedValueOnce(new Response(null, { status: 503 }));
    await expect(sendPurchase(stripe, session(), at)).rejects.toThrow("HTTP 503");
    expect(update).not.toHaveBeenCalled();
    expect(logs("error")).toMatchObject([{ outcome: "failed", stage: "transport", http_status: 503 }]);
    await expect(sendPurchase(stripe, session(), at)).resolves.toBe("sent");
  });
  it("reuses the transaction id when a crash prevents storing the sent marker", async () => {
    const { stripe, fetcher, update } = fixture();
    update.mockRejectedValueOnce(new Error("temporary Stripe failure"));
    await expect(sendPurchase(stripe, session(), at)).rejects.toThrow();
    expect(logs("error")).toMatchObject([{ outcome: "failed", stage: "delivery_marker", http_status: 204 }]);
    expect(logs("info")).toHaveLength(0);
    await sendPurchase(stripe, session(), at);
    const ids = fetcher.mock.calls.map(([, init]) => JSON.parse(init.body).events[0].params.transaction_id);
    expect(ids).toEqual(["pi_testFixture", "pi_testFixture"]);
  });
  it("rejects live payments in preview and never leaks transport errors", async () => {
    const { stripe, fetcher } = fixture();
    await expect(sendPurchase(stripe, session({ livemode: true }), at)).rejects.toThrow("environment mismatch");
    expect(fetcher).not.toHaveBeenCalled();
    fetcher.mockRejectedValueOnce(new Error("api_secret=private"));
    await expect(sendPurchase(stripe, session(), at)).rejects.toThrow("GA4 purchase transport failed");
    expect(JSON.stringify(logs("error"))).not.toMatch(/api_secret|private|test-only-secret|秘密|customer@|09012345678/);
  });
  it("logs a production acknowledgement with identifiers but no secret, payload or PII", async () => {
    const { stripe } = fixture();
    vi.stubEnv("VERCEL_ENV", "production");
    await sendPurchase(stripe, session({ livemode: true, id: "cs_live_fixture" }), at);
    expect(logs("info")).toEqual([{
      event: "ga4_purchase_delivery", measurement_id: "G-TF01DPKTPQ", environment: "production",
      checkout_session_id: "cs_live_fixture", transaction_id: "pi_testFixture", plan: "standard",
      secret_configured: true, outcome: "acknowledged", stage: "delivery_marker", http_status: 204,
    }]);
    expect(JSON.stringify(logs("info"))).not.toMatch(/test-only-secret|client_id|session_id.*123456|秘密|customer@|09012345678|google-analytics.com/);
  });
  it("logs a no-cost purchase as skipped without contacting Google or Stripe", async () => {
    const { stripe, fetcher, update } = fixture();
    expect(await sendPurchase(stripe, session({ amount_total: 0, payment_status: "no_payment_required", payment_intent: null }), at)).toBe("skipped");
    expect(logs("info")).toMatchObject([{ outcome: "skipped", stage: "payload" }]);
    expect(fetcher).not.toHaveBeenCalled();
    expect(stripe.checkout.sessions.retrieve).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
  it("does not log unrecognized identifiers or arbitrary metadata when skipping", async () => {
    const { stripe } = fixture();
    await sendPurchase(stripe, session({ id: "customer@example.com", payment_intent: "api_secret=private", metadata: { plan: "秘密氏名" } }), at);
    const entries = logs("info");
    expect(entries).toMatchObject([{ outcome: "skipped" }]);
    expect(entries[0]).not.toHaveProperty("checkout_session_id");
    expect(entries[0]).not.toHaveProperty("transaction_id");
    expect(entries[0]).not.toHaveProperty("plan");
    expect(JSON.stringify(entries)).not.toMatch(/api_secret|private|秘密|customer@/);
  });
});
