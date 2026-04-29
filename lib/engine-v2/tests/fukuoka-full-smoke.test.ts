import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { buildFukuokaFull } from "../adapters/fukuoka-full";

/**
 * Phase 2A Step 4 smoke tests for the Fukuoka 中規模防火対象物用 v2 path.
 *
 * Drives buildFukuokaFull end-to-end (form → toRenderData →
 * extendForFukuoka → loadPack → filterPack → buildCoverPage →
 * buildChildrenFromPack → buildFukuokaAppendix*… → Document →
 * Packer.toBuffer → unzip → word/document.xml string + structural
 * assertions).
 *
 * Following Step 4d Phase1 教訓: chapter title / appendix heading
 * string presence is checked alongside <w:tbl> table counts so that
 * gating regressions are caught structurally, not just via text.
 *
 * Test matrix (10 tests = 主要 5 (F1–F5) + 補助 5):
 *   F1 baseline    — all flags false, plan=light (minimum case)
 *   F2 outsource   — hasOutsourcedManagement=true (2-gate sync verify)
 *   F3 unified-fpm — requiresUnifiedFpm=true
 *   F4 all-on      — every flag true (composite gating)
 *   F5 standard    — plan=standard, no body-gating flags
 *                    (include_appendix gating verify)
 */

const ZIP_MAGIC = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

/** Detect ONLY the 別表3 appendix heading (not the body reference).
 * Appendix heading format: "別表３　自衛消防隊の編成と任務"
 * Body reference (第24条) format: "別表3のとおり"
 * Only the appendix uses 別表[3-zenkaku] + 全角スペース prefix.
 * Heading uses zenkaku 3 (３) per appendixHeading helper.
 */
const APPENDIX3_HEADING_RE = /別表[3３]　自衛消防隊の編成と任務/;

