import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildNagoyaFull } from "../adapters/nagoya-full";

/**
 * Phase 2A Step 3 smoke tests for the Nagoya その他用《中規模》 v2 path.
 *
 * Drives buildNagoyaFull end-to-end (form → toRenderData →
 * extendForNagoya → loadPack → filterPack → buildCoverPage →
 * buildChildrenFromPack → buildNagoyaAppendix*… → Document →
 * Packer.toBuffer → unzip → word/document.xml string + structural
 * assertions).
 *
 * Following Step 4d Phase1 教訓: chapter title / appendix heading
 * string presence is checked alongside <w:tbl> table counts so that
 * gating regressions are caught structurally, not just via text.
 *
 * Test matrix (10 tests = 主要 5 (N1–N5) + 補助 5):
 *   N1 baseline           — plan=light × all flags false (minimum)
 *   N2 outsource          — hasOutsourcedManagement=true (2-gate sync)
 *   N3 unified-fpm        — requiresUnifiedFpm=true (no-op、設計通り)
 *   N4 tokai-quake        — tokaiQuakeApplicable=true (no-op、設計通り)
 *   N5 standard           — plan=standard × all body flags false
 *                           (include_appendix gating verify)
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

/** Detect ONLY the 別表3 appendix heading.
 * Appendix heading format: "別表３　自衛消防隊の編成と任務"
 * 第7条 body は別表3 の name reference を含まないため、osaka/fukuoka と異なり
 * false positive リスクは低いが、整合性のため osaka/fukuoka と同じ
 * 全角スペース prefix 識別パターンを採用。
 */
const APPENDIX3_HEADING_RE = /別表[3３]　自衛消防隊の編成と任務/;

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    company_name: "テスト株式会社名古屋",
    creation_date_iso: "2026-04-30",
    leader_name: "山田太郎",
    tsuhou_member: "佐藤花子",
    shoka_member: "鈴木一郎",
    hinan_member: "高橋次郎",
    kyugo_member: "田中美咲",
    anzen_member: "渡辺健太",
    evacuation_site: "名古屋テスト公園",
    ...formOverrides,
  };

  const buf = await buildNagoyaFull(form);
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

