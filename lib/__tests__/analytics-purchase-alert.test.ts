import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type Stripe from "stripe";
import { notifyPurchaseFailure, purchaseAlertReference } from "../analytics-purchase-alert";
import { sendPurchase } from "../analytics-purchase";
import { checkoutAnalyticsMetadata } from "../analytics-schema";

const sessionId = "cs_live_notificationFixture";
const alertMarker = "ga4_alert_G_TF01DPKTPQ";
const at = 1791000000;
const payment = {
  id: sessionId, livemode: true, mode: "payment", payment_status: "paid",
  payment_intent: "pi_liveNotificationFixture", amount_total: 4980, currency: "jpy",
  metadata: {
    plan: "light", owner_name: "秘密氏名", address_detail: "秘密住所", customer_email: "customer@example.com", manager_tel: "09012345678",
    ...checkoutAnalyticsMetadata({ client_id: "12345.1791000000", session_id: "1791000000", fire_department: "京都市消防局", building_use: "3-ロ", attribution: {} }),
  },
} as unknown as Stripe.Checkout.Session;

function fixture() {
  let metadata: Record<string, string> = {};
  const retrieve = vi.fn(async () => ({ metadata }));
  const update = vi.fn(async (_id, input) => { metadata = { ...metadata, ...input.metadata }; });
  const stripe = { checkout: { sessions: { retrieve, update } } } as unknown as Stripe;
  const fetcher = vi.fn(async (url: string | URL) => String(url).startsWith("https://api.resend.com/")
    ? Response.json({ id: "notification-fixture" })
    : new Response(null, { status: 503 }));
  vi.stubGlobal("fetch", fetcher);
  return { stripe, retrieve, update, fetcher };
}

