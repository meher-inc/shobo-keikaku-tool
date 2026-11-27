import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  event: vi.fn(),
  lookup: vi.fn(),
  send: vi.fn(),
  updates: [] as Array<Record<string, unknown>>,
  claim: { data: [{ id: "order-premium" }] as unknown, error: null as unknown },
}));
vi.mock("stripe", () => ({ default: class { webhooks = { constructEvent: mocks.event }; } }));
vi.mock("resend", () => ({ Resend: class {} }));
vi.mock("../analytics-purchase", () => ({ sendPurchase: vi.fn() }));
vi.mock("../sendPremiumReview", () => ({ sendPremiumReview: mocks.send }));
vi.mock("../subscriptions", () => ({ upsertSubscriptionFromStripe: vi.fn() }));
vi.mock("../supabase", () => ({ supabaseAdmin: { from: () => ({
  select: () => ({ eq: () => ({ maybeSingle: mocks.lookup }) }),
  update: (values: Record<string, unknown>) => {
    mocks.updates.push(values);
    // paid update: .eq() awaited directly; claim: .eq().is().select(); release: .eq().eq()
    const result = Promise.resolve({ error: null });
    return { eq: () => Object.assign(result, {
      is: () => ({ select: async () => mocks.claim }),
      eq: async () => ({ error: null }),
    }) };
  },
}) } }));
import { POST } from "../../app/api/webhook/stripe/route";

const order = {
  id: "order-premium", status: "pending", plan_id: "premium",
  form_data: { building_name: "テストビル" }, premium_email_sent_at: null, customer_email: null,
};
const request = () => new NextRequest("https://preview.invalid/api/webhook/stripe", { method: "POST", body: "synthetic" });
let fetcher: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.stubEnv("INTERNAL_GENERATE_SECRET", "local-test-only");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.invalid");
  mocks.updates.length = 0;
  mocks.claim = { data: [{ id: "order-premium" }], error: null };
  mocks.event.mockReturnValue({
    type: "checkout.session.completed", created: 1791000000,
    data: { object: { id: "cs_test_premium", mode: "payment", payment_status: "paid",
      customer_details: { email: "buyer@example.test" }, metadata: { order_id: "order-premium" } } },
  });
  mocks.lookup.mockResolvedValue({ data: order, error: null });
  mocks.send.mockResolvedValue(undefined);
  fetcher = vi.fn().mockResolvedValue(new Response(new Uint8Array([80, 75, 3, 4]), { status: 200 }));
  vi.stubGlobal("fetch", fetcher);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetAllMocks(); });

describe("webhook premium fulfilment", () => {
  it("generates the plan on the server and sends it to the Stripe purchaser once", async () => {
    expect((await POST(request())).status).toBe(200);
    expect(fetcher).toHaveBeenCalledWith("https://app.invalid/api/generate-plan", expect.anything());
    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(mocks.send.mock.calls[0][0]).toMatchObject({
      customerEmail: "buyer@example.test",
      formData: order.form_data,
      fileName: "消防計画_テストビル.docx",
      sessionId: "cs_test_premium",
    });
    expect(mocks.updates.at(-1)).toEqual({ premium_email_sent_at: expect.any(String) });
  });

  it("does not resend when premium_email_sent_at is already set", async () => {
    mocks.lookup.mockResolvedValue({ data: { ...order, premium_email_sent_at: "2026-11-27T00:00:00.000Z" }, error: null });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("does not send when the success page already claimed the order", async () => {
    mocks.claim = { data: [], error: null };
    expect((await POST(request())).status).toBe(200);
    expect(fetcher).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("still answers 200 and releases the claim when sending fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.send.mockRejectedValue(new Error("resend down"));
    expect((await POST(request())).status).toBe(200);
    expect(mocks.updates.at(-1)).toEqual({ premium_email_sent_at: null });
  });

  it("does not generate anything for a standard order", async () => {
    mocks.lookup.mockResolvedValue({ data: { ...order, plan_id: "standard" }, error: null });
    expect((await POST(request())).status).toBe(200);
    expect(fetcher).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
