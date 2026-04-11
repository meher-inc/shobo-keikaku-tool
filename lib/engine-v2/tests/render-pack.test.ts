import { describe, it, expect } from "vitest";
import { loadPack, renderPack } from "../engine";
import samplePack from "../packs/kyoto-city.sample.json";

describe("renderPack", () => {
  it("returns a non-empty Buffer for the kyoto-city sample pack", async () => {
    const pack = loadPack(samplePack);
    const buf = await renderPack(pack, { buildingName: "テストビル" });
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
  });

  it("produces a file starting with the ZIP signature (docx = zip)", async () => {
    const pack = loadPack(samplePack);
    const buf = await renderPack(pack, { buildingName: "テストビル" });
    // docx files are ZIP archives; first 4 bytes must be 50 4B 03 04.
    expect(buf[0]).toBe(0x50);
    expect(buf[1]).toBe(0x4b);
    expect(buf[2]).toBe(0x03);
    expect(buf[3]).toBe(0x04);
  });
});
