import { NextRequest, NextResponse } from "next/server";
import {
  generateNationalDocument,
  NATIONAL_PACK_NAMES,
  UnknownNationalPackError,
} from "@/lib/engine-v2/adapters/generate-national";
import type { NationalFormData } from "@/lib/engine-v2/types/national-form-pack";
import { SESSION_COOKIE_NAME, verifyToken } from "@/lib/session-token";
import { checkAccess } from "@/lib/national-access";

export const runtime = "nodejs";

interface PostBody {
  packName?: string;
  form?: NationalFormData;
}

// 3rd of 3 access guards. middleware と server component を通過しても
// 念のため API レイヤで再検証する (defense-in-depth)。
async function authorize(req: NextRequest): Promise<NextResponse | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { error: "ログインが必要です。", code: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }
  const verified = await verifyToken(token, "session");
  if (!verified.ok) {
    return NextResponse.json(
      { error: "セッションが無効です。再ログインしてください。", code: "INVALID_SESSION" },
      { status: 401 }
    );
  }
  const decision = await checkAccess(verified.payload.email);
  if (!decision.allowed) {
    return NextResponse.json(
      {
        error: "有効なサブスクリプション契約が必要です。",
        code: "SUBSCRIPTION_REQUIRED",
        reason: decision.reason,
      },
      { status: 403 }
    );
  }
  return null;
}

export async function POST(req: NextRequest) {
  const denied = await authorize(req);
  if (denied) return denied;
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { packName, form } = body;

  if (!packName || typeof packName !== "string") {
    return NextResponse.json(
      { error: "packName is required", allowed: NATIONAL_PACK_NAMES },
      { status: 400 }
    );
  }

  if (!form || typeof form !== "object" || Array.isArray(form)) {
    return NextResponse.json({ error: "form is required" }, { status: 400 });
  }

  try {
    const buffer = await generateNationalDocument(packName, form);
    // Node Buffer → Blob 経由で NextResponse の BodyInit 型に揃える
    const body = new Blob([new Uint8Array(buffer)]);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${packName}.docx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof UnknownNationalPackError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[generate-national] error:", err);
    return NextResponse.json(
      { error: "書類生成に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const denied = await authorize(req);
  if (denied) return denied;
  return NextResponse.json({ packs: NATIONAL_PACK_NAMES });
}
