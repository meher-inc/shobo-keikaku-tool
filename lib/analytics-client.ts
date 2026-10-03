import { ATTRIBUTION_KEYS, FUNNEL_MEASUREMENT_ID, analyticsContext, sanitizeAttribution, safePageLocation, safeReferrer, type AnalyticsContext, type Attribution, type CheckoutAnalytics } from "./analytics-schema";
import { getSpotPlan } from "./spot-plans";

const FIRST_TOUCH_KEY = "todokede-plan-first-touch-v1";
const SESSION_KEY = "todokede-plan-funnel-session-v1";
const SESSION_TIMEOUT = 30 * 60 * 1000;
type FunnelSession = { id: string; gaSessionId?: string; touchedAt: number; events: string[] };
let memorySession: FunnelSession | undefined;
let memoryAttribution: Attribution | undefined;
let pendingFunnelEvents: Promise<void> = Promise.resolve();

function gtag(...args: unknown[]) {
  const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  w.dataLayer ??= [];
  try {
    if (w.gtag) w.gtag(...args);
    else w.dataLayer.push(args);
  } catch { /* Analytics must not interrupt form input or payment. */ }
}

export function firstTouch(): Attribution {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(FIRST_TOUCH_KEY);
    if (saved) return sanitizeAttribution(JSON.parse(saved));
  } catch { /* Storage restrictions must not block checkout. */ }
  if (memoryAttribution) return memoryAttribution;
  const query = new URLSearchParams(window.location.search);
  memoryAttribution = sanitizeAttribution({ ...Object.fromEntries(ATTRIBUTION_KEYS.map(k => [k, query.get(k)])), referrer: document.referrer });
  try { localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(memoryAttribution)); } catch { /* no storage */ }
  return memoryAttribution;
}

function getSession(gaSessionId?: string): FunnelSession {
  let state = memorySession;
  try { state = JSON.parse(localStorage.getItem(SESSION_KEY) || "null") || state; } catch { /* no storage */ }
  if (!state || !Array.isArray(state.events) || !Number.isFinite(state.touchedAt) ||
      (gaSessionId && state.gaSessionId && gaSessionId !== state.gaSessionId) ||
      ((!gaSessionId || !state.gaSessionId) && Date.now() - state.touchedAt >= SESSION_TIMEOUT)) {
    state = { id: crypto.randomUUID(), touchedAt: Date.now(), events: [] };
  }
  if (gaSessionId) state.gaSessionId = gaSessionId;
  state.touchedAt = Date.now();
  memorySession = state;
  return state;
}

function firstInSession(event: string, gaSessionId?: string): boolean {
  const state = getSession(gaSessionId);
  const first = !state.events.includes(event);
  if (first) state.events.push(event);
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(state)); } catch { /* no storage */ }
  return first;
}

function eventParams(context: AnalyticsContext) {
  const first = firstTouch();
  return {
    ...analyticsContext(context.fire_department, context.building_use),
    send_to: FUNNEL_MEASUREMENT_ID,
    page_location: safePageLocation(window.location.href),
    page_referrer: safeReferrer(document.referrer) || "",
    first_source: first.utm_source || (first.referrer ? new URL(first.referrer).hostname : "(direct)"),
    first_medium: first.utm_medium || (first.referrer ? "referral" : "(none)"),
    ...(first.utm_campaign ? { first_campaign: first.utm_campaign } : {}),
    ...(process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true" ? { debug_mode: true } : {}),
  };
}

function trackUnique(event: string, key: string, context: AnalyticsContext, params: Record<string, unknown> = {}) {
  pendingFunnelEvents = pendingFunnelEvents.then(async () => {
    const sessionId = await getGoogleValue("session_id");
    if (firstInSession(key, sessionId)) gtag("event", event, { ...eventParams(context), ...params });
  }).catch(() => { /* Analytics must not interrupt the form. */ });
  return pendingFunnelEvents;
}

export function trackFormStart(context: AnalyticsContext) {
  return trackUnique("form_start", "form_start", context);
}

export function trackFormStep(step: number, context: AnalyticsContext) {
  if (step < 1 || step > 5) return;
  trackFormStart(context);
  return trackUnique("form_step", `form_step_${step}`, context, { step_number: step });
}

export function trackFormComplete(context: AnalyticsContext) {
  trackFormStart(context);
  return trackUnique("form_complete", "form_complete", context);
}

function getGoogleValue(field: "client_id" | "session_id"): Promise<string | undefined> {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(undefined), 1200);
    gtag("get", FUNNEL_MEASUREMENT_ID, field, (value: unknown) => {
      clearTimeout(timer);
      resolve(typeof value === "string" || typeof value === "number" ? String(value) : undefined);
    });
  });
}

export async function checkoutAnalytics(context: AnalyticsContext): Promise<CheckoutAnalytics | undefined> {
  const [client_id, session_id] = await Promise.all([getGoogleValue("client_id"), getGoogleValue("session_id")]);
  if (!client_id || !session_id) return undefined;
  return { ...analyticsContext(context.fire_department, context.building_use), client_id, session_id, attribution: firstTouch() };
}

export function trackBeginCheckout(planId: string, context: AnalyticsContext): Promise<void> {
  const plan = getSpotPlan(planId);
  if (!plan) return Promise.resolve();
  return new Promise(resolve => {
    const timer = setTimeout(resolve, 800);
    gtag("event", "begin_checkout", {
      ...eventParams(context), plan: plan.id, value: plan.price, currency: "JPY",
      items: [{ item_id: plan.id, item_name: plan.id, price: plan.price, quantity: 1 }],
      event_callback: () => { clearTimeout(timer); resolve(); }, event_timeout: 800,
    });
  });
}

export function trackPageView() {
  firstTouch();
  gtag("set", { page_location: safePageLocation(window.location.href), page_referrer: safeReferrer(document.referrer) || "" });
  // Broadcasting to both legacy and current tag IDs duplicates this hit in GA4.
  gtag("event", "page_view", eventParams(analyticsContext(undefined, undefined)));
}
