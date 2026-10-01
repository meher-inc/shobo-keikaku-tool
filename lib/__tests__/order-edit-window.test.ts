import { describe, expect, it } from "vitest";
import { getOrderEditWindow } from "../order-edit-window";

const paidAt = "2026-09-01T03:00:00.000Z";
const at = (day: number) => Date.parse(paidAt) + day * 86_400_000;
const iso = (day: number) => new Date(at(day)).toISOString();

describe("order edit deadline", () => {
  it.each([undefined, null])("keeps legacy premium purchases at 14 days (%s)", (commentsSentAt) => {
    const order = { planId: "premium", paidAt, commentsSentAt };
    expect(getOrderEditWindow(order, at(14))).toEqual({ editable: true, expiresAt: iso(14) });
    expect(getOrderEditWindow(order, at(14) + 1).editable).toBe(false);
  });

  it.each([0, 3, 7, 10, 14, 20])("uses the later deadline when comments arrive on day %s", (sentDay) => {
    const lastDay = Math.max(14, sentDay + 7);
    const order = { planId: "premium", paidAt, commentsSentAt: iso(sentDay) };
    expect(getOrderEditWindow(order, at(lastDay) - 1).editable).toBe(true);
    expect(getOrderEditWindow(order, at(lastDay))).toEqual({ editable: true, expiresAt: iso(lastDay) });
    expect(getOrderEditWindow(order, at(lastDay) + 1).editable).toBe(false);
  });

  it.each(["light", "standard"])("does not extend %s purchases", (planId) => {
    expect(getOrderEditWindow({ planId, paidAt, commentsSentAt: iso(10) }, at(15)))
      .toEqual({ editable: false, expiresAt: iso(14) });
  });

  it.each(["invalid", iso(-1), iso(30)])("ignores invalid, pre-purchase or future comments: %s", (commentsSentAt) => {
    expect(getOrderEditWindow({ planId: "premium", paidAt, commentsSentAt }, at(15)))
      .toEqual({ editable: false, expiresAt: iso(14) });
  });

  it.each([null, "invalid", iso(30)])("fails closed for an invalid purchase time: %s", (purchaseTime) => {
    expect(getOrderEditWindow({ planId: "premium", paidAt: purchaseTime, commentsSentAt: iso(10) }, at(15)))
      .toEqual({ editable: false, expiresAt: null });
  });

  it("treats timezone offsets as the same instant", () => {
    expect(getOrderEditWindow({ planId: "premium", paidAt: "2026-09-01T12:00:00+09:00", commentsSentAt: "2026-09-11T12:00:00+09:00" }, at(17)))
      .toEqual({ editable: true, expiresAt: iso(17) });
  });
});
