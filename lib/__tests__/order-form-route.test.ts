import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  retrieve: vi.fn(), lookup: vi.fn(), update: vi.fn(), save: vi.fn(), internalEmail: vi.fn(),
}));
vi.mock("stripe", () => ({ default: class { checkout = { sessions: { retrieve: mocks.retrieve } }; } }));
vi.mock("../internal-session", () => ({ getInternalSessionEmail: mocks.internalEmail }));
vi.mock("../supabase", () => ({ supabaseAdmin: { from: () => ({
  select: () => ({ eq: () => ({ maybeSingle: mocks.lookup }) }),
  update: mocks.update,
}) } }));

import { GET, POST } from "../../app/api/order-form/route";

const paidAt = "2026-09-01T03:00:00.000Z";
const sentAt = "2026-09-11T03:00:00.000Z";
const expiresAt = "2026-09-18T03:00:00.000Z";
const order = {
  id: "order-test", plan_id: "premium", paid_at: paidAt,
  premium_comments_sent_at: sentAt, status: "paid", form_data: {},
  amount: 0, customer_email: "owner@example.invalid",
};
const get = (query = "session_id=cs_test") => GET(new NextRequest(`https://preview.invalid/api/order-form?${query}`));
const post = (body: Record<string, unknown>) => POST(new NextRequest("https://preview.invalid/api/order-form", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-17T03:00:00Z"));
  mocks.retrieve.mockResolvedValue({ payment_status: "paid", created: Date.parse(paidAt) / 1000 - 3600 });
  mocks.lookup.mockResolvedValue({ data: { ...order }, error: null });
  mocks.update.mockReturnValue({ eq: mocks.save });
  mocks.save.mockResolvedValue({ error: null });
  mocks.internalEmail.mockResolvedValue("owner@example.invalid");
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("External requests are forbidden in these tests"); }));
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.resetAllMocks(); });

describe("order-form deadline enforcement", () => {
  it("returns the extended date to the form and allows saving after day 14", async () => {
    expect(await (await get()).json()).toMatchObject({ editable: true, edit_expires_at: expiresAt });
    expect((await post({ session_id: "cs_test", form_data: { building_name: "test" } })).status).toBe(200);
  });

  it("allows the exact deadline and denies both GET availability and POST a millisecond later", async () => {
    vi.setSystemTime(new Date(expiresAt));
    expect((await post({ session_id: "cs_test", form_data: {} })).status).toBe(200);
    vi.setSystemTime(new Date(Date.parse(expiresAt) + 1));
    expect(await (await get()).json()).toMatchObject({ editable: false, edit_expires_at: expiresAt });
    mocks.update.mockClear();
    expect((await post({ session_id: "cs_test", form_data: {} })).status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it.each([null, undefined])("keeps existing purchases without comments at 14 days (%s)", async (sent) => {
    mocks.lookup.mockResolvedValue({ data: { ...order, premium_comments_sent_at: sent }, error: null });
    expect(await (await get()).json()).toMatchObject({ editable: false, edit_expires_at: "2026-09-15T03:00:00.000Z" });
    expect((await post({ session_id: "cs_test", form_data: {} })).status).toBe(403);
  });

  it("uses the old session timestamp only when paid_at is absent", async () => {
    mocks.lookup.mockResolvedValue({ data: { ...order, paid_at: null, premium_comments_sent_at: null }, error: null });
    expect(await (await get()).json()).toMatchObject({ edit_expires_at: "2026-09-15T02:00:00.000Z" });
  });

  it("does not let client-supplied fields extend the deadline or change the plan", async () => {
    expect((await post({ session_id: "cs_test", premium_comments_sent_at: "2099-01-01", paid_at: "2099-01-01", form_data: { plan: "light" } })).status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith({ form_data: { plan: "premium" } });
    mocks.lookup.mockResolvedValue({ data: { ...order, premium_comments_sent_at: null }, error: null });
    mocks.update.mockClear();
    expect((await post({ session_id: "cs_test", premium_comments_sent_at: sentAt, form_data: {} })).status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("rejects an unpaid Stripe session before looking up the order", async () => {
    mocks.retrieve.mockResolvedValue({ payment_status: "unpaid" });
    expect((await get()).status).toBe(400);
    expect(mocks.lookup).not.toHaveBeenCalled();
  });

  it("applies the same deadline to authenticated internal purchases", async () => {
    expect(await (await get("internal_order_id=order-test")).json()).toMatchObject({ editable: true, edit_expires_at: expiresAt, internal: true });
    expect((await post({ internal_order_id: "order-test", form_data: {} })).status).toBe(200);
    expect(mocks.retrieve).not.toHaveBeenCalled();
  });

  it("retains internal login and order-ownership protection", async () => {
    mocks.internalEmail.mockResolvedValue(null);
    expect((await get("internal_order_id=order-test")).status).toBe(401);
    mocks.internalEmail.mockResolvedValue("other@example.invalid");
    expect((await post({ internal_order_id: "order-test", form_data: {} })).status).toBe(403);
    mocks.internalEmail.mockResolvedValue("owner@example.invalid");
    mocks.lookup.mockResolvedValue({ data: { ...order, amount: 29800 }, error: null });
    expect((await get("internal_order_id=order-test")).status).toBe(403);
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
