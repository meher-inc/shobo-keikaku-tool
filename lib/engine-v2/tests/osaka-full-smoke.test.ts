import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildOsakaFull } from "../adapters/osaka-full";

/**
 * Phase 2A Step 4 smoke tests for the Osaka 中・小規模 v2 path.
 *
 * Drives buildOsakaFull end-to-end (form → toRenderData →
 * extendForOsaka → loadPack → filterPack → buildCoverPage →
 * buildChildrenFromPack → buildOsakaAppendix*… → Document →
 * Packer.toBuffer → unzip → word/document.xml string + structural
 * assertions).
 *
 * Following Step 4d Phase1 教訓: chapter title / appendix heading
 * string presence is checked alongside <w:tbl> table counts so that
 * gating regressions are caught structurally, not just via text.
 *
 * Test matrix (O1–O4 + 6 auxiliary cases = 10 tests):
 *   O1: outsourced=true   × plan=light    (body emit, appendix skip)
 *   O2: outsourced=false  × plan=light    (body skip, appendix skip)
 *   O3: outsourced=true   × plan=standard × member fallback
 *   O4: outsourced=false  × plan=standard × full member set
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

/** Detect ONLY the 別表9 appendix heading (not the body reference).
 * Appendix heading format: "別表９　（building）地区隊の編成と任務"
 * Body reference format:   "「（building）地区隊の編成と任務」（別表９）"
 * Only the appendix uses 別表９ + 全角スペース prefix; body uses
 * 別表９ inside parens (suffix).
 */
const APPENDIX9_HEADING_RE = /別表９　（[^）]+）地区隊の編成と任務/;

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "大阪テストビル",
    creation_date_iso: "2026-04-29",
    ...formOverrides,
  };

  const buf = await buildOsakaFull(form);
  expect(Buffer.isBuffer(buf)).toBe(true);
  expect(buf.length).toBeGreaterThan(5_000);
  expect(buf.subarray(0, 4).equals(ZIP_MAGIC)).toBe(true);

  const zip = await JSZip.loadAsync(buf);
  const file = zip.file("word/document.xml");
  if (!file) throw new Error("word/document.xml missing");
  const xml = await file.async("string");
  const tblCount = (xml.match(/<w:tbl[^A-Za-z]/g) || []).length;
  return { buf, xml, tblCount };
}

