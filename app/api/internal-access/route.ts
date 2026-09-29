import { NextRequest, NextResponse } from "next/server";
import { getInternalSessionEmail } from "@/lib/internal-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const email = await getInternalSessionEmail(request);

  return NextResponse.json(
    { internal: Boolean(email) },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
