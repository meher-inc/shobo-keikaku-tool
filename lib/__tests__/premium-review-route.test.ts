import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  retrieve: vi.fn(),
  lookup: vi.fn(),
  lookupKeys: [] as Array<[string, unknown]>,
  updates: [] as Array<Record<string, unknown>>,
  claim: { data: [{ id: "order-premium" }] as unknown, error: null as unknown },
  release: { error: null as unknown },
  send: vi.fn(),
}));
vi.mock("stripe", () => ({
  default: class {
    checkout = { sessions: { retrieve: mocks.retrieve } };
  },
}));
vi.mock("../sendPremiumReview", () => ({ sendPremiumReview: mocks.send }));
vi.mock("../supabase", () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: (column: string, value: unknown) => {
          mocks.lookupKeys.push([column, value]);
          return { maybeSingle: () => mocks.lookup(column, value) };
        },
      }),
      // claim:   update().eq("id").is("premium_email_sent_at", null).select("id")
      // release: update().eq("id").eq("premium_email_sent_at", claimedAt)
      update: (values: Record<string, unknown>) => {
        mocks.updates.push(values);
        return {
          eq: () => ({
            is: () => ({ select: async () => mocks.claim }),
            eq: async () => mocks.release,
          }),
        };
      },
    }),
  },
}));
import { POST } from "../../app/api/premium-review/route";

const SESSION_ID = "cs_test_premium123";
const paidSession = {
  id: SESSION_ID,
  mode: "payment",
  payment_status: "paid",
  customer_details: { email: "buyer@example.test" },
  metadata: { order_id: "order-premium" },
};
const premiumOrder = {
  id: "order-premium",
  plan_id: "premium",
  form_data: { building_name: "テストビル" },
  premium_email_sent_at: null,
  customer_email: "buyer@example.test",
};

