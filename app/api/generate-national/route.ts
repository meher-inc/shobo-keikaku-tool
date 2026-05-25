import { NextRequest, NextResponse } from "next/server";
import {
  generateNationalDocument,
  NATIONAL_PACK_NAMES,
  UnknownNationalPackError,
} from "@/lib/engine-v2/adapters/generate-national";
import type { NationalFormData } from "@/lib/engine-v2/types/national-form-pack";

export const runtime = "nodejs";

interface PostBody {
  packName?: string;
  form?: NationalFormData;
}

export async function POST(req: NextRequest) {
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

export async function GET() {
  return NextResponse.json({ packs: NATIONAL_PACK_NAMES });
}