beforeEach(() => {
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("GA4_API_SECRET", "ga-secret-do-not-send-in-alert");
  vi.stubEnv("RESEND_API_KEY", "resend-secret-do-not-log");
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("purchase failure notifications", () => {
  it("notifies the requested address once across repeated GA failures without customer data or secrets", async () => {
    const { stripe, fetcher, update } = fixture();
    await expect(sendPurchase(stripe, payment, at)).rejects.toThrow("HTTP 503");
    await expect(sendPurchase(stripe, payment, at)).rejects.toThrow("HTTP 503");
    const emailCalls = vi.mocked(fetch).mock.calls.filter(([url]) => String(url) === "https://api.resend.com/emails");
    expect(emailCalls).toHaveLength(1);
    const email = JSON.parse(String(emailCalls[0][1]!.body));
    expect(email.to).toEqual(["info@meher-inc.co.jp"]);
    expect(email.text).toContain(purchaseAlertReference(sessionId));
    expect(JSON.stringify(email)).not.toMatch(/秘密|customer@example|09012345678|pi_live|cs_live|12345\.1791000000|京都|4980|light|ga-secret|resend-secret|api_secret/);
    expect(update).toHaveBeenCalledExactlyOnceWith(sessionId, { metadata: { [alertMarker]: "sent" } }, { timeout: 2000, maxNetworkRetries: 0 });
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(JSON.stringify([...vi.mocked(console.info).mock.calls, ...vi.mocked(console.error).mock.calls])).not.toMatch(/秘密|customer@example|09012345678|ga-secret|resend-secret|api_secret/);
  });

  it("alerts when the GA secret is missing without attempting GA delivery", async () => {
    const { stripe } = fixture();
    vi.stubEnv("GA4_API_SECRET", "");
    await expect(sendPurchase(stripe, payment, at)).rejects.toThrow("GA4_API_SECRET is not available");
    expect(vi.mocked(fetch).mock.calls.map(([url]) => String(url))).toEqual(["https://api.resend.com/emails"]);
  });

  it("retries a failed notification with the same key and body, without hiding the GA error", async () => {
    const { stripe, fetcher, update } = fixture();
    fetcher.mockResolvedValueOnce(new Response(null, { status: 503 }));
    fetcher.mockResolvedValueOnce(new Response(null, { status: 500 }));
    await expect(sendPurchase(stripe, payment, at)).rejects.toThrow("GA4 purchase HTTP 503");
    expect(update).not.toHaveBeenCalled();
    await expect(sendPurchase(stripe, payment, at + 1)).rejects.toThrow("GA4 purchase HTTP 503");
    const calls = vi.mocked(fetch).mock.calls.filter(([url]) => String(url) === "https://api.resend.com/emails");
    expect(calls).toHaveLength(2);
    expect(calls[0][1]!.body).toBe(calls[1][1]!.body);
    expect(calls[0][1]!.headers).toEqual(calls[1][1]!.headers);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it("still alerts if the Stripe marker cannot be read, using a stable idempotency key", async () => {
    const { stripe, retrieve } = fixture();
    retrieve.mockRejectedValue(new Error("sensitive Stripe customer error"));
    await notifyPurchaseFailure(stripe, sessionId, true);
    expect(vi.mocked(fetch).mock.calls[0][1]!.headers).toMatchObject({ "Idempotency-Key": `ga4-purchase-failure/${purchaseAlertReference(sessionId)}` });
    expect(JSON.stringify(vi.mocked(console.info).mock.calls)).not.toContain("sensitive Stripe customer error");
  });

  it("does not hide the original failure when the email provider times out or throws", async () => {
    const { stripe, fetcher, update } = fixture();
    fetcher.mockResolvedValueOnce(new Response(null, { status: 503 }));
    fetcher.mockRejectedValueOnce(new Error("Authorization: resend-secret-do-not-log; customer@example.com"));
    await expect(sendPurchase(stripe, payment, at)).rejects.toThrow("GA4 purchase HTTP 503");
    expect(update).not.toHaveBeenCalled();
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toMatch(/resend-secret|customer@example/);
  });

  it("retains the original GA failure after notification marker write failure", async () => {
    const { stripe, update } = fixture();
    update.mockRejectedValue(new Error("raw secret customer details"));
    await expect(sendPurchase(stripe, payment, at)).rejects.toThrow("GA4 purchase HTTP 503");
    expect(vi.mocked(console.error).mock.calls.flat().join("\n")).toContain('"stage":"marker_write"');
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain("raw secret customer details");
  });

  it.each([["preview", true], ["production", false], ["development", true]])("does not send notifications in %s with livemode=%s", async (environment, livemode) => {
    const { stripe, retrieve, fetcher } = fixture();
    vi.stubEnv("VERCEL_ENV", environment as string);
    await notifyPurchaseFailure(stripe, sessionId, livemode as boolean);
    expect(retrieve).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
  });

  it("does not notify for a successful purchase or a skipped client", async () => {
    const { stripe, fetcher } = fixture();
    fetcher.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(sendPurchase(stripe, payment, at)).resolves.toBe("sent");
    await expect(sendPurchase(stripe, { ...payment, metadata: { plan: "light" } }, at)).resolves.toBe("skipped");
    expect(vi.mocked(fetch).mock.calls.every(([url]) => String(url).startsWith("https://www.google-analytics.com/"))).toBe(true);
  });

  it.each(["", "[SENSITIVE]"])("logs unavailable Resend configuration without a network request: %s", async key => {
    const { stripe, fetcher } = fixture();
    vi.stubEnv("RESEND_API_KEY", key);
    await notifyPurchaseFailure(stripe, sessionId, true);
    expect(fetcher).not.toHaveBeenCalled();
    expect(vi.mocked(console.error).mock.calls.flat().join("\n")).toContain('"stage":"configuration"');
  });

  it("rejects an invalid checkout identifier without sending or logging it", async () => {
    const { stripe, fetcher } = fixture();
    await notifyPurchaseFailure(stripe, "customer@example.com", true);
    expect(fetcher).not.toHaveBeenCalled();
    expect(purchaseAlertReference("customer@example.com")).toBeUndefined();
  });
});