describe("osaka 中・小規模 v2 smoke tests", () => {
  // ── Auxiliary 1: chapter ordering (第1–第8) ───────────────────

  it("contains all chapter titles in 第１〜第８ order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "第１　総則",
      "第２　予防的活動",
      "第３　地震対策",
      "第４　自衛消防組織",
      "第５　災害発生時の活動",
      "第６　南海トラフ地震対策",
      "第７　教育訓練",
      "第８　計画の実施日",
    ];
    let lastIdx = -1;
    for (const t of titles) {
      const idx = xml.indexOf(t);
      expect(idx, `missing chapter title: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  // ── Auxiliary 2: 大阪独自で第6章 南海トラフ常時 emit ──────────

  it("第6章 南海トラフ地震対策 + 5 sections always emitted", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("第６　南海トラフ地震対策");
    // 5 sections of ch6 (osaka-specific, gating-free)
    expect(xml).toContain("１　注意報等発表時の措置");
    expect(xml).toContain("２　津波避難");
    expect(xml).toContain("３　後発地震への警戒・注意措置");
    expect(xml).toContain("４　南海トラフ地震に関する訓練");
    expect(xml).toContain("５　顧客等に対する事前広報");
  });

  // ── Auxiliary 3: 帰宅困難者条文は大阪に欠ける（回帰確認）──────

  it("does NOT contain 帰宅困難者 article (osaka-specific absence vs tokyo/yokohama)", async () => {
    const { xml } = await renderAndUnzip();
    // tokyo (帰宅困難者対策章) and yokohama (第36条 / 第45条) have
    // 帰宅困難者-named articles; osaka does not. The absence is a
    // recon-confirmed differentiator.
    expect(xml).not.toContain("帰宅困難者");
  });

  // ── Auxiliary 4: tsunamiEvac placeholder fill ────────────────

  it("第6章2節 fills tsunamiEvac placeholder, falls back when unset", async () => {
    const { xml: xmlSet } = await renderAndUnzip({
      tsunami_evac: "大阪市立中央小学校",
    });
    expect(xmlSet).toContain("大阪市立中央小学校");

    const { xml: xmlUnset } = await renderAndUnzip();
    // Default fallback per JSON pack: 「別途定める高台等」
    expect(xmlUnset).toContain("別途定める高台等");
  });

  // ── Auxiliary 5: cover subtitle ───────────────────────────────

  it("cover subtitle is 【中・小規模事業所・テナント用】 (osaka Step 2 design)", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【中・小規模事業所・テナント用】");
  });

  // ── Auxiliary 6: 別表9 builds with buildingName placeholder ──

  it("別表9 heading carries buildingName placeholder (appendix-side only)", async () => {
    const { xml } = await renderAndUnzip({
      building_name: "大阪テストビル",
      // include_appendix on (default plan = standard)
    });
    // Appendix heading must include 別表９ + 全角スペース + parens
    expect(xml).toMatch(APPENDIX9_HEADING_RE);
    // Specifically the building name must land in the heading
    const m = xml.match(APPENDIX9_HEADING_RE);
    expect(m?.[0]).toContain("大阪テストビル");
  });

  // ── O1: outsourced=true × plan=light ──────────────────────────

  it("O1 outsourced=true × plan=light: body emit, appendix skip", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      has_outsourced_management: true,
      plan: "light",
    });
    // Body: ch1 第4 委託節 emit
    expect(xml).toContain("４　防火・防災管理業務の委託");
    // Appendix list and bodies fully suppressed
    expect(xml).not.toContain("別表等一覧");
    expect(xml).not.toMatch(APPENDIX9_HEADING_RE);
    expect(xml).not.toContain("別表１　防火・防災管理業務委託状況表");
    expect(tblCount).toBe(0);
  });

  // ── O2: outsourced=false × plan=light ─────────────────────────

  it("O2 outsourced=false × plan=light: body skip, appendix skip", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      plan: "light",
    });
    // Body: ch1 第4 委託節 hidden (gated by !outsourced)
    expect(xml).not.toContain("４　防火・防災管理業務の委託");
    // Appendix completely suppressed
    expect(xml).not.toContain("別表等一覧");
    expect(xml).not.toMatch(APPENDIX9_HEADING_RE);
    expect(tblCount).toBe(0);
  });

  // ── O3: outsourced=true × plan=standard × member fallback ────

  it("O3 outsourced=true × plan=standard × member fallback", async () => {
    // member fields intentionally unset → 別表9 falls back to "(    )"
    const { xml, tblCount } = await renderAndUnzip({
      has_outsourced_management: true,
    });
    // Body: ch1 第4 委託節 emit
    expect(xml).toContain("４　防火・防災管理業務の委託");
    // Appendix list emit + 別表1 stub emit (gated by outsourced) +
    // 別表9 emit
    expect(xml).toContain("別表等一覧");
    expect(xml).toContain("別表１　防火・防災管理業務委託状況表");
    expect(xml).toMatch(APPENDIX9_HEADING_RE);
    // member name fallback (no leaderName/tsuhouMember/etc supplied)
    expect(xml).not.toContain("山田太郎");
    expect(xml).not.toContain("佐藤花子");
    // tbl: 1 (list) + 1 (別表9) = 2 (stubs are plainText, not tbl)
    expect(tblCount).toBe(2);
  });

  // ── O4: outsourced=false × plan=standard × full members ──────

  it("O4 outsourced=false × plan=standard × full member set", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      leader_name: "山田太郎",
      tsuhou_member: "佐藤花子",
      shoka_member: "鈴木一郎",
      hinan_member: "高橋次郎",
      kyugo_member: "田中美咲",
      anzen_member: "渡辺健太",
    });
    // Body: ch1 第4 委託節 hidden
    expect(xml).not.toContain("４　防火・防災管理業務の委託");
    // Appendix list emit, 別表1 stub hidden (gated), 別表9 emit
    expect(xml).toContain("別表等一覧");
    expect(xml).not.toContain("別表１　防火・防災管理業務委託状況表");
    expect(xml).toMatch(APPENDIX9_HEADING_RE);
    // All 6 班 member names land in 別表9 rows
    expect(xml).toContain("山田太郎");
    expect(xml).toContain("佐藤花子");
    expect(xml).toContain("鈴木一郎");
    expect(xml).toContain("高橋次郎");
    expect(xml).toContain("田中美咲");
    expect(xml).toContain("渡辺健太");
    // tbl: 1 (list) + 1 (別表9) = 2 (別表1 hidden, all others stub plainText)
    expect(tblCount).toBe(2);
  });

  // ── Auxiliary 7 (placed last): osaka-specific appendix fields land ──

  it("osaka-specific fields (casualtyEstimate / propertyDamageEstimate) flow into RenderData", async () => {
    // These fields are extendForOsaka extensions used by Step 3
    // builders. In Phase 2A Step 4 the appendix bodies (別表2) are
    // STUBs so the values do not yet appear in xml — the test
    // asserts the adapter accepts them without error and that
    // STUB structure is intact.
    const { xml } = await renderAndUnzip({
      casualty_estimate: "軽傷者数名を想定",
      property_damage_estimate: "什器転倒・落下、軽微な内装損傷",
    });
    // Appendix 2 stub still emits its TODO marker
    expect(xml).toContain("別表２　災害想定");
    expect(xml).toContain("人的被害想定・物的被害想定");
    // The values themselves are not yet in xml because 別表2 is a
    // stub; this is the expected Phase 2A state. Phase 2B will
    // implement 別表2 fully and a follow-up smoke test will check
    // that the values land.
  });
});
