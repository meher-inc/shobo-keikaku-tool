import { describe, expect, it } from "vitest";
import { formatDate } from "../date-format";

describe("formatDate (wareki/seireki)", () => {
  it("returns empty string for empty input", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate("", "seireki")).toBe("");
  });

  it("returns non-ISO input unchanged", () => {
    expect(formatDate("自由記述", "wareki")).toBe("自由記述");
    expect(formatDate("2026/5/25", "wareki")).toBe("2026/5/25");
  });

  it("formats reiwa dates (2019-05-01〜)", () => {
    expect(formatDate("2019-05-01", "wareki")).toBe("令和1年5月1日");
    expect(formatDate("2026-05-25", "wareki")).toBe("令和8年5月25日");
    expect(formatDate("2030-12-31", "wareki")).toBe("令和12年12月31日");
  });

  it("formats heisei dates", () => {
    expect(formatDate("2019-04-30", "wareki")).toBe("平成31年4月30日");
    expect(formatDate("1989-01-08", "wareki")).toBe("平成1年1月8日");
    expect(formatDate("1995-06-15", "wareki")).toBe("平成7年6月15日");
  });

  it("formats showa dates", () => {
    expect(formatDate("1989-01-07", "wareki")).toBe("昭和64年1月7日");
    expect(formatDate("1980-01-01", "wareki")).toBe("昭和55年1月1日");
  });

  it("returns ISO unchanged for pre-showa", () => {
    expect(formatDate("1920-01-01", "wareki")).toBe("1920-01-01");
  });

  it("formats seireki", () => {
    expect(formatDate("2026-05-25", "seireki")).toBe("2026年5月25日");
    expect(formatDate("2026-01-01", "seireki")).toBe("2026年1月1日");
  });
});
