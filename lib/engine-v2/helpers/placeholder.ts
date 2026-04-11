import type { BodyNode } from "../types/template-pack";

/**
 * Input data map passed to the renderer. Keys match PlaceholderNode.key.
 * undefined means "not provided" (fall back).
 */
export type RenderData = Record<string, string | undefined>;

/**
 * Resolve a single body node to a plain string.
 *
 * - text nodes return their literal value.
 * - placeholder nodes prefer data[key], then node.fallback, then "".
 *   An empty-string value in data is treated the same as undefined
 *   (i.e. falls through to fallback) so callers can pass "" without
 *   accidentally erasing a meaningful fallback.
 */
export function resolveNode(node: BodyNode, data: RenderData): string {
  if (node.type === "text") {
    return node.value;
  }
  const supplied = data[node.key];
  if (supplied !== undefined && supplied !== "") {
    return supplied;
  }
  if (node.fallback !== undefined) {
    return node.fallback;
  }
  return "";
}

/**
 * Resolve an array of body nodes and concatenate the result.
 */
export function resolveBody(body: BodyNode[], data: RenderData): string {
  return body.map((node) => resolveNode(node, data)).join("");
}
