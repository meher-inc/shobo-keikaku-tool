export const PURCHASE_EDIT_DAYS = 14;
export const PREMIUM_COMMENT_EDIT_DAYS = 7;
const DAY_MS = 86_400_000;

type OrderEditWindowInput = {
  planId: string;
  paidAt: string | null | undefined;
  commentsSentAt?: string | null;
};

/** One deadline for both displaying edit availability and authorizing saves. */
export function getOrderEditWindow(
  { planId, paidAt, commentsSentAt }: OrderEditWindowInput,
  now = Date.now(),
) {
  const paidMs = paidAt ? Date.parse(paidAt) : NaN;
  if (!Number.isFinite(paidMs) || paidMs > now) {
    return { editable: false, expiresAt: null };
  }

  let expiresMs = paidMs + PURCHASE_EDIT_DAYS * DAY_MS;
  const commentsMs = commentsSentAt ? Date.parse(commentsSentAt) : NaN;
  if (
    planId === "premium" &&
    Number.isFinite(commentsMs) &&
    commentsMs >= paidMs &&
    commentsMs <= now
  ) {
    expiresMs = Math.max(expiresMs, commentsMs + PREMIUM_COMMENT_EDIT_DAYS * DAY_MS);
  }

  return {
    editable: now <= expiresMs,
    expiresAt: new Date(expiresMs).toISOString(),
  };
}
