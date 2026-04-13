import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate-plan
 *
 * Generate a 消防計画 Word document (docx) from form data.
 *
 * Pack selection:
 *   ?pack=full        → kyoto-city full pack (explicit)
 *   ?pack=tokyo-full  → tokyo TFD full pack (explicit)
 *   ?pack=sample      → kyoto-city sample (ch1 only, dev use)
 *   (no pack param)   → auto-select based on form.prefecture:
 *                        東京都 → tokyo-full, else → full (kyoto)
 *
 * The `engine` query param is accepted but ignored (v2 is the
 * only engine — v1 was retired).
 */
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const form = await request.json();

    // ── pack selection ───────────────────────────────────────
    const packParam = url.searchParams.get("pack");
    let pack: string;

    if (packParam === "full" || packParam === "tokyo-full" || packParam === "sample") {
      // Explicit pack from query string.
      pack = packParam;
    } else {
      // Auto-select from form data (same routing logic as v1's
      // city/prefecture dispatch at the former L98-113).
      const prefecture = form.prefecture || "";
      pack = prefecture === "東京都" ? "tokyo-full" : "full";
    }

    // ── generate ─────────────────────────────────────────────
    const { runV2Adapter } = await import(
      "../../../lib/engine-v2/adapters/generate-plan"
    );
    const buffer = await runV2Adapter(form, {
      pack: pack as "sample" | "full" | "tokyo-full",
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          `消防計画_${form.building_name || "untitled"}.docx`
        )}`,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "unknown error";
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "消防計画の生成に失敗しました: " + message },
      { status: 500 }
    );
  }
}
