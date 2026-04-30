import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/generate-plan
 *
 * Generate a 消防計画 Word document (docx) from form data.
 *
 * Pack selection:
 *   ?pack=full          → kyoto-city full pack (explicit)
 *   ?pack=tokyo-full    → tokyo TFD full pack (explicit)
 *   ?pack=osaka-full    → osaka-city 中・小規模 pack (explicit)
 *   ?pack=yokohama-full → yokohama-city 一般用 pack (explicit)
 *   ?pack=fukuoka-full  → fukuoka-city 中規模防火対象物用 pack (explicit)
 *   ?pack=nagoya-full   → nagoya-city その他用《中規模》 pack (explicit)
 *   ?pack=sample        → kyoto-city sample (ch1 only, dev use)
 *   (no pack param)     → auto-select based on form.prefecture:
 *                          東京都   → tokyo-full
 *                          大阪府   → osaka-full
 *                          神奈川県 → yokohama-full
 *                          福岡県   → fukuoka-full
 *                          愛知県   → nagoya-full
 *                          else     → full (kyoto fallback)
 *
 * 対応都市カバレッジ (Tier 1 完成、6 都市並び):
 *   京都市・東京消防庁・大阪市消防局・横浜市消防局・福岡市消防局・名古屋市消防局
 *
 * The `engine` query param is accepted but ignored (v2 is the
 * only engine — v1 was retired).
 *
 * TODO(Phase 2B): VALID_PACKS const + selectPackByPrefecture() 関数の
 *                 抽出リファクタ。Tier 1 完成 (6 都市) で inline ternary
 *                 が 6-way になり可読性が低下、Phase 2B 序盤での実施候補。
 */
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const form = await request.json();

    // ── pack selection ───────────────────────────────────────
    const packParam = url.searchParams.get("pack");
    let pack: string;

    if (
      packParam === "full" ||
      packParam === "tokyo-full" ||
      packParam === "osaka-full" ||
      packParam === "yokohama-full" ||
      packParam === "fukuoka-full" ||
      packParam === "nagoya-full" ||
      packParam === "sample"
    ) {
      // Explicit pack from query string.
      pack = packParam;
    } else {
      // Auto-select from form data (same routing logic as v1's
      // city/prefecture dispatch at the former L98-113).
      const prefecture = form.prefecture || "";
      pack =
        prefecture === "東京都" ? "tokyo-full"
        : prefecture === "大阪府" ? "osaka-full"
        : prefecture === "神奈川県" ? "yokohama-full"
        : prefecture === "福岡県" ? "fukuoka-full"
        : prefecture === "愛知県" ? "nagoya-full"
        : "full";
    }

    // ── generate ─────────────────────────────────────────────
    const { runV2Adapter } = await import(
      "../../../lib/engine-v2/adapters/generate-plan"
    );
    const buffer = await runV2Adapter(form, {
      pack: pack as
        | "sample"
        | "full"
        | "tokyo-full"
        | "osaka-full"
        | "yokohama-full"
        | "fukuoka-full"
        | "nagoya-full",
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