async function renderAndUnzip(formOverrides: Record<string, unknown> = {}) {
  const form = {
    building_name: "テストビル福岡",
    creation_date_iso: "2026-04-30",
    leader_name: "山田太郎",
    defense_sub_leader: "副隊長氏名",
    tsuhou_member: "佐藤花子",
    shoka_member: "鈴木一郎",
    hinan_member: "高橋次郎",
    kyugo_member: "田中美咲",
    anzen_member: "渡辺健太",
    ...formOverrides,
  };

  const buf = await buildFukuokaFull(form);
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

describe("fukuoka 中規模防火対象物用 v2 smoke tests", () => {
  // ── Auxiliary 1: chapter ordering (第1〜第5章) ────────────────

  it("contains all chapter titles in 第１章〜第５章 order", async () => {
    const { xml } = await renderAndUnzip();
    const titles = [
      "第１章　総則",
      "第２章　予防管理対策",
      "第３章　自衛消防活動対策",
      "第４章　地震対策",
      "第５章　防災教育及び訓練等",
    ];
    let lastIdx = -1;
    for (const t of titles) {
      const idx = xml.indexOf(t);
      expect(idx, `missing chapter title: ${t}`).toBeGreaterThanOrEqual(0);
      expect(idx, `wrong order at: ${t}`).toBeGreaterThan(lastIdx);
      lastIdx = idx;
    }
  });

  // ── Auxiliary 2: 第5条(11) + 第25条 inline 無条件 emit ─────────

  it("第5条(11) 統括 inline + 第25条 自衛消防隊長 inline are emitted unconditionally", async () => {
    // baseline: all flags false (still includes inline references in body)
    const { xml } = await renderAndUnzip();
    // 第5条 (11) 統括防火管理者への報告 — body of ch1-art5-manager
    expect(xml).toContain("（11）統括防火管理者への報告");
    // 第25条 自衛消防隊長 — body of ch3-art25-jieishobo-leader
    expect(xml).toContain("自衛消防隊長は，自衛消防隊の機能");
    expect(xml).toContain("消防隊との連携を密に");
  });

  // ── Auxiliary 3: 帰宅困難者条文の非存在（守り、osaka 同型）────

  it("does NOT contain 帰宅困難者 article (fukuoka-specific absence vs tokyo/yokohama)", async () => {
    // tokyo (帰宅困難者対策章) and yokohama (第36条 / 第45条) have
    // 帰宅困難者-named articles; fukuoka does not (recon §4.1 confirmed).
    // The absence is a recon-confirmed differentiator.
    const { xml } = await renderAndUnzip({
      has_outsourced_management: true,
      requires_unified_fpm: true,
    });
    expect(xml).not.toContain("帰宅困難者");
  });

  // ── Auxiliary 4: cover subtitle ───────────────────────────────

  it("cover subtitle is 【中規模防火対象物用】 (fukuoka Step 2 design)", async () => {
    const { xml } = await renderAndUnzip();
    expect(xml).toContain("【中規模防火対象物用】");
  });

  // ── Auxiliary 5: 別表3 副隊長行 独自性（osaka 別表9 との差分）──

  it("別表3 副隊長 row is fukuoka-specific (osaka 別表9 has no 副隊長 row)", async () => {
    const { xml } = await renderAndUnzip();
    // 別表3 must be emitted (default plan=standard)
    expect(xml).toMatch(APPENDIX3_HEADING_RE);
    // 副隊長 column (fukuoka-only, defenseSubLeader placeholder)
    expect(xml).toContain("副隊長");
    expect(xml).toContain("副隊長氏名");
    // fukuoka uses 係 naming; osaka uses 班. Verify 係 is present.
    expect(xml).toContain("通報連絡係");
    expect(xml).toContain("救護係");
  });

  // ── F1: baseline (plan=light, all flags false) ────────────────

  it("F1 baseline (plan=light × all flags false): minimum doc, no appendix", async () => {
    const { xml, tblCount } = await renderAndUnzip({ plan: "light" });
    // body: 第3条 + 第19条 hidden
    expect(xml).not.toContain("第３条　委託状況等");
    expect(xml).not.toContain("第１９条　統括防火管理者への報告");
    // body: ch1-art5 + ch3-art25 inline references still emitted
    expect(xml).toContain("（11）統括防火管理者への報告");
    expect(xml).toContain("自衛消防隊長は，自衛消防隊の機能");
    // appendix: completely suppressed
    expect(xml).not.toContain("別表等一覧");
    expect(xml).not.toMatch(APPENDIX3_HEADING_RE);
    expect(xml).not.toContain("別表１　火災予防のための組織編成");
    expect(xml).not.toContain("別表２　自主点検を実施するための組織編成表");
    expect(xml).not.toContain("別記様式　防火・防災管理業務の委託状況表");
    expect(tblCount).toBe(0);
  });

  // ── F2: outsourced=true (2-gate consistency: 第3条 + 別記様式 同期) ──

  it("F2 outsourced=true: 第3条 body + 別記様式 appendix emit synchronously (2-gate sync)", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      has_outsourced_management: true,
      outsource_company: "テスト警備株式会社",
    });
    // body gate: 第3条 委託状況等 emit
    expect(xml).toContain("第３条　委託状況等");
    expect(xml).toContain("別記様式のとおりとする");
    // appendix gate: 別記様式 emit + outsourceCompany fill
    expect(xml).toContain("別記様式　防火・防災管理業務の委託状況表");
    expect(xml).toContain("テスト警備株式会社");
    // 第19条 still hidden
    expect(xml).not.toContain("第１９条　統括防火管理者への報告");
    // tbl: 1 (list) + 1 (別表3) + 1 (別記様式) = 3
    expect(tblCount).toBe(3);
  });

  // ── F3: requires_unified_fpm=true ─────────────────────────────

  it("F3 unified_fpm=true: 第19条 emit (yokohama-style independent article gating)", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      requires_unified_fpm: true,
    });
    // 第19条 emit
    expect(xml).toContain("第１９条　統括防火管理者への報告");
    expect(xml).toContain("不備・欠陥部分の改修計画及び改修結果を統括防火管理者に報告");
    // 第3条 + 別記様式 hidden
    expect(xml).not.toContain("第３条　委託状況等");
    expect(xml).not.toContain("別記様式　防火・防災管理業務の委託状況表");
    // tbl: 1 (list) + 1 (別表3) = 2 (no 別記様式 since !outsourced)
    expect(tblCount).toBe(2);
  });

  // ── F4: all flags on (composite gating) ───────────────────────

  it("F4 all flags true: every gated body + appendix is present", async () => {
    const { xml, tblCount } = await renderAndUnzip({
      has_outsourced_management: true,
      outsource_company: "テスト警備株式会社",
      requires_unified_fpm: true,
    });
    // body
    expect(xml).toContain("第３条　委託状況等");
    expect(xml).toContain("第１９条　統括防火管理者への報告");
    // appendix
    expect(xml).toContain("別表等一覧");
    expect(xml).toMatch(APPENDIX3_HEADING_RE);
    expect(xml).toContain("別記様式　防火・防災管理業務の委託状況表");
    // tbl: 1 (list) + 1 (別表3) + 1 (別記様式) = 3
    expect(tblCount).toBe(3);
  });

  // ── F5: plan=standard × all flags false (include_appendix verify) ──

  it("F5 plan=standard × no body flags: appendix list + 別表3 emit, 別記様式 hidden", async () => {
    const { xml, tblCount } = await renderAndUnzip();
    // body: still no body gating active
    expect(xml).not.toContain("第３条　委託状況等");
    expect(xml).not.toContain("第１９条　統括防火管理者への報告");
    // appendix: list + 別表1/2 stubs + 別表3 FULL emitted
    expect(xml).toContain("別表等一覧");
    expect(xml).toContain("別表１　火災予防のための組織編成");
    expect(xml).toContain("別表２　自主点検を実施するための組織編成表");
    expect(xml).toMatch(APPENDIX3_HEADING_RE);
    // 別記様式 hidden (gated by hasOutsourcedManagement)
    expect(xml).not.toContain("別記様式　防火・防災管理業務の委託状況表");
    // 別表3 placeholders filled with default form data
    expect(xml).toContain("山田太郎");
    expect(xml).toContain("佐藤花子");
    // tbl: 1 (list) + 1 (別表3) = 2 (stubs are plainText, no tbl contribution)
    expect(tblCount).toBe(2);
  });
});
