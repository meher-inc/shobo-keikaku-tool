import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const context = { fire_department: "京都市消防局", building_use: "3-ロ" };
const data = new Map<string,string>();
let events: unknown[][];
let gaSessionId: string;
let client: typeof import("../analytics-client");
beforeEach(async () => {
  vi.resetModules(); data.clear(); events=[]; gaSessionId="1790899200";
  vi.stubGlobal("localStorage", { getItem: (k:string) => data.get(k) || null, setItem: (k:string,v:string) => data.set(k,v) });
  vi.stubGlobal("document", { referrer: "https://search.example.com/find?email=secret@example.com" });
  vi.stubGlobal("window", { location: { href: "https://plan.todokede.jp/?utm_source=google&utm_medium=cpc&gclid=TEST_gclid", search: "?utm_source=google&utm_medium=cpc&gclid=TEST_gclid" }, gtag: (...args: unknown[]) => {
    events.push(args);
    if (args[0] === "get") (args[3] as (s:string)=>void)(args[2]==="client_id" ? "12345.1790899200" : gaSessionId);
    if(args[1]==="begin_checkout") (args[2] as {event_callback:()=>void}).event_callback();
  } });
  client = await import("../analytics-client");
});
afterEach(()=>{ vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });
const sent = (name:string)=>events.filter(e=>e[0]==="event"&&e[1]===name);

describe("browser funnel",()=>{
  it("sends the required sequence, once per step/session",async()=>{
    await client.trackFormStart(context); await client.trackFormStart(context);
    for(let i=1;i<=5;i++){await client.trackFormStep(i,context);await client.trackFormStep(i,context);}
    await client.trackFormComplete(context);await client.trackFormComplete(context);
    expect(sent("form_start")).toHaveLength(1);
    expect(sent("form_step").map(e=>(e[2] as {step_number:number}).step_number)).toEqual([1,2,3,4,5]);
    expect(sent("form_complete")).toHaveLength(1);
    expect(JSON.stringify(events)).not.toContain("secret@example.com");
  });
  it("persists first touch without overwriting it at later visits",()=>{
    const first=client.firstTouch();
    window.location.search="?utm_source=other";
    expect(client.firstTouch()).toEqual(first);
    expect(first).toMatchObject({utm_source:"google",gclid:"TEST_gclid",referrer:"https://search.example.com"});
  });
  it("does not duplicate form_start across reloads",async()=>{
    await client.trackFormStart(context);vi.resetModules();
    const reloaded=await import("../analytics-client");await reloaded.trackFormStart(context);
    expect(sent("form_start")).toHaveLength(1);
  });
  it("starts again when GA4 assigns a new session",async()=>{
    vi.useFakeTimers();await client.trackFormStart(context);vi.advanceTimersByTime(30*60*1000);gaSessionId="1790901000";await client.trackFormStart(context);
    expect(sent("form_start")).toHaveLength(2);
  });
  it("does not approximate a known GA session with form inactivity",async()=>{
    vi.useFakeTimers(); await client.trackFormStart(context);
    vi.advanceTimersByTime(31*60*1000); await client.trackFormStart(context);
    expect(sent("form_start")).toHaveLength(1);
  });
  it("collects gtag identifiers and sends checkout for each selected plan",async()=>{
    expect(await client.checkoutAnalytics(context)).toMatchObject({client_id:"12345.1790899200",session_id:"1790899200",...context});
    for(const plan of ["light","standard","premium"]) await client.trackBeginCheckout(plan,context);
    expect(sent("begin_checkout").map(e=>(e[2] as {value:number}).value)).toEqual([4980,9800,29800]);
    expect(sent("purchase")).toHaveLength(0);
  });
  it("still tracks without browser storage",async()=>{
    vi.stubGlobal("localStorage",{getItem:()=>{throw Error();},setItem:()=>{throw Error();}});
    await client.trackFormStart(context);await client.trackFormStart(context);
    expect(sent("form_start")).toHaveLength(1);
  });
  it("does not block checkout when gtag is unavailable",async()=>{
    vi.useFakeTimers();(window as Window & {gtag?:unknown}).gtag=undefined;
    const pending=client.checkoutAnalytics(context);await vi.advanceTimersByTimeAsync(1200);
    expect(await pending).toBeUndefined();
  });
  it("sends a page view only to the funnel destination",()=>{
    client.trackPageView();
    expect(sent("page_view")).toHaveLength(1);
    expect(sent("page_view")[0][2]).toMatchObject({send_to:"G-TF01DPKTPQ"});
  });
  it("does not block payment when a third-party tag throws",async()=>{
    vi.useFakeTimers();
    (window as Window & {gtag?:unknown}).gtag=()=>{throw Error("tag failed");};
    const formEvent=client.trackFormStart(context);
    await vi.advanceTimersByTimeAsync(1200);
    await expect(formEvent).resolves.toBeUndefined();
    const pending=client.trackBeginCheckout("standard",context);
    await vi.advanceTimersByTimeAsync(800);
    await expect(pending).resolves.toBeUndefined();
  });
});
