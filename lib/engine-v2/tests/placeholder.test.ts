import { describe, it, expect } from "vitest";
import { resolveNode, type RenderData } from "../helpers/placeholder";
import type { BodyNode } from "../types/template-pack";

describe("resolveNode", () => {
  it("returns the literal value for a text node", () => {
    const node: BodyNode = { type: "text", value: "hello" };
    expect(resolveNode(node, {})).toBe("hello");
  });

  it("substitutes a placeholder with the matching data value", () => {
    const node: BodyNode = {
      type: "placeholder",
      key: "name",
      fallback: "(unknown)",
    };
    const data: RenderData = { name: "Alice" };
    expect(resolveNode(node, data)).toBe("Alice");
  });

  it("falls back when the data map has no value for the key", () => {
    const node: BodyNode = {
      type: "placeholder",
      key: "name",
      fallback: "(unknown)",
    };
    expect(resolveNode(node, {})).toBe("(unknown)");
  });
});