const post = (body: unknown, host = "preview.invalid") =>
  POST(
    new NextRequest(`https://${host}/api/premium-review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );

let fetcher: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.stubEnv("INTERNAL_GENERATE_SECRET", "local-test-only");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.invalid");
  mocks.lookupKeys.length = 0;
  mocks.updates.length = 0;
  mocks.claim = { data: [{ id: "order-premium" }], error: null };
  mocks.release = { error: null };
  mocks.retrieve.mockResolvedValue(paidSession);
  mocks.lookup.mockResolvedValue({ data: premiumOrder, error: null });
  mocks.send.mockResolvedValue(undefined);
  fetcher = vi.fn().mockResolvedValue(new Response(new Uint8Array([80, 75, 3, 4]), { status: 200 }));
  vi.stubGlobal("fetch", fetcher);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe("/api/premium-review", () => {
  it("sends only to the Stripe purchaser with a server-generated plan, ignoring client fields", async () => {
    const res = await post({
      sessionId: SESSION_ID,
      customerEmail: "attacker@example.test",
      planId: "premium",
      formData: { building_name: "偽の内容" },
      docxBase64: "QUJD",
      fileName: "evil.docx",
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mocks.retrieve).toHaveBeenCalledWith(SESSION_ID);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("https://app.invalid/api/generate-plan");
    expect(init.body).toBe(JSON.stringify(premiumOrder.form_data));
    expect(init.headers["x-todokede-internal-generate"]).toBe("local-test-only");
    expect(mocks.send).toHaveBeenCalledTimes(1);
    const sent = mocks.send.mock.calls[0][0];
    expect(sent.customerEmail).toBe("buyer@example.test");
    expect(sent.formData).toEqual(premiumOrder.form_data);
    expect(sent.fileName).toBe("消防計画_テストビル.docx");
    expect(Buffer.isBuffer(sent.docxBuffer)).toBe(true);
    expect(sent.sessionId).toBe(SESSION_ID);
    expect(mocks.updates).toEqual([{ premium_email_sent_at: expect.any(String) }]);
  });

  it("never sends the internal generate secret to the request's Host", async () => {
    await post({ sessionId: SESSION_ID }, "attacker.invalid");
    expect(fetcher.mock.calls[0][0]).toBe("https://app.invalid/api/generate-plan");
  });

  it("rejects requests without a valid sessionId before calling Stripe", async () => {
    for (const body of [
      { planId: "premium", customerEmail: "attacker@example.test", docxBase64: "QUJD" },
      { sessionId: "" },
      { sessionId: "order-premium" },
      { sessionId: 123 },
    ]) {
      expect((await post(body)).status).toBe(400);
    }
    expect(mocks.retrieve).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("returns 404 when Stripe does not know the session", async () => {
    mocks.retrieve.mockRejectedValue(
      Object.assign(new Error("No such checkout.session"), { type: "StripeInvalidRequestError" })
    );
    expect((await post({ sessionId: SESSION_ID })).status).toBe(404);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("returns 502 when Stripe itself fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.retrieve.mockRejectedValue(Object.assign(new Error("down"), { type: "StripeConnectionError" }));
    expect((await post({ sessionId: SESSION_ID })).status).toBe(502);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("does not send for an unpaid session", async () => {
    mocks.retrieve.mockResolvedValue({ ...paidSession, payment_status: "unpaid" });
    expect((await post({ sessionId: SESSION_ID })).status).toBe(403);
    expect(mocks.lookup).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("does not send for a subscription checkout session", async () => {
    mocks.retrieve.mockResolvedValue({ ...paidSession, mode: "subscription" });
    expect((await post({ sessionId: SESSION_ID })).status).toBe(403);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("does not send for a non-premium order", async () => {
    mocks.lookup.mockResolvedValue({ data: { ...premiumOrder, plan_id: "standard" }, error: null });
    expect((await post({ sessionId: SESSION_ID })).status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("skips when the webhook already sent the request", async () => {
    mocks.lookup.mockResolvedValue({
      data: { ...premiumOrder, premium_email_sent_at: "2026-11-27T00:00:00.000Z" },
      error: null,
    });
    const res = await post({ sessionId: SESSION_ID });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, skipped: "already_sent" });
    expect(fetcher).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.updates).toEqual([]);
  });

  it("sends nothing when a concurrent caller already claimed the order", async () => {
    mocks.claim = { data: [], error: null };
    const res = await post({ sessionId: SESSION_ID });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, skipped: "already_sent" });
    expect(fetcher).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("sends nothing when the claim update fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.claim = { data: null, error: { message: "db down" } };
    expect((await post({ sessionId: SESSION_ID })).status).toBe(500);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("falls back to stripe_session_id when metadata has no order_id", async () => {
    mocks.retrieve.mockResolvedValue({ ...paidSession, metadata: {} });
    expect((await post({ sessionId: SESSION_ID })).status).toBe(200);
    expect(mocks.lookupKeys).toEqual([["stripe_session_id", SESSION_ID]]);
  });

  it("falls back to stripe_session_id when metadata.order_id does not match an order", async () => {
    mocks.lookup.mockImplementation(async (column: string) =>
      column === "id" ? { data: null, error: null } : { data: premiumOrder, error: null }
    );
    expect((await post({ sessionId: SESSION_ID })).status).toBe(200);
    expect(mocks.lookupKeys).toEqual([["id", "order-premium"], ["stripe_session_id", SESSION_ID]]);
  });

  it("returns 404 when no order matches", async () => {
    mocks.lookup.mockResolvedValue({ data: null, error: null });
    expect((await post({ sessionId: SESSION_ID })).status).toBe(404);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("returns a fixed 500 message when the order lookup fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.lookup.mockResolvedValue({ data: null, error: { message: "secret db detail" } });
    const res = await post({ sessionId: SESSION_ID });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "送信に失敗しました" });
  });

  it("returns 422 when no purchaser email is available", async () => {
    mocks.retrieve.mockResolvedValue({ ...paidSession, customer_details: null, customer_email: null });
    mocks.lookup.mockResolvedValue({ data: { ...premiumOrder, customer_email: null }, error: null });
    expect((await post({ sessionId: SESSION_ID })).status).toBe(422);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("releases the claim when generation fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    fetcher.mockResolvedValue(new Response("boom", { status: 500 }));
    const res = await post({ sessionId: SESSION_ID });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "送信に失敗しました" });
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.updates).toEqual([
      { premium_email_sent_at: expect.any(String) },
      { premium_email_sent_at: null },
    ]);
  });

  it("releases the claim when email sending fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.send.mockRejectedValue(new Error("resend down"));
    expect((await post({ sessionId: SESSION_ID })).status).toBe(500);
    expect(mocks.updates.at(-1)).toEqual({ premium_email_sent_at: null });
  });
});
