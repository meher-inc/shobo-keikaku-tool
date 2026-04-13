import { describe, it, expect } from "vitest";
import { determineIndent } from "../builders/paragraph";

describe("determineIndent", () => {
  it("marks ⑴ items as indent=0 but sets nextState=420", () => {
    const r = determineIndent("⑴　収容人員の管理", 0);
    expect(r.indent).toBe(0);
    expect(r.nextState).toBe(420);
  });

  it("marks katakana/circled-number markers as indent=420", () => {
    // ア marker (leading 　 stripped)
    expect(determineIndent("　ア　日常的に行う検査は", 0).indent).toBe(420);
    // ① marker (tokyo style)
    expect(determineIndent("　①　避難施設に物品等を置かない", 0).indent).toBe(420);
    // (ア) parenthesized marker
    expect(determineIndent("　　(ア)「火気関係」のチェック", 0).indent).toBe(420);
  });

  it("inherits state=420 for 　 continuation after ⑴ item", () => {
    // Simulates: ⑴ header (state→420) then 　continuation
    const r = determineIndent("　防火管理者は、収容能力を把握し", 420);
    expect(r.indent).toBe(420);
  });

  it("inherits state=0 for section-first 　 line (no false positive)", () => {
    // ch7-security body starts at state=0, first line is 　休日...
    const r = determineIndent("　休日、夜間において無人となる場合は", 0);
    expect(r.indent).toBe(0);
  });

  it("resets state to 0 for plain text without markers", () => {
    const r = determineIndent("この計画を適用する者の範囲は", 420);
    expect(r.indent).toBe(0);
    expect(r.nextState).toBe(0);
  });
});
