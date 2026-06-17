import { NextRequest, NextResponse } from "next/server";
import { selectPackByLocation } from "../../../lib/engine-v2/city-dispatch";

/**
 * POST /api/generate-plan
 *
 * Generate a 消防計画 Word document (docx) from form data.
 *
 * Pack selection:
 *   ?pack=<name>        → 明示指定（full / tokyo-full / osaka-full / … / sample）
 *   (no pack param)     → フォームの都道府県・市から自動選択。
 *                          ルーティングは lib/engine-v2/city-dispatch.ts の
 *                          selectPackByLocation() に集約（旧 inline ternary を抽出）。
 *                          政令市は「市」単位で判定し、対応エリア外（浜松等）は
 *                          "full"（京都ベース標準様式）へフォールバックする。
 *                          app/page.tsx の deptName（所轄ラベル）と判定基準を一致させている。
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

    if (
      packParam === "full" ||
      packParam === "tokyo-full" ||
      packParam === "osaka-full" ||
      packParam === "yokohama-full" ||
      packParam === "fukuoka-full" ||
      packParam === "nagoya-full" ||
      packParam === "sapporo-full" ||
      packParam === "kawasaki-full" ||
      packParam === "kobe-full" ||
      packParam === "saitama-full" ||
      packParam === "sakai-full" ||
      packParam === "hiroshima-full" ||
      packParam === "sendai-full" ||
      packParam === "chiba-full" ||
      packParam === "kitakyushu-full" ||
      packParam === "niigata-full" ||
      packParam === "kumamoto-full" ||
      packParam === "sagamihara-full" ||
      packParam === "shizuoka-full" ||
      packParam === "okayama-full" ||
      packParam === "sample"
    ) {
      // Explicit pack from query string.
      pack = packParam;
    } else {
      // Auto-select from form data. ルーティングは city-dispatch.ts に集約。
      pack = selectPackByLocation(form.prefecture || "", form.city || "");
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
        | "nagoya-full"
        | "sapporo-full"
        | "kawasaki-full"
        | "kobe-full"
        | "saitama-full"
        | "sakai-full"
        | "hiroshima-full"
        | "sendai-full"
        | "chiba-full"
        | "kitakyushu-full"
        | "niigata-full"
        | "kumamoto-full"
        | "sagamihara-full"
        | "shizuoka-full"
        | "okayama-full",
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
