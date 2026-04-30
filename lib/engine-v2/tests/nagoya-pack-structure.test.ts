import { describe, it, expect } from "vitest";
import { loadPack } from "../engine";
import nagoyaCityFull from "../templates/nagoya-city.full.json";

/**
 * Phase 2A Step 5 structure tests for nagoya-city.full.json.
 *
 * Phase 2A Step 3 の smoke test (nagoya-full-smoke.test.ts) は docx 生成
 * end-to-end の結合検証だが、本 structure test は **pack metadata 単体の
 * 構造検証** に特化:
 *   - JSON schema validity (loadPack 経由の zod parse)
 *   - 章 / 節数の数値検証 (recon §3 + Step 1 commit message と整合)
 *   - placeholder 命名規約 (camelCase enforcement)
 *   - gating 対象 section ID 存在検証 (Option B 機能別擬似章 8 章構造)
 *   - 名古屋独自 section ID (第9-10条 東海地震・警戒宣言) の存在検証
 *
 * Phase 2A Step 5 範囲: nagoya 単独 pack の構造検証 (6 tests)。
 * 他 dept (osaka/yokohama/fukuoka) にも同種の structure tests を追加すべき
 * かは Phase 2B の dept-symmetry refactor タスク候補として申し送り。
 */

describe("nagoya-city.full.json structure", () => {
  it("loads via loadPack without throwing (zod schema valid)", () => {
    const loaded = loadPack(nagoyaCityFull);
    expect(loaded.deptName).toBe("名古屋市消防局");
    expect(loaded.deptId).toBe("nagoya-city");
    expect(loaded.scale).toBe("medium");
    expect(loaded.version).toBe("2.0.0-nagoya-full");
  });

  it("has 9 chapters (Option B 機能別擬似章 8 + 附則)", () => {
    const loaded = loadPack(nagoyaCityFull);
    expect(loaded.chapters).toHaveLength(9);
    // 8 functional chapters (第1〜第8) + 附則
    expect(loaded.chapters[0].id).toBe("ch1-general");
    expect(loaded.chapters[4].id).toBe("ch5-warning"); // 名古屋独自
    expect(loaded.chapters[7].id).toBe("ch8-outsource"); // 委託 gating 対象
    expect(loaded.chapters[8].id).toBe("ch-supplementary"); // 附則
  });

  it("has 14 sections total (条 13 + 附則 1)", () => {
    const loaded = loadPack(nagoyaCityFull);
    const total = loaded.chapters.reduce((sum, c) => sum + c.sections.length, 0);
    expect(total).toBe(14);
  });

  it("has 8 unique camelCase placeholder keys", () => {
    const loaded = loadPack(nagoyaCityFull);
    const keys = new Set<string>();
    for (const c of loaded.chapters) {
      for (const s of c.sections) {
        for (const n of s.body) {
          if (n.type === "placeholder") keys.add(n.key);
        }
      }
    }
    expect(keys.size).toBe(8);
    // すべて camelCase (^[a-z][a-zA-Z0-9]*$) を満たす
    const camelRe = /^[a-z][a-zA-Z0-9]*$/;
    for (const k of keys) {
      expect(k, `placeholder key not camelCase: ${k}`).toMatch(camelRe);
    }
    // 期待される 8 keys (Step 1 commit 505229b で確定)
    const expected = [
      "companyName",
      "evacuationSite",
      "inspectionCompany",
      "managerName",
      "outsourceCompany",
      "ownerName",
      "planStartDate",
      "reportFrequency",
    ];
    expect([...keys].sort()).toEqual(expected.sort());
  });

  it("contains art13-outsource gating section in ch8 (osaka/fukuoka 同型)", () => {
    const loaded = loadPack(nagoyaCityFull);
    const ch8 = loaded.chapters.find((c) => c.id === "ch8-outsource");
    expect(ch8).toBeDefined();
    expect(ch8?.title).toBe("第８章　防火管理業務の一部委託");
    const art13 = ch8?.sections.find((s) => s.id === "art13-outsource");
    expect(art13).toBeDefined();
    expect(art13?.heading).toContain("第13条");
  });

  it("contains art9-tokai-info + art10-warning-issued in ch5 (名古屋独自、強化地域該当、無条件 emit 対象)", () => {
    const loaded = loadPack(nagoyaCityFull);
    const ch5 = loaded.chapters.find((c) => c.id === "ch5-warning");
    expect(ch5).toBeDefined();
    expect(ch5?.title).toBe("第５章　警戒宣言発令時の応急対策");
    const art9 = ch5?.sections.find((s) => s.id === "art9-tokai-info");
    const art10 = ch5?.sections.find((s) => s.id === "art10-warning-issued");
    expect(art9).toBeDefined();
    expect(art10).toBeDefined();
    expect(art9?.heading).toContain("東海地震注意情報発表時から警戒宣言が発令されるまでの措置");
    expect(art10?.heading).toContain("警戒宣言発令時の対応策");
  });
});
