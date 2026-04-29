import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildYokohamaFull } from "../adapters/yokohama-full";

/**
 * Phase 2A Step 4 smoke tests for the Yokohama 一般用 v2 path.
 *
 * Drives buildYokohamaFull end-to-end (form → toRenderData →
 * extendForYokohama → loadPack → filterPack → buildCoverPage →
 * buildChildrenFromPack → buildYokohamaAppendix*… → Document →
 * Packer.toBuffer → unzip → word/document.xml string + structural
 * assertions).
 *
 * Following Step 4d Phase1 教訓: chapter title / appendix heading
 * string presence is checked alongside <w:tbl> table counts so that
 * gating regressions are caught structurally, not just via text.
 *
 * Test matrix (Y1–Y6):
 *   Y1 baseline      — all flags false (minimum case)
 *   Y2 outsource     — hasOutsourcedManagement = true
 *   Y3 unified-fpm   — requiresUnifiedFpm = true
 *   Y4 disaster-ctr  — hasDisasterCenter = true
 *   Y5 all-on        — every flag true (composite gating)
 *   Y6 plan=light    — every flag true but include_appendix off
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    company_name: "横浜テスト株式会社",
    creation_date_iso: "2026-04-29",
    ...formOverrides,
  };

  const buf = await buildYokohamaFull(form);
  expect(Buffer.isBuffer(buf)).toBe(true);
  expect(buf.length).toBeGreaterThan(5_000);
  // ZIP magic — confirms the buffer is a valid OOXML container.
  expect(buf.subarray(0, 4).equals(ZIP_MAGIC)).toBe(true);

  const zip = await JSZip.loadAsync(buf);
  const file = zip.file("word/document.xml");
  if (!file) throw new Error("word/document.xml missing");
  const xml = await file.async("string");
  // Count <w:tbl> opening tags (matches "<w:tbl " or "<w:tbl>" but
  // not "<w:tblPr" / "<w:tblGrid" / "<w:tblBorders" etc).
  const tblCount = (xml.match(/<w:tbl[^A-Za-z]/g) || []).length;
  return { buf, xml, tblCount };
}

describe("yokohama 一般用 v2 smoke tests", () => {
  // ── Chapter ordering (sanity for all cases) ───────────────────

  it("contains all chapter titles in 第1〜第7 + 附則 order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "第１章　総則",
      "第２章　火災予防対策",
      "第３章　自衛消防活動対策",
      "第４章　夜間、休日の防火管理体制",
      "第５章　震災対策",
      "第６章　防災教育及び自衛消防訓練",
      "第７章　防火管理業務の一部委託",
      "附　則",
    ];
    let lastIdx = -1;
    for (const t of titles) {
      const idx = xml.indexOf(t);
      expect(idx, `missing chapter title: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  // ── Yokohama 独自 unconditional emit ──────────────────────────

  it("Y1: emits 帰宅困難者条文 (第36条 + 第45条) unconditionally", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("第36条　帰宅困難者発生時の待機場所の確保等");
    expect(xml).toContain("第45条　帰宅困難者対応");
  });

  it("Y1: emits tsunami body (第43条 南海トラフ含む) unconditionally", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain(
      "第43条　地震発生時の自衛消防活動（南海トラフ地震等大規模地震対応含む）"
    );
    // tsunamiEvac placeholder fallback should land inline as
    // "別途定める高台等" when no override is provided.
    expect(xml).toContain("別途定める高台等");
  });

  // ── Y1: minimum case (all gating flags false) ─────────────────

  it("Y1 baseline (all flags false): no gated body, no gated appendices", async () => {
    const { xml, tblCount } = await renderAndUnzip();
    // body: 委託本体 hidden
    expect(xml).not.toContain("第56条　防火管理業務の一部委託");
    expect(xml).not.toContain("第57条　委託者からの指揮命令");
    expect(xml).not.toContain("第58条　委託者への報告");
    // body: 統括 inline + 独立条 hidden
    expect(xml).not.toContain("第３条第５項");
    expect(xml).not.toContain("第13条の２　統括防火管理者への報告");
    // 別表 1 + 2 stubs always emitted
    expect(xml).toContain("別表１　自主点検チェックリスト");
    expect(xml).toContain("別表２　自衛消防隊の組織及び任務分担");
    // 別表 3 + 4 hidden
    expect(xml).not.toContain("別表３　防災センター従事者一覧表");
    expect(xml).not.toContain("別表４　防火管理業務の委託状況表");
    // appendix list always emits 1 table when include_appendix is on
    expect(xml).toContain("別表等一覧");
    expect(tblCount).toBe(1);
  });

  // ── Y2: outsourced gating ─────────────────────────────────────

  it("Y2 outsourced=true: emits ch7 articles + 別表4", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      has_outsourced_management: true,
      outsource_company: "横浜テスト警備",
    });
    expect(xml).toContain("第56条　防火管理業務の一部委託");
    expect(xml).toContain("第57条　委託者からの指揮命令");
    expect(xml).toContain("第58条　委託者への報告");
    expect(xml).toContain("別表４　防火管理業務の委託状況表");
    expect(xml).toContain("横浜テスト警備");
    // 別表3 still hidden
    expect(xml).not.toContain("別表３　防災センター従事者一覧表");
    // 1 (list) + 1 (別表4 outsource table) = 2
    expect(tblCount).toBe(2);
  });

  // ── Y3: unified_fpm gating ────────────────────────────────────

  it("Y3 requires_unified_fpm=true: emits ch1-art3-第5項 + ch2-art13-2", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      requires_unified_fpm: true,
    });
    expect(xml).toContain("第３条第５項");
    expect(xml).toContain("第13条の２　統括防火管理者への報告");
    // outsource still hidden
    expect(xml).not.toContain("第56条　防火管理業務の一部委託");
    // 別表3/4 hidden
    expect(xml).not.toContain("別表３　防災センター従事者一覧表");
    expect(xml).not.toContain("別表４　防火管理業務の委託状況表");
    // unified gating affects body only — table count unchanged from baseline
    expect(tblCount).toBe(1);
  });

  // ── Y4: disaster_center gating ────────────────────────────────

  it("Y4 has_disaster_center=true: emits 別表3", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      has_disaster_center: true,
    });
    expect(xml).toContain("別表３　防災センター従事者一覧表");
    expect(xml).toContain("防災センターの運用は、防火管理者の指揮の下に行う");
    // outsource/unified hidden
    expect(xml).not.toContain("別表４　防火管理業務の委託状況表");
    expect(xml).not.toContain("第13条の２　統括防火管理者への報告");
    // 1 (list) + 1 (別表3 disaster center table) = 2
    expect(tblCount).toBe(2);
  });

  // ── Y5: all flags on (composite gating) ───────────────────────

  it("Y5 all flags true: every gated body + appendix is present", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      has_outsourced_management: true,
      outsource_company: "横浜テスト警備",
      requires_unified_fpm: true,
      has_disaster_center: true,
    });
    // body
    expect(xml).toContain("第56条　防火管理業務の一部委託");
    expect(xml).toContain("第３条第５項");
    expect(xml).toContain("第13条の２　統括防火管理者への報告");
    // appendix
    expect(xml).toContain("別表３　防災センター従事者一覧表");
    expect(xml).toContain("別表４　防火管理業務の委託状況表");
    // 1 (list) + 1 (別表3) + 1 (別表4) = 3
    expect(tblCount).toBe(3);
  });

  // ── Y6: plan=light → no appendices at all ─────────────────────

  it("Y6 plan=light (all flags true): body kept, appendices fully suppressed", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      has_outsourced_management: true,
      outsource_company: "横浜テスト警備",
      requires_unified_fpm: true,
      has_disaster_center: true,
      plan: "light",
    });
    // body gating still active (light plan only suppresses appendices)
    expect(xml).toContain("第56条　防火管理業務の一部委託");
    expect(xml).toContain("第13条の２　統括防火管理者への報告");
    // appendix list and bodies all suppressed
    expect(xml).not.toContain("別表等一覧");
    expect(xml).not.toContain("別表１　自主点検チェックリスト");
    expect(xml).not.toContain("別表２　自衛消防隊の組織及び任務分担");
    expect(xml).not.toContain("別表３　防災センター従事者一覧表");
    expect(xml).not.toContain("別表４　防火管理業務の委託状況表");
    expect(tblCount).toBe(0);
  });

  // ── Cover subtitle ───────────────────────────────────────────

  it("cover subtitle is 【一般用】 (yokohama Step 2 design)", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【一般用】");
  });
});
