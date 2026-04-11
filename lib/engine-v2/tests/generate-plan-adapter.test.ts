import { describe, it, expect } from "vitest";
import { runV2Adapter } from "../adapters/generate-plan";

describe("runV2Adapter", () => {
  it("returns a non-empty docx Buffer for a minimal form", async () => {
    const buf = await runV2Adapter({ building_name: "テストビル" });

    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
    // docx files are zip archives; first 4 bytes must be 50 4B 03 04.
    expect(buf[0]).toBe(0x50);
    expect(buf[1]).toBe(0x4b);
    expect(buf[2]).toBe(0x03);
    expect(buf[3]).toBe(0x04);
  });
});
