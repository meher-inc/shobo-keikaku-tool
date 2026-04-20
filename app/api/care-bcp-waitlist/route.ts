import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "../../../lib/supabase";
import type { CareBcpWaitlistCreateInput } from "../../../types/care-bcp-waitlist";

const bodySchema = z.object({
  email: z.string().email(),
  facility_name: z.string().min(1).max(200),
  facility_type: z.enum(["tsusho", "nyusho", "houmon", "tasyou", "sonota"]),
  region: z.string().max(100).optional(),
  source: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const input: CareBcpWaitlistCreateInput = parsed.data;

    const { data, error } = await supabaseAdmin
      .from("care_bcp_waitlist")
      .insert({
        email: input.email,
        facility_name: input.facility_name,
        facility_type: input.facility_type,
        region: input.region ?? null,
        source: input.source ?? null,
      })
      .select("id, email, facility_name, created_at")
      .single();

    if (error) {
      // UNIQUE(email, facility_name) 違反 → 冪等扱いで 200
      if (error.code === "23505") {
        console.info("[care-bcp-waitlist] duplicate (idempotent):", {
          email: input.email,
          facility_name: input.facility_name,
        });
        return NextResponse.json(
          { received: true, duplicate: true },
          { status: 200 }
        );
      }

      console.error("[care-bcp-waitlist] supabase insert error:", {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    // TODO(Resend): 自動返信メール送信（次タスクで実装）
    // await sendCareBcpWaitlistConfirmation({
    //   to: input.email,
    //   facilityName: input.facility_name,
    // });

    console.info("[care-bcp-waitlist] registered:", {
      id: data.id,
      email: data.email,
    });

    return NextResponse.json(
      { received: true, id: data.id },
      { status: 201 }
    );
  } catch (e) {
    console.error("[care-bcp-waitlist] unexpected error:", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