describe("nagoya その他用《中規模》 v2 smoke tests", () => {
  // ── Auxiliary 1: chapter ordering (第１〜第８章 + 附則) ─────────

  it("contains all chapter titles in 第１〜第８章 + 附則 order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "第１章　総則",
      "第２章　予防管理対策",
      "第３章　自衛消防活動",
      "第４章　震災対策",
      "第５章　警戒宣言発令時の応急対策",
      "第６章　教育訓練",
      "第７章　消防機関への報告、連絡",
      "第８章　防火管理業務の一部委託",
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

  // ── Auxiliary 2: 第9-10条 (東海地震・警戒宣言) 無条件 emit ──────

  it("第9条 東海地震注意情報 + 第10条 警戒宣言は無条件 emit (名古屋独自、強化地域該当)", async () => {
    // baseline: all flags false (still includes 第9-10条 unconditionally)
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("第９条　東海地震注意情報発表時から警戒宣言が発令されるまでの措置");
    expect(xml).toContain("第10条　警戒宣言発令時の対応策");
    expect(xml).toContain("大規模地震対策特別措置法に基づく東海地震に関する警戒宣言");
  });

  // ── Auxiliary 3: 帰宅困難者条文の非存在（守り、osaka/fukuoka 同型）──

  it("does NOT contain 帰宅困難者 article (nagoya-specific absence vs tokyo/yokohama)", async () => {
    // tokyo (帰宅困難者対策章) and yokohama (第36条 / 第45条) have
    // 帰宅困難者-named articles; nagoya does not (recon §4.1 confirmed).
    // The absence is a recon-confirmed differentiator.
    const { xml } = await renderAndUnzip({
      has_outsourced_management: true,
      requires_unified_fpm: true,
      tokai_quake_applicable: true,
    });
    expect(xml).not.toContain("帰宅困難者");
  });

  // ── Auxiliary 4: cover subtitle ───────────────────────────────

  it("cover subtitle is 【中規模防火対象物用】 (5 dept 統一、claude.ai 判断 9-1)", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【中規模防火対象物用】");
  });

  // ── Auxiliary 5: 別表3 隊長行 placeholder fill (osaka 別表9 同型) ──

  it("別表3 隊長 row uses leaderName placeholder (osaka 別表9 同型 cross-dept reuse)", async () => {
    const { xml } = await renderAndUnzip();
    // 別表3 must be emitted (default plan=standard)
    expect(xml).toMatch(APPENDIX3_HEADING_RE);
    // 隊長 + leaderName placeholder fill (osaka/fukuoka と完全共通命名)
    expect(xml).toContain("隊長");
    expect(xml).toContain("山田太郎");
    // nagoya は班 naming (osaka 同じ、fukuoka の係 とは異なる)
    expect(xml).toContain("通報連絡班");
    expect(xml).toContain("救護班");
  });

  // ── N1: baseline (plan=light × all flags false) ──────────────

  it("N1 baseline (plan=light × all flags false): minimum doc, no appendix", async () => {
    const { xml, tblCount } = await renderAndUnzip({ plan: "light" });
    // body: 第13条 hidden (gated by !outsourced)
    expect(xml).not.toContain("第13条　防火管理業務の一部委託");
    // body: 第9-10条 still unconditional
    expect(xml).toContain("第９条　東海地震注意情報発表時から警戒宣言が発令されるまでの措置");
    // appendix: completely suppressed
    expect(xml).not.toContain("別表等一覧");
    expect(xml).not.toMatch(APPENDIX3_HEADING_RE);
    expect(xml).not.toContain("別表１　予防管理組織編成");
    expect(xml).not.toContain("別表２　自主点検チェックリスト");
    expect(xml).not.toContain("別記様式　防火管理業務の委託状況票");
    expect(tblCount).toBe(0);
  });

  // ── N2: outsourced=true (2-gate consistency: 第13条 + 別記様式 同期) ──

  it("N2 outsourced=true: 第13条 body + 別記様式 appendix emit synchronously (2-gate sync)", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      has_outsourced_management: true,
      outsource_company: "○○ビル管理会社",
    });
    // body gate: 第13条 emit
    expect(xml).toContain("第13条　防火管理業務の一部委託");
    expect(xml).toContain("○○ビル管理会社");
    // appendix gate: 別記様式 emit
    expect(xml).toContain("別記様式　防火管理業務の委託状況票");
    // tbl: 1 (list) + 1 (別表3) + 1 (別記様式) = 3
    expect(tblCount).toBe(3);
  });

  // ── N3: requiresUnifiedFpm=true (no-op, Phase 2A 設計通り) ─────

  it("N3 unified_fpm=true: no-op (Phase 2A 範囲では gating 対象 section なし)", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      requires_unified_fpm: true,
    });
    // 第13条 hidden
    expect(xml).not.toContain("第13条　防火管理業務の一部委託");
    // 第9-10条 unconditional
    expect(xml).toContain("第９条　東海地震注意情報発表時から警戒宣言が発令されるまでの措置");
    // appendix: 別表等一覧 + 別表1/2 stubs + 別表3 emit、別記様式 hidden
    expect(xml).toContain("別表等一覧");
    expect(xml).toMatch(APPENDIX3_HEADING_RE);
    expect(xml).not.toContain("別記様式　防火管理業務の委託状況票");
    // tbl: 1 (list) + 1 (別表3) = 2
    expect(tblCount).toBe(2);
  });

  // ── N4: tokaiQuakeApplicable=true (no-op, 第9-10条 既に無条件 emit) ──

  it("N4 tokai_quake_applicable=true: no-op (第9-10条 は既に無条件 emit、将来予約フラグ)", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      tokai_quake_applicable: true,
    });
    // 第9-10条 unconditional emit (no change vs N1)
    expect(xml).toContain("第９条　東海地震注意情報発表時から警戒宣言が発令されるまでの措置");
    expect(xml).toContain("第10条　警戒宣言発令時の対応策");
    // 第13条 + 別記様式 hidden
    expect(xml).not.toContain("第13条　防火管理業務の一部委託");
    expect(xml).not.toContain("別記様式　防火管理業務の委託状況票");
    // tbl: 1 (list) + 1 (別表3) = 2 (フラグは将来予約のため tbl 影響なし)
    expect(tblCount).toBe(2);
  });

  // ── N5: plan=standard × all body flags false (include_appendix verify) ──

  it("N5 plan=standard × no body flags: appendix list + 別表3 emit, 別記様式 hidden", async () => {
    const { xml, tblCount } = await renderAndUnzip();
    // body: 第13条 hidden
    expect(xml).not.toContain("第13条　防火管理業務の一部委託");
    // body: 第9-10条 unconditional
    expect(xml).toContain("第９条　東海地震注意情報発表時から警戒宣言が発令されるまでの措置");
    // appendix: list + 別表1/2 stubs + 別表3 FULL emitted, 別記様式 hidden
    expect(xml).toContain("別表等一覧");
    expect(xml).toContain("別表１　予防管理組織編成");
    expect(xml).toContain("別表２　自主点検チェックリスト");
    expect(xml).toMatch(APPENDIX3_HEADING_RE);
    expect(xml).not.toContain("別記様式　防火管理業務の委託状況票");
    // 別表3 placeholders filled with default form data
    expect(xml).toContain("山田太郎");
    expect(xml).toContain("佐藤花子");
    // tbl: 1 (list) + 1 (別表3) = 2 (stubs are plainText, no tbl contribution)
    expect(tblCount).toBe(2);
  });
});
