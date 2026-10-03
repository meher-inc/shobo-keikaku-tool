import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ event: vi.fn(), lookup: vi.fn(), update: vi.fn() }));
vi.mock("stripe", () => ({ default: class { webhooks = { constructEvent: mocks.event }; } }));
vi.mock("resend", () => ({ Resend: class {} }));
vi.mock("../sendPremiumReview", () => ({ sendPremiumReview: vi.fn() }));
vi.mock("../subscriptions", () => ({ upsertSubscriptionFromStripe: vi.fn() }));
vi.mock("../supabase", () => ({ supabaseAdmin: { from: () => ({
  select: () => ({ eq: () => ({ maybeSingle: mocks.lookup }) }), update: mocks.update,
}) } }));
import { POST } from "../../app/api/webhook/stripe/route";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-20T00:00:00Z"));
  mocks.event.mockReturnValue({
    type: "checkout.session.completed", created: Date.parse("2026-09-01T03:00:00Z") / 1000,
    data: { object: { id: "cs_test", mode: "payment", payment_status: "paid", metadata: { order_id: "order-test" }, created: Date.parse("2026-09-01T02:00:00Z") / 1000 } },
  });
  mocks.lookup.mockResolvedValue({ data: { id: "order-test", status: "pending", plan_id: "standard" }, error: null });
  mocks.update.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("External requests are forbidden in these tests"); }));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.resetAllMocks(); });

describe("purchase completion timestamp", () => {
  it("records event completion time even when delivery is delayed", async () => {
    expect((await POST(new NextRequest("https://preview.invalid/api/webhook/stripe", { method: "POST", body: "synthetic" }))).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ paid_at: "2026-09-01T03:00:00.000Z" }));
  });

  it("does not reset an already paid purchase on webhook retries", async () => {
    mocks.lookup.mockResolvedValue({ data: { id: "order-test", status: "paid", plan_id: "standard" }, error: null });
    await POST(new NextRequest("https://preview.invalid/api/webhook/stripe", { method: "POST", body: "synthetic" }));
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
